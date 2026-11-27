use soroban_sdk::{testutils::Address as _, vec, Address, Env, Vec as SdkVec};

use super::comun::*;
use crate::{Config, Estado, ParedViva};

fn config_base() -> (Env, Config) {
    let env = Env::default();
    let token = Address::generate(&env);
    let cfg = config(&env, token);
    (env, cfg)
}

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

#[test]
fn aporte_y_guardian_se_leen_despues_de_un_aporte() {
    let e = escenario();
    let donante = Address::generate(&e.env);
    e.simular_aporte(&donante, 7 * USDC);

    assert_eq!(e.contrato.aporte(&donante), 7 * USDC);
    assert!(e.contrato.es_guardian(&donante));

    let otro = Address::generate(&e.env);
    assert_eq!(e.contrato.aporte(&otro), 0);
    assert!(!e.contrato.es_guardian(&otro));
}

#[test]
fn estado_pasa_a_fallida_vencida_sin_meta() {
    let e = escenario();
    e.vencer();
    assert_eq!(e.contrato.estado().estado, Estado::Fallida);
}

#[test]
fn estado_pasa_a_financiada_al_llegar_a_la_meta() {
    let e = escenario();
    e.financiar(0);
    let r = e.contrato.estado();
    assert_eq!(r.estado, Estado::Financiada);
    assert_eq!(r.recaudado, META);
}

#[test]
#[should_panic(expected = "se necesitan exactamente 3 firmantes")]
fn constructor_exige_exactamente_tres_firmantes() {
    let (env, mut cfg) = config_base();
    cfg.firmantes = vec![&env, Address::generate(&env), Address::generate(&env)];
    env.register(ParedViva, (cfg,));
}

#[test]
#[should_panic(expected = "los firmantes deben ser distintos")]
fn constructor_exige_firmantes_distintos() {
    let (env, mut cfg) = config_base();
    let repetido = Address::generate(&env);
    cfg.firmantes = vec![&env, repetido.clone(), repetido, Address::generate(&env)];
    env.register(ParedViva, (cfg,));
}

#[test]
#[should_panic(expected = "la meta debe ser mayor que cero")]
fn constructor_exige_meta_positiva() {
    let (env, mut cfg) = config_base();
    cfg.meta = 0;
    env.register(ParedViva, (cfg,));
}

#[test]
#[should_panic(expected = "el aporte minimo debe ser mayor que cero")]
fn constructor_exige_aporte_minimo_positivo() {
    let (env, mut cfg) = config_base();
    cfg.aporte_minimo = 0;
    env.register(ParedViva, (cfg,));
}

#[test]
#[should_panic(expected = "las filas deben ser mayores que cero")]
fn constructor_exige_filas_positivas() {
    let (env, mut cfg) = config_base();
    cfg.filas = 0;
    env.register(ParedViva, (cfg,));
}

#[test]
#[should_panic(expected = "las columnas deben ser mayores que cero")]
fn constructor_exige_columnas_positivas() {
    let (env, mut cfg) = config_base();
    cfg.columnas = 0;
    env.register(ParedViva, (cfg,));
}

#[test]
#[should_panic(expected = "debe haber al menos un hito")]
fn constructor_exige_al_menos_un_hito() {
    let (env, mut cfg) = config_base();
    cfg.hitos = SdkVec::new(&env);
    env.register(ParedViva, (cfg,));
}

#[test]
#[should_panic(expected = "cada hito debe ser mayor que cero")]
fn constructor_exige_hitos_positivos() {
    let (env, mut cfg) = config_base();
    cfg.hitos = vec![&env, 400 * USDC, 0, 300 * USDC];
    env.register(ParedViva, (cfg,));
}

#[test]
#[should_panic(expected = "la suma de los hitos debe ser igual a la meta")]
fn constructor_exige_hitos_que_sumen_la_meta() {
    let (env, mut cfg) = config_base();
    cfg.hitos = vec![&env, 400 * USDC, 300 * USDC, 200 * USDC];
    env.register(ParedViva, (cfg,));
}
