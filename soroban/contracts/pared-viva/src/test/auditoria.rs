use soroban_sdk::{testutils::Address as _, vec, Address, String};

use super::comun::{escenario, USDC};
use crate::Error;

// --- A1: reembolsar quita el guardian ---

#[test]
fn reembolsar_quita_el_guardian() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(2 * USDC);
    let recuerdo = String::from_str(&e.env, "bafy-guardian");

    e.contrato.donar(&donante, &0, &recuerdo, &(2 * USDC));
    assert_eq!(e.contrato.es_guardian(&donante), true);

    e.vencer();
    e.contrato.reembolsar(&donante);
    assert_eq!(e.contrato.es_guardian(&donante), false);
}

#[test]
fn guardian_sin_reembolsar_sigue_siendo_guardian() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(2 * USDC);
    let recuerdo = String::from_str(&e.env, "bafy-queda");

    e.contrato.donar(&donante, &0, &recuerdo, &(2 * USDC));
    e.vencer();
    assert_eq!(e.contrato.es_guardian(&donante), true);
}

// --- A2: paginacion ---

#[test]
fn ladrillos_pagina_devuelve_solo_la_pagina_en_orden() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(20 * USDC);
    let recuerdo = String::from_str(&e.env, "bafy-pagina");
    for id in [5u32, 2, 9, 1, 7] {
        e.contrato.donar(&donante, &id, &recuerdo, &(2 * USDC));
    }
    assert_eq!(e.contrato.total_ocupados(), 5);

    let pagina = e.contrato.ladrillos_pagina(&0, &2);
    assert_eq!(pagina.len(), 2);
    assert_eq!(pagina.get(0).unwrap().id, 5);
    assert_eq!(pagina.get(1).unwrap().id, 2);

    let pagina = e.contrato.ladrillos_pagina(&2, &2);
    assert_eq!(pagina.len(), 2);
    assert_eq!(pagina.get(0).unwrap().id, 9);
    assert_eq!(pagina.get(1).unwrap().id, 1);

    let ultima = e.contrato.ladrillos_pagina(&4, &50);
    assert_eq!(ultima.len(), 1);
    assert_eq!(ultima.get(0).unwrap().id, 7);

    assert_eq!(e.contrato.ladrillos_pagina(&5, &10).len(), 0);
}

// --- A3: validacion anti-griefing del constructor ---

#[test]
#[should_panic(expected = "aporte_minimo * filas * columnas debe alcanzar la meta")]
fn constructor_rechaza_minimo_que_no_cubre_la_meta() {
    let e = escenario();
    let mut config = e.config.clone();
    config.aporte_minimo = USDC; // 1 USDC * 600 celdas = 600 < 1000 meta
    let token = config.token.clone();
    let _ = token;
    let env = e.env.clone();
    env.register(crate::ParedViva, (config,));
}

// --- M4: validacion del cid ---

#[test]
fn donar_con_cid_vacio_o_muy_largo_falla() {
    let e = escenario();
    let donante = e.cuenta_con_saldo(10 * USDC);
    let vacio = String::from_str(&e.env, "");
    assert_eq!(
        e.contrato.try_donar(&donante, &0, &vacio, &(2 * USDC)),
        Err(Ok(Error::RecuerdoInvalido))
    );

    let largo = String::from_str(&e.env, &"a".repeat(129));
    assert_eq!(
        e.contrato.try_donar(&donante, &0, &largo, &(2 * USDC)),
        Err(Ok(Error::RecuerdoInvalido))
    );

    let limite = String::from_str(&e.env, &"a".repeat(128));
    e.contrato.donar(&donante, &0, &limite, &(2 * USDC));
}

// --- A4: rotacion de firmantes ---

#[test]
fn rotar_firmante_con_dos_aprobadores_reemplaza_al_saliente() {
    let e = escenario();
    let f0 = e.firmante(0);
    let f1 = e.firmante(1);
    let f2 = e.firmante(2);
    let nuevo = Address::generate(&e.env);

    e.contrato.rotar_firmante(&f0, &f1, &f2, &nuevo);
    let firmantes = e.contrato.firmantes();
    assert_eq!(firmantes, vec![&e.env, f0, f1, nuevo]);
}

#[test]
fn rotar_firmante_rechaza_aprobadores_que_no_son_firmantes() {
    let e = escenario();
    let f0 = e.firmante(0);
    let f2 = e.firmante(2);
    let intruso = Address::generate(&e.env);
    let nuevo = Address::generate(&e.env);

    assert_eq!(
        e.contrato.try_rotar_firmante(&intruso, &f0, &f2, &nuevo),
        Err(Ok(Error::NoEsFirmante))
    );
    // el saliente no puede aprobar su propia rotacion
    assert_eq!(
        e.contrato.try_rotar_firmante(&f2, &f0, &f2, &nuevo),
        Err(Ok(Error::NoEsAprobador))
    );
    // aprobadores duplicados
    assert_eq!(
        e.contrato.try_rotar_firmante(&f0, &f0, &f2, &nuevo),
        Err(Ok(Error::NoEsAprobador))
    );
}
