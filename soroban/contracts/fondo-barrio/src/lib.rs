#![no_std]

use soroban_sdk::{
    contract, contractclient, contracterror, contractimpl, contracttype, token, Address, Env,
    IntoVal, MuxedAddress, String, TryFromVal, Val, Vec,
};

#[cfg(test)]
mod test;

const DIA_EN_LEDGERS: u32 = 17_280;
const TTL_UMBRAL: u32 = 30 * DIA_EN_LEDGERS;
const TTL_EXTENSION: u32 = 60 * DIA_EN_LEDGERS;
const BPS_TOTAL: u32 = 10_000;
// Gobernanza de rondas: quorum minimo de votos y ventana minima antes de cerrar.
// Para produccion conviene subirlos o pasarlos por constructor (~1 dia = 17.280 ledgers).
const VOTOS_MINIMOS: u32 = 2;
const LEDGERS_MINIMOS_RONDA: u32 = 120; // ~10 minutos a 5 s por ledger
const LIMITE_PAGINA: u32 = 50;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Propuesta {
    pub id: u32,
    pub ronda: u32,
    pub guardian: Address,
    pub descripcion_cid: String,
    pub monto: i128,
    pub votos: u32,
}

#[contracttype]
#[derive(Clone)]
struct Config {
    admin: Address,
    token: Address,
    campania: Address,
    artista: Address,
    fondo_bps: u32,
}

#[contracttype]
#[derive(Clone)]
enum Clave {
    Config,
    RondaActual,
    ContadorPropuestas,
    Propuesta(u32),
    PropuestasRonda(u32),
    InicioRonda,
    Voto(u32, Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    BpsInvalido = 1,
    MontoInvalido = 2,
    NoEsGuardian = 3,
    PropuestaInvalida = 4,
    YaVoto = 5,
    SinPropuestas = 6,
    FondoInsuficiente = 7,
    RondaAbierta = 8,
    SinQuorum = 9,
}

#[contractclient(name = "CampaniaClient")]
pub trait CampaniaInterface {
    fn es_guardian(env: Env, direccion: Address) -> bool;
}

fn config(env: &Env) -> Config {
    env.storage().instance().get(&Clave::Config).unwrap()
}

fn ronda(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&Clave::RondaActual)
        .unwrap_or(0)
}

fn contador(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&Clave::ContadorPropuestas)
        .unwrap_or(0)
}

fn leer<V: TryFromVal<Env, Val>>(env: &Env, clave: &Clave) -> Option<V> {
    env.storage().persistent().get(clave)
}

fn guardar<V: IntoVal<Env, Val>>(env: &Env, clave: &Clave, valor: &V) {
    let persistente = env.storage().persistent();
    persistente.set(clave, valor);
    persistente.extend_ttl(clave, TTL_UMBRAL, TTL_EXTENSION);
}

fn extender_instancia(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(TTL_UMBRAL, TTL_EXTENSION);
}

fn token_client<'a>(env: &Env, config: &Config) -> token::TokenClient<'a> {
    token::TokenClient::new(env, &config.token)
}

fn exigir_guardian(env: &Env, config: &Config, guardian: &Address) -> Result<(), Error> {
    if CampaniaClient::new(env, &config.campania).es_guardian(guardian) {
        Ok(())
    } else {
        Err(Error::NoEsGuardian)
    }
}

#[contract]
pub struct FondoBarrio;

// Diseño de rondas: hay una sola ronda abierta, sin vencimiento automático; el admin la cierra.
// En empate gana la propuesta creada primero. Si el fondo no alcanza, la ronda queda abierta.
#[contractimpl]
impl FondoBarrio {
    pub fn __constructor(
        env: Env,
        admin: Address,
        token: Address,
        campania: Address,
        artista: Address,
        fondo_bps: u32,
    ) {
        soroban_sdk::assert_with_error!(&env, fondo_bps <= BPS_TOTAL, Error::BpsInvalido);
        let config = Config {
            admin,
            token,
            campania,
            artista,
            fondo_bps,
        };
        env.storage().instance().set(&Clave::Config, &config);
        env.storage().instance().set(&Clave::RondaActual, &0u32);
        env.storage()
            .instance()
            .set(&Clave::ContadorPropuestas, &0u32);
        env.storage()
            .instance()
            .set(&Clave::InicioRonda, &env.ledger().sequence());
        extender_instancia(&env);
    }

    pub fn vender_lamina(env: Env, comprador: Address, monto: i128) -> Result<(), Error> {
        comprador.require_auth();
        if monto <= 0 {
            return Err(Error::MontoInvalido);
        }
        let config = config(&env);
        let contrato = env.current_contract_address();
        let token = token_client(&env, &config);
        token.transfer(&comprador, &MuxedAddress::from(&contrato), &monto);

        let parte_artista = monto
            .checked_mul((BPS_TOTAL - config.fondo_bps) as i128)
            .ok_or(Error::MontoInvalido)?
            / BPS_TOTAL as i128;
        if parte_artista > 0 {
            token.transfer(
                &contrato,
                &MuxedAddress::from(&config.artista),
                &parte_artista,
            );
        }
        extender_instancia(&env);
        Ok(())
    }

    pub fn aportar(env: Env, cuidador: Address, monto: i128) -> Result<(), Error> {
        cuidador.require_auth();
        if monto <= 0 {
            return Err(Error::MontoInvalido);
        }
        let config = config(&env);
        let contrato = env.current_contract_address();
        token_client(&env, &config).transfer(&cuidador, &MuxedAddress::from(&contrato), &monto);
        extender_instancia(&env);
        Ok(())
    }

