#![allow(unused_variables)]

use soroban_sdk::{Address, Env};

use crate::tipos::Error;

// TODO [A5]: solo en estado Fallida; poner el aporte en 0 antes de transferir.
pub fn reembolsar(env: &Env, donante: Address) -> Result<i128, Error> {
    todo!()
}

// TODO [A5]: en estado Completada, enviar el saldo restante al fondo.
pub fn retirar_excedente(env: &Env) -> Result<i128, Error> {
    todo!()
}
