use soroban_sdk::{
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation, Events as _},
    Address, Event as _, IntoVal, Symbol,
};

use super::comun::*;
use crate::{almacen, Error, Estado, Reembolso};

#[test]
fn reembolso_en_activa_devuelve_no_reembolsable() {
    let e = escenario();
    let donante = Address::generate(&e.env);
    e.simular_aporte(&donante, 10 * USDC);

    assert_eq!(e.contrato.try_reembolsar(&donante), Err(Ok(Error::NoReembolsable)));
}

#[test]
fn reembolso_en_financiada_devuelve_no_reembolsable() {
    let e = escenario();
    let donante = e.financiar(0);

    assert_eq!(e.contrato.try_reembolsar(&donante), Err(Ok(Error::NoReembolsable)));
}

#[test]
fn reembolso_en_fallida_devuelve_aporte_exacto_y_emite_evento() {
    let e = escenario();
    let donante = Address::generate(&e.env);
    let monto = 25 * USDC;
    e.simular_aporte(&donante, monto);
    e.vencer();
    assert_eq!(e.contrato.estado().estado, Estado::Fallida);

    let saldo_antes = e.token.balance(&donante);
    assert_eq!(e.contrato.reembolsar(&donante), monto);
    let eventos = e.env.events().all().filter_by_contract(&e.id);

    assert_eq!(
        eventos,
        [Reembolso { donante: donante.clone(), monto }.to_xdr(&e.env, &e.id)],
    );
    assert_eq!(e.contrato.aporte(&donante), 0);
    assert_eq!(e.token.balance(&donante), saldo_antes + monto);
    assert_eq!(e.token.balance(&e.id), 0);
}

#[test]
fn reembolso_segunda_vez_devuelve_sin_aporte() {
    let e = escenario();
    let donante = Address::generate(&e.env);
    e.simular_aporte(&donante, 10 * USDC);
    e.vencer();

    assert_eq!(e.contrato.reembolsar(&donante), 10 * USDC);
    assert_eq!(e.contrato.try_reembolsar(&donante), Err(Ok(Error::SinAporte)));
}

#[test]
fn reembolso_sin_haber_aportado_devuelve_sin_aporte() {
    let e = escenario();
    let donante = Address::generate(&e.env);
    e.vencer();

    assert_eq!(e.contrato.try_reembolsar(&donante), Err(Ok(Error::SinAporte)));
}

#[test]
fn varios_donantes_se_reembolsan_cada_uno_lo_suyo() {
    let e = escenario();
    let donante1 = Address::generate(&e.env);
    let donante2 = Address::generate(&e.env);
    let monto1 = 10 * USDC;
    let monto2 = 30 * USDC;
    e.simular_aporte(&donante1, monto1);
    e.simular_aporte(&donante2, monto2);
    e.vencer();

    assert_eq!(e.contrato.reembolsar(&donante1), monto1);
    assert_eq!(e.contrato.aporte(&donante1), 0);
    assert_eq!(e.contrato.aporte(&donante2), monto2);
    assert_eq!(e.token.balance(&donante1), monto1);
    assert_eq!(e.token.balance(&e.id), monto2);

    assert_eq!(e.contrato.reembolsar(&donante2), monto2);
    assert_eq!(e.contrato.aporte(&donante2), 0);
    assert_eq!(e.token.balance(&donante2), monto2);
    assert_eq!(e.token.balance(&e.id), 0);
}

#[test]
fn reembolso_exige_auth_del_donante() {
    let e = escenario();
    let donante = Address::generate(&e.env);
    e.simular_aporte(&donante, 10 * USDC);
    e.vencer();

    e.contrato.reembolsar(&donante);

    assert_eq!(
        e.env.auths(),
        [(
            donante.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    e.id.clone(),
                    Symbol::new(&e.env, "reembolsar"),
                    (&donante,).into_val(&e.env),
                )),
                sub_invocations: [].into(),
            },
        )],
    );
}

#[test]
fn excedente_antes_de_completar_devuelve_campania_no_activa() {
    let activa = escenario();
    assert_eq!(activa.contrato.try_retirar_excedente(), Err(Ok(Error::CampaniaNoActiva)));

    let financiada = escenario();
    financiada.financiar(50 * USDC);
    assert_eq!(financiada.contrato.try_retirar_excedente(), Err(Ok(Error::CampaniaNoActiva)));
}

#[test]
fn excedente_va_al_fondo_al_completar() {
    let e = escenario();
    let excedente = 50 * USDC;
    e.financiar(excedente);
    e.env.as_contract(&e.id, || {
        e.token.transfer(&e.id, &e.config.restaurador, &META);
        almacen::guardar_hito_actual(&e.env, 3);
    });
    assert_eq!(e.contrato.estado().estado, Estado::Completada);
    assert_eq!(e.token.balance(&e.id), excedente);

    let fondo_antes = e.token.balance(&e.config.fondo);
    assert_eq!(e.contrato.retirar_excedente(), excedente);
    assert_eq!(e.token.balance(&e.config.fondo), fondo_antes + excedente);
    assert_eq!(e.token.balance(&e.id), 0);
    assert_eq!(e.contrato.retirar_excedente(), 0);
}
