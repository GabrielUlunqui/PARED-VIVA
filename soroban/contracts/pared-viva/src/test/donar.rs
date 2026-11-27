use super::comun::*;
use crate::{Donacion, Error, Estado};
use soroban_sdk::{
    symbol_short,
    testutils::{AuthorizedFunction, Events as _},
    Event as _, IntoVal, String,
};

#[test]
fn donar_ladrillo_libre_registra_ladrillo_aporte_y_guardian() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(10 * USDC);
    let recuerdo = String::from_str(&e.env, "bafy-ladrillo-0");
    let monto = 2 * USDC;

    e.contrato.donar(&donante, &0, &recuerdo, &monto);

    let ladrillo = e.contrato.ladrillo(&0).unwrap();
    assert_eq!(ladrillo.id, 0);
    assert_eq!(ladrillo.donante, donante);
    assert_eq!(ladrillo.monto, monto);
    assert_eq!(ladrillo.recuerdo, recuerdo);
    assert_eq!(ladrillo.fecha, 1_000);

    let ladrillos = e.contrato.ladrillos();
    assert_eq!(ladrillos.len(), 1);
    assert_eq!(ladrillos.get(0).unwrap(), ladrillo);
    assert_eq!(e.contrato.aporte(&donante), monto);
    assert!(e.contrato.es_guardian(&donante));
    assert_eq!(e.contrato.estado().recaudado, monto);
    assert_eq!(e.token.balance(&donante), 8 * USDC);
    assert_eq!(e.token.balance(&e.id), monto);
}

#[test]
fn donar_menos_del_minimo_falla() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(USDC);
    let recuerdo = String::from_str(&e.env, "bafy-insuficiente");

    assert_eq!(
        e.contrato.try_donar(&donante, &0, &recuerdo, &(USDC - 1)),
        Err(Ok(Error::MontoInsuficiente))
    );
}

#[test]
fn donar_ladrillo_ocupado_falla() {
    let e = escenario();
    let primero = e.cuenta_con_saldo(2 * USDC);
    let segundo = e.cuenta_con_saldo(2 * USDC);
    let recuerdo = String::from_str(&e.env, "bafy-ocupado");

    e.contrato.donar(&primero, &3, &recuerdo, &USDC);

    assert_eq!(
        e.contrato.try_donar(&segundo, &3, &recuerdo, &USDC),
        Err(Ok(Error::LadrilloOcupado))
    );
}

#[test]
fn donar_fuera_de_la_grilla_falla() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(USDC);
    let recuerdo = String::from_str(&e.env, "bafy-invalido");

    assert_eq!(
        e.contrato.try_donar(&donante, &600, &recuerdo, &USDC),
        Err(Ok(Error::LadrilloInvalido))
    );
}

#[test]
fn donar_despues_de_fecha_limite_falla() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(USDC);
    let recuerdo = String::from_str(&e.env, "bafy-vencido");

    e.vencer();

    assert_eq!(
        e.contrato.try_donar(&donante, &0, &recuerdo, &USDC),
        Err(Ok(Error::CampaniaNoActiva))
    );
}

#[test]
fn alcanzar_la_meta_pasa_a_financiada_y_bloquea_nuevas_donaciones() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(META);
    let recuerdo = String::from_str(&e.env, "bafy-meta");

    e.contrato.donar(&donante, &0, &recuerdo, &META);

    assert_eq!(e.contrato.estado().estado, Estado::Financiada);
    let otro = e.cuenta_con_saldo(USDC);
    assert_eq!(
        e.contrato.try_donar(&otro, &1, &recuerdo, &USDC),
        Err(Ok(Error::CampaniaNoActiva))
    );
}

#[test]
fn un_donante_con_varios_ladrillos_acumula_el_aporte() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(6 * USDC);
    let recuerdo = String::from_str(&e.env, "bafy-acumulado");

    e.contrato.donar(&donante, &7, &recuerdo, &(2 * USDC));
    e.contrato.donar(&donante, &8, &recuerdo, &(3 * USDC));

    assert_eq!(e.contrato.aporte(&donante), 5 * USDC);
    assert_eq!(e.contrato.estado().recaudado, 5 * USDC);
    assert_eq!(e.token.balance(&donante), USDC);
    assert_eq!(e.contrato.ladrillos().len(), 2);
}

#[test]
fn donar_emite_el_evento_donacion() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(3 * USDC);
    let recuerdo = String::from_str(&e.env, "bafy-evento");
    let monto = 2 * USDC;

    e.contrato.donar(&donante, &9, &recuerdo, &monto);

    assert_eq!(
        e.env.events().all().filter_by_contract(&e.id),
        [Donacion {
            ladrillo_id: 9,
            donante,
            monto,
            recuerdo,
        }
        .to_xdr(&e.env, &e.id)]
    );
}

#[test]
fn donar_exige_auth_del_donante() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(2 * USDC);
    let recuerdo = String::from_str(&e.env, "bafy-auth");
    let monto = USDC;

    e.contrato.donar(&donante, &4, &recuerdo, &monto);

    let auths = e.env.auths();
    assert_eq!(auths.len(), 1);
    let (autorizado, invocacion) = &auths[0];
    assert_eq!(autorizado, &donante);
    assert_eq!(
        invocacion.function,
        AuthorizedFunction::Contract((
            e.id.clone(),
            symbol_short!("donar"),
            (&donante, 4u32, &recuerdo, monto).into_val(&e.env),
        ))
    );
}
