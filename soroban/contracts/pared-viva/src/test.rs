#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Env};

const USDC: i128 = 10_000_000;

fn config(env: &Env) -> Config {
    Config {
        admin: Address::generate(env),
        token: Address::generate(env),
        restaurador: Address::generate(env),
        fondo: Address::generate(env),
        firmantes: vec![env, Address::generate(env), Address::generate(env), Address::generate(env)],
        meta: 1_000 * USDC,
        fecha_limite: 1_000_000,
        hitos: vec![env, 400 * USDC, 300 * USDC, 300 * USDC],
        filas: 20,
        columnas: 30,
        precio_ladrillo: 5 * USDC,
    }
}

#[test]
fn se_despliega_con_config() {
    let env = Env::default();
    env.register(ParedViva, (config(&env),));
}

// TODO [A6]: implementar los casos de README §6.5. Para el token usar env.register_stellar_asset_contract_v2,
// y para la fecha límite env.ledger().set_timestamp(...).

#[test]
#[ignore]
fn donar_ladrillo_libre_registra_ladrillo_aporte_y_guardian() {
    todo!()
}

#[test]
#[ignore]
fn donar_ladrillo_ocupado_falla() {
    todo!()
}

#[test]
#[ignore]
fn donar_despues_de_fecha_limite_falla() {
    todo!()
}

#[test]
#[ignore]
fn una_aprobacion_no_libera_dos_si() {
    todo!()
}

#[test]
#[ignore]
fn no_firmante_no_aprueba_y_firmante_no_aprueba_dos_veces() {
    todo!()
}

#[test]
#[ignore]
fn reembolso_solo_en_fallida_y_una_vez() {
    todo!()
}

#[test]
#[ignore]
fn excedente_va_al_fondo_al_completar() {
    todo!()
}
