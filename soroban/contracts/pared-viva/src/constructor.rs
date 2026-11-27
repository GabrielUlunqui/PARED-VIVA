use soroban_sdk::{Env, Vec};

use crate::almacen;
use crate::tipos::Config;

// TODO [A1]: validar 3 firmantes distintos, hitos que sumen la meta, montos > 0 y grilla no vacía.
pub fn inicializar(env: &Env, config: Config) {
    almacen::guardar_config(env, &config);
    almacen::guardar_recaudado(env, 0);
    almacen::guardar_hito_actual(env, 0);
    almacen::guardar_ocupados(env, &Vec::new(env));
    almacen::extender_instancia(env);
}
