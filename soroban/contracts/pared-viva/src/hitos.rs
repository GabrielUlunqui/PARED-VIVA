use soroban_sdk::{Address, Env, MuxedAddress, Vec};

use crate::almacen;
use crate::eventos::{HitoAprobado, HitoPagado};
use crate::tipos::{Clave, Error, Estado};

pub fn aprobar_hito(env: &Env, firmante: Address, hito: u32) -> Result<(), Error> {
    firmante.require_auth();
    let config = almacen::config(env);

    if !config.firmantes.contains(&firmante) {
        return Err(Error::NoEsFirmante);
    }
    match almacen::estado(env, &config) {
        Estado::Activa | Estado::Fallida => return Err(Error::MetaNoAlcanzada),
        Estado::Completada => return Err(Error::HitoInvalido),
        Estado::Financiada => {}
    }
    if hito != almacen::hito_actual(env) {
        return Err(Error::HitoInvalido);
    }
    if almacen::leer::<bool>(env, &Clave::Aprobacion(hito, firmante.clone())).is_some() {
        return Err(Error::YaAprobado);
    }

    almacen::guardar(env, &Clave::Aprobacion(hito, firmante.clone()), &true);
    let aprobaciones: u32 = almacen::leer(env, &Clave::Aprobaciones(hito)).unwrap_or(0) + 1;
    almacen::guardar(env, &Clave::Aprobaciones(hito), &aprobaciones);
    HitoAprobado {
        hito,
        firmante,
        aprobaciones,
    }
    .publish(env);

    if aprobaciones == 2 {
        let monto = config.hitos.get(hito).unwrap();
        almacen::token(env, &config).transfer(
            &env.current_contract_address(),
            &MuxedAddress::from(&config.restaurador),
            &monto,
        );
        almacen::guardar_hito_actual(env, hito + 1);
        HitoPagado {
            hito,
            restaurador: config.restaurador.clone(),
            monto,
        }
        .publish(env);
    }

    almacen::extender_instancia(env);
    Ok(())
}

pub fn aprobaciones(env: &Env, hito: u32) -> Vec<Address> {
    let config = almacen::config(env);
    let mut lista = Vec::new(env);
    for firmante in config.firmantes.iter() {
        if almacen::leer::<bool>(env, &Clave::Aprobacion(hito, firmante.clone())).unwrap_or(false) {
            lista.push_back(firmante);
        }
    }
    lista
}