    pub fn proponer(
        env: Env,
        guardian: Address,
        descripcion_cid: String,
        monto: i128,
    ) -> Result<u32, Error> {
        guardian.require_auth();
        if monto <= 0 {
            return Err(Error::MontoInvalido);
        }
        let config = config(&env);
        exigir_guardian(&env, &config, &guardian)?;

        let id = contador(&env);
        let ronda_actual = ronda(&env);
        let propuesta = Propuesta {
            id,
            ronda: ronda_actual,
            guardian,
            descripcion_cid,
            monto,
            votos: 0,
        };
        guardar(&env, &Clave::Propuesta(id), &propuesta);

        let clave_ronda = Clave::PropuestasRonda(ronda_actual);
        let mut ids: Vec<u32> = leer(&env, &clave_ronda).unwrap_or_else(|| Vec::new(&env));
        ids.push_back(id);
        guardar(&env, &clave_ronda, &ids);

        env.storage()
            .instance()
            .set(&Clave::ContadorPropuestas, &(id + 1));
        extender_instancia(&env);
        Ok(id)
    }

    pub fn votar(env: Env, guardian: Address, propuesta_id: u32) -> Result<(), Error> {
        guardian.require_auth();
        let config = config(&env);
        exigir_guardian(&env, &config, &guardian)?;

        let ronda_actual = ronda(&env);
        let clave_voto = Clave::Voto(ronda_actual, guardian.clone());
        if leer::<u32>(&env, &clave_voto).is_some() {
            return Err(Error::YaVoto);
        }
        let mut propuesta: Propuesta =
            leer(&env, &Clave::Propuesta(propuesta_id)).ok_or(Error::PropuestaInvalida)?;
        if propuesta.ronda != ronda_actual {
            return Err(Error::PropuestaInvalida);
        }

        propuesta.votos += 1;
        guardar(&env, &Clave::Propuesta(propuesta_id), &propuesta);
        guardar(&env, &clave_voto, &propuesta_id);
        extender_instancia(&env);
        Ok(())
    }

    pub fn cerrar_ronda(env: Env) -> Result<u32, Error> {
        let config = config(&env);
        config.admin.require_auth();
        let ronda_actual = ronda(&env);
        let ids: Vec<u32> =
            leer(&env, &Clave::PropuestasRonda(ronda_actual)).unwrap_or_else(|| Vec::new(&env));
        if ids.is_empty() {
            return Err(Error::SinPropuestas);
        }
        let inicio: u32 = env
            .storage()
            .instance()
            .get(&Clave::InicioRonda)
            .unwrap_or(0);
        if env.ledger().sequence() < inicio + LEDGERS_MINIMOS_RONDA {
            return Err(Error::RondaAbierta);
        }

        let mut ganadora: Option<Propuesta> = None;
        for id in ids.iter() {
            if let Some(propuesta) = leer::<Propuesta>(&env, &Clave::Propuesta(id)) {
                let supera = match &ganadora {
                    Some(actual) => propuesta.votos > actual.votos,
                    None => true,
                };
                if supera {
                    ganadora = Some(propuesta);
                }
            }
        }
        let ganadora = ganadora.ok_or(Error::SinPropuestas)?;
        if ganadora.votos < VOTOS_MINIMOS {
            return Err(Error::SinQuorum);
        }

        let contrato = env.current_contract_address();
        let token = token_client(&env, &config);
        if token.balance(&contrato) < ganadora.monto {
            return Err(Error::FondoInsuficiente);
        }
        token.transfer(
            &contrato,
            &MuxedAddress::from(&ganadora.guardian),
            &ganadora.monto,
        );
        env.storage()
            .instance()
            .set(&Clave::RondaActual, &(ronda_actual + 1));
        env.storage()
            .instance()
            .set(&Clave::InicioRonda, &env.ledger().sequence());
        env.events().publish(
            (soroban_sdk::symbol_short!("ronda_fin"), ronda_actual),
            (ganadora.id, ganadora.guardian.clone(), ganadora.monto),
        );
        extender_instancia(&env);
        Ok(ganadora.id)
    }

    pub fn ronda_actual(env: Env) -> u32 {
        ronda(&env)
    }

    pub fn propuesta(env: Env, id: u32) -> Option<Propuesta> {
        leer(&env, &Clave::Propuesta(id))
    }

    pub fn propuestas(env: Env, ronda: u32) -> Vec<Propuesta> {
        let mut salida = Vec::new(&env);
        let ids: Vec<u32> =
            leer(&env, &Clave::PropuestasRonda(ronda)).unwrap_or_else(|| Vec::new(&env));
        for id in ids.iter() {
            if let Some(propuesta) = leer::<Propuesta>(&env, &Clave::Propuesta(id)) {
                salida.push_back(propuesta);
            }
        }
        salida
    }

    pub fn propuestas_pagina(env: Env, ronda: u32, desde: u32, limite: u32) -> Vec<Propuesta> {
        let ids: Vec<u32> =
            leer(&env, &Clave::PropuestasRonda(ronda)).unwrap_or_else(|| Vec::new(&env));
        let mut salida = Vec::new(&env);
        let limite = limite.min(LIMITE_PAGINA);
        let hasta = desde.saturating_add(limite).min(ids.len());
        let mut i = desde;
        while i < hasta {
            if let Some(id) = ids.get(i) {
                if let Some(propuesta) = leer::<Propuesta>(&env, &Clave::Propuesta(id)) {
                    salida.push_back(propuesta);
                }
            }
            i += 1;
        }
        salida
    }

    pub fn saldo_fondo(env: Env) -> i128 {
        let config = config(&env);
        token_client(&env, &config).balance(&env.current_contract_address())
    }
}
