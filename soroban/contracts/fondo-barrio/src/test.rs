use soroban_sdk::{
    contract, contractimpl, contracttype,
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env, String,
};

use crate::{Error, FondoBarrio, FondoBarrioClient};

const BPS: u32 = 3_000;

#[contract]
struct CampaniaMock;

#[contracttype]
#[derive(Clone)]
enum ClaveMock {
    Guardian(Address),
}

#[contractimpl]
impl CampaniaMock {
    pub fn es_guardian(env: Env, direccion: Address) -> bool {
        env.storage()
            .instance()
            .get(&ClaveMock::Guardian(direccion))
            .unwrap_or(false)
    }

    pub fn marcar_guardian(env: Env, direccion: Address, valor: bool) {
        env.storage()
            .instance()
            .set(&ClaveMock::Guardian(direccion), &valor);
    }
}

struct Escenario<'a> {
    env: Env,
    contrato: FondoBarrioClient<'a>,
    token: TokenClient<'a>,
    token_admin: StellarAssetClient<'a>,
    campania: CampaniaMockClient<'a>,
    artista: Address,
}

fn escenario<'a>() -> Escenario<'a> {
    escenario_con_bps(BPS)
}

fn escenario_con_bps<'a>(bps: u32) -> Escenario<'a> {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let artista = Address::generate(&env);
    let token_id = env
        .register_stellar_asset_contract_v2(Address::generate(&env))
        .address();
    let campania_id = env.register(CampaniaMock, ());
    let id = env.register(
        FondoBarrio,
        (
            admin.clone(),
            token_id.clone(),
            campania_id.clone(),
            artista.clone(),
            bps,
        ),
    );
    Escenario {
        contrato: FondoBarrioClient::new(&env, &id),
        token: TokenClient::new(&env, &token_id),
        token_admin: StellarAssetClient::new(&env, &token_id),
        campania: CampaniaMockClient::new(&env, &campania_id),
        env,
        artista,
    }
}

impl Escenario<'_> {
    fn cuenta_con_saldo(&self, monto: i128) -> Address {
        let cuenta = Address::generate(&self.env);
        self.token_admin.mint(&cuenta, &monto);
        cuenta
    }

    fn guardian(&self) -> Address {
        let guardian = Address::generate(&self.env);
        self.campania.marcar_guardian(&guardian, &true);
        guardian
    }

    fn cid(&self, texto: &str) -> String {
        String::from_str(&self.env, texto)
    }
}

#[test]
#[should_panic]
fn constructor_rechaza_bps_mayor_a_total() {
    let _ = escenario_con_bps(10_001);
}

#[test]
fn vender_lamina_reparte_exacto_en_montos_chicos_e_impares() {
    let e = escenario();
    for monto in [1i128, 3, 101, 999] {
        let comprador = e.cuenta_con_saldo(monto);
        let artista_antes = e.token.balance(&e.artista);
        let fondo_antes = e.contrato.saldo_fondo();

        e.contrato.vender_lamina(&comprador, &monto);

        let parte_artista = monto * 7_000 / 10_000;
        let parte_fondo = monto - parte_artista;
        assert_eq!(parte_artista + parte_fondo, monto);
        assert_eq!(e.token.balance(&comprador), 0);
        assert_eq!(e.token.balance(&e.artista), artista_antes + parte_artista);
        assert_eq!(e.contrato.saldo_fondo(), fondo_antes + parte_fondo);
    }
}

#[test]
fn vender_lamina_con_bps_cero_o_total_tambien_es_exacto() {
    let sin_fondo = escenario_con_bps(0);
    let comprador = sin_fondo.cuenta_con_saldo(101);
    sin_fondo.contrato.vender_lamina(&comprador, &101);
    assert_eq!(sin_fondo.token.balance(&sin_fondo.artista), 101);
    assert_eq!(sin_fondo.contrato.saldo_fondo(), 0);

    let todo_fondo = escenario_con_bps(10_000);
    let comprador = todo_fondo.cuenta_con_saldo(101);
    todo_fondo.contrato.vender_lamina(&comprador, &101);
    assert_eq!(todo_fondo.token.balance(&todo_fondo.artista), 0);
    assert_eq!(todo_fondo.contrato.saldo_fondo(), 101);
}

#[test]
fn montos_no_positivos_fallan() {
    let e = escenario();
    let cuenta = e.cuenta_con_saldo(10);
    let cid = e.cid("bafy-propuesta");
    let guardian = e.guardian();

    assert_eq!(
        e.contrato.try_vender_lamina(&cuenta, &0),
        Err(Ok(Error::MontoInvalido))
    );
    assert_eq!(
        e.contrato.try_aportar(&cuenta, &-1),
        Err(Ok(Error::MontoInvalido))
    );
    assert_eq!(
        e.contrato.try_proponer(&guardian, &cid, &0),
        Err(Ok(Error::MontoInvalido))
    );
}

