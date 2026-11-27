#![allow(unused_variables)]

use soroban_sdk::{Address, Env, String};

use crate::tipos::Error;

// TODO [A3]: auth, validaciones (estado Activa, ladrillo válido y libre, monto >= aporte_minimo),
// transferencia de `monto`, ladrillo, aporte, guardián, evento Donacion y TTL.
pub fn donar(env: &Env, donante: Address, ladrillo_id: u32, recuerdo_cid: String, monto: i128) -> Result<(), Error> {
    todo!()
}
