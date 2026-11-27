use soroban_sdk::{token, Env, IntoVal, TryFromVal, Val, Vec};

use crate::tipos::{Clave, Config, Estado};

const DIA_EN_LEDGERS: u32 = 17_280;
pub const TTL_UMBRAL: u32 = 30 * DIA_EN_LEDGERS;
pub const TTL_EXTENSION: u32 = 60 * DIA_EN_LEDGERS;

// Instance

pub fn config(env: &Env) -> Config {
    env.storage().instance().get(&Clave::Config).unwrap()
}

pub fn guardar_config(env: &Env, config: &Config) {
    env.storage().instance().set(&Clave::Config, config);
}

pub fn recaudado(env: &Env) -> i128 {
    env.storage().instance().get(&Clave::Recaudado).unwrap_or(0)
}

pub fn guardar_recaudado(env: &Env, monto: i128) {
    env.storage().instance().set(&Clave::Recaudado, &monto);
}

pub fn hito_actual(env: &Env) -> u32 {
    env.storage().instance().get(&Clave::HitoActual).unwrap_or(0)
}

pub fn guardar_hito_actual(env: &Env, hito: u32) {
    env.storage().instance().set(&Clave::HitoActual, &hito);
}

pub fn ocupados(env: &Env) -> Vec<u32> {
    env.storage().instance().get(&Clave::Ocupados).unwrap_or_else(|| Vec::new(env))
}

pub fn guardar_ocupados(env: &Env, ocupados: &Vec<u32>) {
    env.storage().instance().set(&Clave::Ocupados, ocupados);
}

pub fn extender_instancia(env: &Env) {
    env.storage().instance().extend_ttl(TTL_UMBRAL, TTL_EXTENSION);
}

// Persistent: Ladrillo, Aporte, Guardian, Aprobacion, Aprobaciones

pub fn leer<V: TryFromVal<Env, Val>>(env: &Env, clave: &Clave) -> Option<V> {
    env.storage().persistent().get(clave)
}

/// Guarda y renueva el TTL de la entrada.
pub fn guardar<V: IntoVal<Env, Val>>(env: &Env, clave: &Clave, valor: &V) {
    let persistente = env.storage().persistent();
    persistente.set(clave, valor);
    persistente.extend_ttl(clave, TTL_UMBRAL, TTL_EXTENSION);
}

// Derivados

/// El estado no se guarda: se calcula con recaudado, hito actual y fecha límite.
pub fn estado(env: &Env, config: &Config) -> Estado {
    if hito_actual(env) >= config.hitos.len() {
        Estado::Completada
    } else if recaudado(env) >= config.meta {
        Estado::Financiada
    } else if env.ledger().timestamp() > config.fecha_limite {
        Estado::Fallida
    } else {
        Estado::Activa
    }
}

pub fn token<'a>(env: &Env, config: &Config) -> token::TokenClient<'a> {
    token::TokenClient::new(env, &config.token)
}
