use super::comun::*;
use crate::Estado;

#[test]
fn se_despliega_con_config() {
    let e = escenario();
    let r = e.contrato.estado();
    assert_eq!(r.estado, Estado::Activa);
    assert_eq!(r.recaudado, 0);
    assert_eq!(r.meta, META);
    assert_eq!(e.contrato.firmantes(), e.config.firmantes);
    assert!(e.contrato.ladrillos().is_empty());
}

// TODO [A1]: validaciones del constructor (firmantes, hitos que suman la meta, montos > 0, grilla).
