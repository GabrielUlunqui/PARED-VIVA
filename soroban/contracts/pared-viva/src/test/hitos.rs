use soroban_sdk::{
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation, Events as _},
    vec, Address, Event as _, IntoVal, Symbol,
};

use super::comun::*;
use crate::{Error, Estado, HitoAprobado, HitoPagado};

#[test]
fn una_aprobacion_no_libera_dos_si() {
    let e = escenario();
    e.financiar(0);
    let f0 = e.firmante(0);
    let f1 = e.firmante(1);

    e.contrato.aprobar_hito(&f0, &0);
    assert_eq!(e.token.balance(&e.config.restaurador), 0);
    assert_eq!(e.contrato.aprobaciones(&0), vec![&e.env, f0.clone()]);
    assert_eq!(e.contrato.estado().hito_actual, 0);

    e.contrato.aprobar_hito(&f1, &0);
    let eventos = e.env.events().all().filter_by_contract(&e.id);
    assert_eq!(e.token.balance(&e.config.restaurador), 400 * USDC);
    assert_eq!(e.contrato.estado().hito_actual, 1);
    assert_eq!(
        eventos,
        [
            HitoAprobado {
                hito: 0,
                firmante: f1.clone(),
                aprobaciones: 2
            }
            .to_xdr(&e.env, &e.id),
            HitoPagado {
                hito: 0,
                restaurador: e.config.restaurador.clone(),
                monto: 400 * USDC
            }
            .to_xdr(&e.env, &e.id),
        ]
    );
}

#[test]
fn validaciones_de_aprobar_hito() {
    let e = escenario();
    let f0 = e.firmante(0);

    assert_eq!(
        e.contrato.try_aprobar_hito(&f0, &0),
        Err(Ok(Error::MetaNoAlcanzada))
    );

    e.financiar(0);
    let intruso = Address::generate(&e.env);
    assert_eq!(
        e.contrato.try_aprobar_hito(&intruso, &0),
        Err(Ok(Error::NoEsFirmante))
    );
    assert_eq!(
        e.contrato.try_aprobar_hito(&f0, &1),
        Err(Ok(Error::HitoInvalido))
    );

    e.contrato.aprobar_hito(&f0, &0);
    assert_eq!(
        e.contrato.try_aprobar_hito(&f0, &0),
        Err(Ok(Error::YaAprobado))
    );
}

#[test]
fn tres_hitos_completos_marcan_completada() {
    let e = escenario();
    e.financiar(0);
    let f0 = e.firmante(0);
    let f1 = e.firmante(1);

    for hito in 0..3u32 {
        e.contrato.aprobar_hito(&f0, &hito);
        e.contrato.aprobar_hito(&f1, &hito);
    }

    let resumen = e.contrato.estado();
    assert_eq!(resumen.estado, Estado::Completada);
    assert_eq!(resumen.hito_actual, 3);
    assert_eq!(e.token.balance(&e.config.restaurador), 1_000 * USDC);
    assert_eq!(
        e.contrato.try_aprobar_hito(&f0, &2),
        Err(Ok(Error::HitoInvalido))
    );
}

#[test]
fn aprobar_hito_exige_auth_del_firmante() {
    let e = escenario();
    e.financiar(0);
    let f0 = e.firmante(0);

    e.contrato.aprobar_hito(&f0, &0);

    assert_eq!(
        e.env.auths(),
        [(
            f0.clone(),
            AuthorizedInvocation {
                function: AuthorizedFunction::Contract((
                    e.id.clone(),
                    Symbol::new(&e.env, "aprobar_hito"),
                    (f0.clone(), 0u32).into_val(&e.env),
                )),
                sub_invocations: [].into(),
            },
        )]
    );
}
