use soroban_sdk::{Address, Env};

use crate::almacen;
use crate::eventos::Reembolso;
use crate::tipos::{Clave, Error, Estado};

pub fn reembolsar(env: &Env, donante: Address) -> Result<i128, Error> {
    donante.require_auth();

    let config = almacen::config(env);
    if almacen::estado(env, &config) != Estado::Fallida {
        return Err(Error::NoReembolsable);
    }

    let clave = Clave::Aporte(donante.clone());
    let aporte: i128 = almacen::leer(env, &clave).unwrap_or(0);
    if aporte <= 0 {
        return Err(Error::SinAporte);
    }

    almacen::guardar(env, &clave, &0i128);
    almacen::guardar(env, &Clave::Guardian(donante.clone()), &false);
    almacen::token(env, &config).transfer(&env.current_contract_address(), &donante, &aporte);
    Reembolso { donante, monto: aporte }.publish(env);
    Ok(aporte)
}

pub fn retirar_excedente(env: &Env) -> Result<i128, Error> {
    let config = almacen::config(env);
    if almacen::estado(env, &config) != Estado::Completada {
        return Err(Error::CampaniaNoActiva);
    }

    let token = almacen::token(env, &config);
    let contrato = env.current_contract_address();
    let monto = token.balance(&contrato);
    if monto > 0 {
        token.transfer(&contrato, &config.fondo, &monto);
    }
    Ok(monto)
}
