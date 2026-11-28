#![no_std]

mod admin;
mod almacen;
mod constructor;
mod donar;
mod eventos;
mod hitos;
mod lecturas;
mod reembolso;
mod tipos;

#[cfg(test)]
mod test;

pub use eventos::{Donacion, HitoAprobado, HitoPagado, Reembolso};
pub use tipos::{Clave, Config, Error, Estado, Ladrillo, Resumen};

use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, String, Vec};

#[contract]
pub struct ParedViva;

// Interfaz pública congelada (PLAN_DE_TRABAJO.md §4.1). La lógica vive en un módulo por tarea.
#[contractimpl]
impl ParedViva {
    pub fn __constructor(env: Env, config: Config) {
        constructor::inicializar(&env, config)
    }

    pub fn donar(env: Env, donante: Address, ladrillo_id: u32, recuerdo_cid: String, monto: i128) -> Result<(), Error> {
        donar::donar(&env, donante, ladrillo_id, recuerdo_cid, monto)
    }

    pub fn aprobar_hito(env: Env, firmante: Address, hito: u32) -> Result<(), Error> {
        hitos::aprobar_hito(&env, firmante, hito)
    }

    pub fn reembolsar(env: Env, donante: Address) -> Result<i128, Error> {
        reembolso::reembolsar(&env, donante)
    }

    pub fn retirar_excedente(env: Env) -> Result<i128, Error> {
        reembolso::retirar_excedente(&env)
    }

    pub fn estado(env: Env) -> Resumen {
        lecturas::estado(&env)
    }

    pub fn ladrillo(env: Env, id: u32) -> Option<Ladrillo> {
        lecturas::ladrillo(&env, id)
    }

    pub fn ladrillos(env: Env) -> Vec<Ladrillo> {
        lecturas::ladrillos(&env)
    }

    pub fn aporte(env: Env, donante: Address) -> i128 {
        lecturas::aporte(&env, donante)
    }

    pub fn firmantes(env: Env) -> Vec<Address> {
        lecturas::firmantes(&env)
    }

    pub fn aprobaciones(env: Env, hito: u32) -> Vec<Address> {
        hitos::aprobaciones(&env, hito)
    }

    pub fn es_guardian(env: Env, direccion: Address) -> bool {
        lecturas::es_guardian(&env, direccion)
    }

    pub fn ladrillos_pagina(env: Env, desde: u32, limite: u32) -> Vec<Ladrillo> {
        lecturas::ladrillos_pagina(&env, desde, limite)
    }

    pub fn total_ocupados(env: Env) -> u32 {
        lecturas::total_ocupados(&env)
    }

    pub fn rotar_firmante(env: Env, aprobador1: Address, aprobador2: Address, saliente: Address, nuevo: Address) -> Result<(), Error> {
        admin::rotar_firmante(&env, aprobador1, aprobador2, saliente, nuevo)
    }

    pub fn upgrade(env: Env, hash: BytesN<32>) {
        admin::upgrade(&env, hash)
    }
}
