use soroban_sdk::{Address, Env, String};

use crate::almacen;
use crate::eventos::Donacion;
use crate::tipos::{Clave, Error, Estado, Ladrillo};

pub fn donar(env: &Env, donante: Address, ladrillo_id: u32, recuerdo_cid: String, monto: i128) -> Result<(), Error> {
    donante.require_auth();
    let config = almacen::config(env);
    if almacen::estado(env, &config) != Estado::Activa {
        return Err(Error::CampaniaNoActiva);
    }
    if ladrillo_id >= config.filas * config.columnas {
        return Err(Error::LadrilloInvalido);
    }
    let clave_ladrillo = Clave::Ladrillo(ladrillo_id);
    let ocupado: Option<Ladrillo> = almacen::leer(env, &clave_ladrillo);
    if ocupado.is_some() {
        return Err(Error::LadrilloOcupado);
    }
    if monto < config.aporte_minimo {
        return Err(Error::MontoInsuficiente);
    }
    if recuerdo_cid.len() == 0 || recuerdo_cid.len() > 128 {
        return Err(Error::RecuerdoInvalido);
    }

    almacen::token(env, &config).transfer(&donante, &env.current_contract_address(), &monto);

    let ladrillo = Ladrillo {
        id: ladrillo_id,
        donante: donante.clone(),
        monto,
        recuerdo: recuerdo_cid.clone(),
        fecha: env.ledger().timestamp(),
    };
    almacen::guardar(env, &clave_ladrillo, &ladrillo);

    let mut ocupados = almacen::ocupados(env);
    ocupados.push_back(ladrillo_id);
    almacen::guardar_ocupados(env, &ocupados);
    almacen::guardar_recaudado(env, almacen::recaudado(env) + monto);

    let clave_aporte = Clave::Aporte(donante.clone());
    let aporte_previo: i128 = almacen::leer(env, &clave_aporte).unwrap_or(0);
    almacen::guardar(env, &clave_aporte, &(aporte_previo + monto));
    almacen::guardar(env, &Clave::Guardian(donante.clone()), &true);
    almacen::extender_instancia(env);

    Donacion {
        ladrillo_id,
        donante,
        monto,
        recuerdo: recuerdo_cid,
    }
    .publish(env);

    Ok(())
}