#[test]
fn aportar_suma_al_fondo() {
    let e = escenario();
    let cuidador = e.cuenta_con_saldo(100);

    e.contrato.aportar(&cuidador, &40);

    assert_eq!(e.token.balance(&cuidador), 60);
    assert_eq!(e.contrato.saldo_fondo(), 40);
    assert_eq!(e.token.balance(&e.artista), 0);
}

#[test]
fn proponer_y_votar_verifican_guardian_y_un_voto_por_ronda() {
    let e = escenario();
    let g1 = e.guardian();
    let g2 = e.guardian();
    let g3 = e.guardian();
    let intruso = Address::generate(&e.env);
    let cid = e.cid("bafy-propuesta");

    assert_eq!(
        e.contrato.try_proponer(&intruso, &cid, &10),
        Err(Ok(Error::NoEsGuardian))
    );
    let id = e.contrato.proponer(&g1, &cid, &10);
    assert_eq!(id, 0);

    let propuesta = e.contrato.propuesta(&id).unwrap();
    assert_eq!(propuesta.guardian, g1);
    assert_eq!(propuesta.ronda, 0);
    assert_eq!(propuesta.votos, 0);
    assert_eq!(propuesta.descripcion_cid, cid);

    assert_eq!(
        e.contrato.try_votar(&intruso, &id),
        Err(Ok(Error::NoEsGuardian))
    );
    e.contrato.votar(&g2, &id);
    assert_eq!(e.contrato.propuesta(&id).unwrap().votos, 1);
    assert_eq!(e.contrato.try_votar(&g2, &id), Err(Ok(Error::YaVoto)));
    assert_eq!(
        e.contrato.try_votar(&g3, &99),
        Err(Ok(Error::PropuestaInvalida))
    );
    assert_eq!(e.contrato.propuestas(&0).len(), 1);
}

#[test]
fn cerrar_ronda_paga_la_propuesta_con_mas_votos_y_abre_otra() {
    let e = escenario();
    let g1 = e.guardian();
    let g2 = e.guardian();
    let g3 = e.guardian();
    let cuidador = e.cuenta_con_saldo(150);
    let cid = e.cid("bafy-propuesta");
    e.contrato.aportar(&cuidador, &150);

    let p1 = e.contrato.proponer(&g1, &cid, &60);
    let p2 = e.contrato.proponer(&g2, &cid, &70);
    e.contrato.votar(&g1, &p2);
    e.contrato.votar(&g2, &p2);
    e.contrato.votar(&g3, &p1);

    assert_eq!(e.contrato.cerrar_ronda(), p2);
    assert_eq!(e.token.balance(&g2), 70);
    assert_eq!(e.contrato.saldo_fondo(), 80);
    assert_eq!(e.contrato.ronda_actual(), 1);
    assert_eq!(e.contrato.propuestas(&0).len(), 2);
    assert!(e.contrato.propuestas(&1).is_empty());

    let p3 = e.contrato.proponer(&g1, &cid, &10);
    e.contrato.votar(&g1, &p3);
    assert_eq!(e.contrato.propuesta(&p3).unwrap().ronda, 1);
    assert_eq!(e.contrato.propuesta(&p3).unwrap().votos, 1);
}

#[test]
fn cerrar_ronda_sin_fondos_suficientes_queda_abierta() {
    let e = escenario();
    let guardian = e.guardian();
    let cuidador = e.cuenta_con_saldo(100);
    let cid = e.cid("bafy-propuesta");
    e.contrato.aportar(&cuidador, &50);
    let id = e.contrato.proponer(&guardian, &cid, &100);
    e.contrato.votar(&guardian, &id);

    assert_eq!(
        e.contrato.try_cerrar_ronda(),
        Err(Ok(Error::FondoInsuficiente))
    );
    assert_eq!(e.contrato.ronda_actual(), 0);
    assert_eq!(e.contrato.saldo_fondo(), 50);

    e.contrato.aportar(&cuidador, &50);
    assert_eq!(e.contrato.cerrar_ronda(), id);
    assert_eq!(e.token.balance(&guardian), 100);
    assert_eq!(e.contrato.ronda_actual(), 1);
}

#[test]
fn cerrar_ronda_sin_propuestas_falla() {
    let e = escenario();
    assert_eq!(e.contrato.try_cerrar_ronda(), Err(Ok(Error::SinPropuestas)));
}

#[test]
fn en_empate_gana_la_propuesta_creada_primero() {
    let e = escenario();
    let g1 = e.guardian();
    let g2 = e.guardian();
    let g3 = e.guardian();
    let g4 = e.guardian();
    let cuidador = e.cuenta_con_saldo(100);
    let cid = e.cid("bafy-propuesta");
    e.contrato.aportar(&cuidador, &100);

    let p1 = e.contrato.proponer(&g1, &cid, &50);
    let p2 = e.contrato.proponer(&g2, &cid, &50);
    e.contrato.votar(&g3, &p1);
    e.contrato.votar(&g4, &p2);

    assert_eq!(e.contrato.cerrar_ronda(), p1);
    assert_eq!(e.token.balance(&g1), 50);
    assert_eq!(e.token.balance(&g2), 0);
}
