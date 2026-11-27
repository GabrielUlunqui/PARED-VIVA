use soroban_sdk::{Address, String};

use super::comun::*;
use crate::{Error, Estado};

fn donar(e: &Escenario<'_>, donante: &Address, ladrillo: u32, monto: i128, cid: &str) {
    let recuerdo = String::from_str(&e.env, cid);
    e.contrato.donar(donante, &ladrillo, &recuerdo, &monto);
}

#[test]
fn campania_exitosa_completa_hitos_y_retira_excedente() {
    let e = escenario();
    let excedente = 50 * USDC;
    let donante1 = e.cuenta_con_saldo(500 * USDC);
    let donante2 = e.cuenta_con_saldo(400 * USDC);
    let donante3 = e.cuenta_con_saldo(150 * USDC);

    donar(&e, &donante1, 0, 300 * USDC, "bafy-integracion-0");
    donar(&e, &donante2, 1, 400 * USDC, "bafy-integracion-1");
    donar(&e, &donante1, 2, 200 * USDC, "bafy-integracion-2");
    assert_eq!(e.contrato.estado().estado, Estado::Activa);
    donar(&e, &donante3, 3, 150 * USDC, "bafy-integracion-3");

    let resumen = e.contrato.estado();
    assert_eq!(resumen.estado, Estado::Financiada);
    assert_eq!(resumen.recaudado, META + excedente);
    assert_eq!(e.token.balance(&e.id), META + excedente);

    let ladrillos = e.contrato.ladrillos();
    assert_eq!(ladrillos.len(), 4);
    assert_eq!(ladrillos.get(0).unwrap().donante, donante1);
    assert_eq!(ladrillos.get(0).unwrap().monto, 300 * USDC);
    assert_eq!(ladrillos.get(1).unwrap().donante, donante2);
    assert_eq!(ladrillos.get(1).unwrap().monto, 400 * USDC);
    assert_eq!(ladrillos.get(2).unwrap().donante, donante1);
    assert_eq!(ladrillos.get(2).unwrap().monto, 200 * USDC);
    assert_eq!(ladrillos.get(3).unwrap().donante, donante3);
    assert_eq!(ladrillos.get(3).unwrap().monto, 150 * USDC);
    assert_eq!(e.contrato.aporte(&donante1), 500 * USDC);
    assert_eq!(e.contrato.aporte(&donante2), 400 * USDC);
    assert_eq!(e.contrato.aporte(&donante3), 150 * USDC);
    assert!(e.contrato.es_guardian(&donante1));
    assert!(e.contrato.es_guardian(&donante2));
    assert!(e.contrato.es_guardian(&donante3));
    assert!(!e.contrato.es_guardian(&e.config.restaurador));

    let f0 = e.firmante(0);
    let f1 = e.firmante(1);
    for hito in 0..3u32 {
        e.contrato.aprobar_hito(&f0, &hito);
        e.contrato.aprobar_hito(&f1, &hito);
    }

    let resumen = e.contrato.estado();
    assert_eq!(resumen.estado, Estado::Completada);
    assert_eq!(resumen.hito_actual, 3);
    assert_eq!(e.token.balance(&e.config.restaurador), META);
    assert_eq!(e.token.balance(&e.id), excedente);

    assert_eq!(e.contrato.retirar_excedente(), excedente);
    assert_eq!(e.token.balance(&e.config.fondo), excedente);
    assert_eq!(e.token.balance(&e.id), 0);
}

#[test]
fn campania_fallida_reembolsa_a_cada_donante() {
    let e = escenario();
    let donante1 = e.cuenta_con_saldo(100 * USDC);
    let donante2 = e.cuenta_con_saldo(200 * USDC);

    donar(&e, &donante1, 10, 100 * USDC, "bafy-fallida-10");
    donar(&e, &donante2, 11, 200 * USDC, "bafy-fallida-11");
    assert_eq!(e.token.balance(&e.id), 300 * USDC);
    assert_eq!(e.contrato.estado().estado, Estado::Activa);

    e.vencer();
    assert_eq!(e.contrato.estado().estado, Estado::Fallida);

    let tardio = e.cuenta_con_saldo(USDC);
    let recuerdo = String::from_str(&e.env, "bafy-fallida-tarde");
    assert_eq!(
        e.contrato.try_donar(&tardio, &12, &recuerdo, &USDC),
        Err(Ok(Error::CampaniaNoActiva))
    );
    let f0 = e.firmante(0);
    assert_eq!(
        e.contrato.try_aprobar_hito(&f0, &0),
        Err(Ok(Error::MetaNoAlcanzada))
    );

    assert_eq!(e.contrato.reembolsar(&donante1), 100 * USDC);
    assert_eq!(e.contrato.aporte(&donante1), 0);
    assert_eq!(e.token.balance(&donante1), 100 * USDC);
    assert_eq!(e.token.balance(&e.id), 200 * USDC);

    assert_eq!(e.contrato.reembolsar(&donante2), 200 * USDC);
    assert_eq!(e.contrato.aporte(&donante2), 0);
    assert_eq!(e.token.balance(&donante2), 200 * USDC);
    assert_eq!(e.token.balance(&e.id), 0);

    assert_eq!(
        e.contrato.try_reembolsar(&donante1),
        Err(Ok(Error::SinAporte))
    );
}
