use soroban_sdk::{Env, Vec};

use crate::almacen;
use crate::tipos::Config;

pub fn inicializar(env: &Env, config: Config) {
    assert!(config.firmantes.len() == 3, "se necesitan exactamente 3 firmantes");
    let f0 = config.firmantes.get(0).unwrap();
    let f1 = config.firmantes.get(1).unwrap();
    let f2 = config.firmantes.get(2).unwrap();
    assert!(f0 != f1 && f0 != f2 && f1 != f2, "los firmantes deben ser distintos");
    assert!(config.meta > 0, "la meta debe ser mayor que cero");
    assert!(config.aporte_minimo > 0, "el aporte minimo debe ser mayor que cero");
    assert!(config.filas > 0, "las filas deben ser mayores que cero");
    assert!(config.columnas > 0, "las columnas deben ser mayores que cero");
    assert!(!config.hitos.is_empty(), "debe haber al menos un hito");

    let mut suma: i128 = 0;
    for hito in config.hitos.iter() {
        assert!(hito > 0, "cada hito debe ser mayor que cero");
        suma = suma.checked_add(hito).expect("la suma de los hitos excede el rango");
    }
    assert!(suma == config.meta, "la suma de los hitos debe ser igual a la meta");

    almacen::guardar_config(env, &config);
    almacen::guardar_recaudado(env, 0);
    almacen::guardar_hito_actual(env, 0);
    almacen::guardar_ocupados(env, &Vec::new(env));
    almacen::extender_instancia(env);
}
