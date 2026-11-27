#![allow(unused_variables)]

use soroban_sdk::{Address, Env, Vec};

use crate::tipos::Error;

// TODO [A4]: 2 de 3 aprobaciones liberan el hito al restaurador.
pub fn aprobar_hito(env: &Env, firmante: Address, hito: u32) -> Result<(), Error> {
    todo!()
}

// TODO [A4]: firmantes que aprobaron el hito (recorrer firmantes y leer Clave::Aprobacion(hito, f)).
pub fn aprobaciones(env: &Env, hito: u32) -> Vec<Address> {
    todo!()
}
