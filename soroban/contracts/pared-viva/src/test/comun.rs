#![allow(dead_code)]

use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, TokenClient},
    vec, Address, Env,
};

use crate::{almacen, Clave, Config, ParedViva, ParedVivaClient};

pub const USDC: i128 = 10_000_000;
pub const META: i128 = 1_000 * USDC;
pub const FECHA_LIMITE: u64 = 1_000_000;

pub struct Escenario<'a> {
    pub env: Env,
    pub id: Address,
    pub contrato: ParedVivaClient<'a>,
    pub config: Config,
    pub token: TokenClient<'a>,
    pub token_admin: StellarAssetClient<'a>,
}

pub fn config(env: &Env, token: Address) -> Config {
    Config {
        admin: Address::generate(env),
        token,
        restaurador: Address::generate(env),
        fondo: Address::generate(env),
        firmantes: vec![env, Address::generate(env), Address::generate(env), Address::generate(env)],
        meta: META,
        fecha_limite: FECHA_LIMITE,
        hitos: vec![env, 400 * USDC, 300 * USDC, 300 * USDC],
        filas: 20,
        columnas: 30,
        aporte_minimo: USDC,
    }
}

/// Campaña recién desplegada, con USDC de test (SAC) y `mock_all_auths`.
pub fn escenario<'a>() -> Escenario<'a> {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1_000);
    let token_id = env.register_stellar_asset_contract_v2(Address::generate(&env)).address();
    let config = config(&env, token_id.clone());
    let id = env.register(ParedViva, (config.clone(),));
    Escenario {
        contrato: ParedVivaClient::new(&env, &id),
        token: TokenClient::new(&env, &token_id),
        token_admin: StellarAssetClient::new(&env, &token_id),
        id,
        config,
        env,
    }
}

impl Escenario<'_> {
    /// Cuenta nueva con `monto` USDC de test.
    pub fn cuenta_con_saldo(&self, monto: i128) -> Address {
        let cuenta = Address::generate(&self.env);
        self.token_admin.mint(&cuenta, &monto);
        cuenta
    }

    /// Simula un aporte sin pasar por `donar` (para testear hitos y reembolsos sin depender de A3):
    /// deja el USDC en el contrato y actualiza Recaudado, Aporte(donante) y Guardian(donante).
    pub fn simular_aporte(&self, donante: &Address, monto: i128) {
        self.token_admin.mint(&self.id, &monto);
        self.env.as_contract(&self.id, || {
            almacen::guardar_recaudado(&self.env, almacen::recaudado(&self.env) + monto);
            let clave = Clave::Aporte(donante.clone());
            let previo: i128 = almacen::leer(&self.env, &clave).unwrap_or(0);
            almacen::guardar(&self.env, &clave, &(previo + monto));
            almacen::guardar(&self.env, &Clave::Guardian(donante.clone()), &true);
        });
    }

    /// Lleva la campaña a `Financiada` (recaudado = meta + `excedente`) con un aporte simulado.
    pub fn financiar(&self, excedente: i128) -> Address {
        let donante = Address::generate(&self.env);
        self.simular_aporte(&donante, META + excedente);
        donante
    }

    /// Pasa la fecha límite.
    pub fn vencer(&self) {
        self.env.ledger().set_timestamp(FECHA_LIMITE + 1);
    }

    pub fn firmante(&self, i: u32) -> Address {
        self.config.firmantes.get(i).unwrap()
    }
}
