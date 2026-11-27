use soroban_sdk::{Address, Env, Vec};

use crate::almacen;
use crate::tipos::{Clave, Ladrillo, Resumen};

pub fn estado(env: &Env) -> Resumen {
    let config = almacen::config(env);
    Resumen {
        estado: almacen::estado(env, &config),
        meta: config.meta,
        recaudado: almacen::recaudado(env),
        fecha_limite: config.fecha_limite,
        hito_actual: almacen::hito_actual(env),
        hitos: config.hitos,
        filas: config.filas,
        columnas: config.columnas,
        aporte_minimo: config.aporte_minimo,
    }
}

pub fn ladrillo(env: &Env, id: u32) -> Option<Ladrillo> {
    almacen::leer(env, &Clave::Ladrillo(id))
}

pub fn ladrillos(env: &Env) -> Vec<Ladrillo> {
    let mut lista = Vec::new(env);
    for id in almacen::ocupados(env).iter() {
        if let Some(l) = ladrillo(env, id) {
            lista.push_back(l);
        }
    }
    lista
}

pub fn aporte(env: &Env, donante: Address) -> i128 {
    almacen::leer(env, &Clave::Aporte(donante)).unwrap_or(0)
}

pub fn firmantes(env: &Env) -> Vec<Address> {
    almacen::config(env).firmantes
}

pub fn es_guardian(env: &Env, direccion: Address) -> bool {
    almacen::leer(env, &Clave::Guardian(direccion)).unwrap_or(false)
}
