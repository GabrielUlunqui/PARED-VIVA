use soroban_sdk::{Address, BytesN, Env};

use crate::almacen;
use crate::tipos::Error;

/// Reemplaza un firmante con la aprobación explícita de los otros dos.
/// Ambos aprobadores firman la transacción; deben ser firmantes actuales
/// distintos entre sí y distintos del saliente.
pub fn rotar_firmante(
    env: &Env,
    aprobador1: Address,
    aprobador2: Address,
    saliente: Address,
    nuevo: Address,
) -> Result<(), Error> {
    if aprobador1 == aprobador2 {
        return Err(Error::NoEsAprobador);
    }
    // validar antes de exigir auth: un require_auth duplicado para la misma
    // direccion aborta la transaccion en vez de devolver error.
    aprobador1.require_auth();
    aprobador2.require_auth();

    let mut config = almacen::config(env);
    let firmantes = config.firmantes.clone();
    if !firmantes.contains(&aprobador1) || !firmantes.contains(&aprobador2) {
        return Err(Error::NoEsFirmante);
    }
    if aprobador1 == saliente || aprobador2 == saliente {
        return Err(Error::NoEsAprobador);
    }
    let posicion = firmantes
        .iter()
        .position(|f| f == saliente)
        .ok_or(Error::NoEsFirmante)?;
    if firmantes.contains(&nuevo) {
        return Err(Error::NoEsAprobador);
    }

    config.firmantes.set(posicion as u32, nuevo);
    almacen::guardar_config(env, &config);
    almacen::extender_instancia(env);
    Ok(())
}

/// Permite actualizar el wasm con la firma del admin. Decisión de gobernanza:
/// centraliza poder en una sola clave; la alternativa es exigir 2 de 3 firmantes.
pub fn upgrade(env: &Env, hash: BytesN<32>) {
    let config = almacen::config(env);
    config.admin.require_auth();
    env.deployer().update_current_contract_wasm(hash);
}
