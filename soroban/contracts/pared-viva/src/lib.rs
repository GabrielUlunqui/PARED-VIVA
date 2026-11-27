#![no_std]
#![allow(unused_variables)]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Estado {
    Activa,
    Financiada,
    Completada,
    Fallida,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Config {
    pub admin: Address,
    pub token: Address,
    pub restaurador: Address,
    pub fondo: Address,
    pub firmantes: Vec<Address>,
    pub meta: i128,
    pub fecha_limite: u64,
    pub hitos: Vec<i128>,
    pub filas: u32,
    pub columnas: u32,
    pub precio_ladrillo: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Resumen {
    pub estado: Estado,
    pub meta: i128,
    pub recaudado: i128,
    pub fecha_limite: u64,
    pub hito_actual: u32,
    pub hitos: Vec<i128>,
    pub filas: u32,
    pub columnas: u32,
    pub precio_ladrillo: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Ladrillo {
    pub id: u32,
    pub donante: Address,
    pub monto: i128,
    pub recuerdo: String,
    pub fecha: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum Clave {
    Config,
    Recaudado,
    HitoActual,
    Ocupados,
    Ladrillo(u32),
    Aporte(Address),
    Guardian(Address),
    Aprobacion(u32, Address),
    Aprobaciones(u32),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    CampaniaNoActiva = 1,
    LadrilloOcupado = 2,
    LadrilloInvalido = 3,
    NoEsFirmante = 4,
    YaAprobado = 5,
    HitoInvalido = 6,
    MetaNoAlcanzada = 7,
    NoReembolsable = 8,
    SinAporte = 9,
}

#[contract]
pub struct ParedViva;

#[contractimpl]
impl ParedViva {
    // TODO [A1]: validar 3 firmantes, hitos que sumen la meta y montos > 0.
    pub fn __constructor(env: Env, config: Config) {
        let storage = env.storage().instance();
        storage.set(&Clave::Config, &config);
        storage.set(&Clave::Recaudado, &0i128);
        storage.set(&Clave::HitoActual, &0u32);
        storage.set(&Clave::Ocupados, &Vec::<u32>::new(&env));
    }

    // TODO [A1] guardar el ladrillo · [A3] auth, validaciones, transferencia, guardián, evento, TTL.
    pub fn donar(env: Env, donante: Address, ladrillo_id: u32, recuerdo_cid: String) -> Result<(), Error> {
        todo!()
    }

    // TODO [A4]: 2 de 3 aprobaciones liberan el hito al restaurador.
    pub fn aprobar_hito(env: Env, firmante: Address, hito: u32) -> Result<(), Error> {
        todo!()
    }

    // TODO [A5]: solo en estado Fallida; poner el aporte en 0 antes de transferir.
    pub fn reembolsar(env: Env, donante: Address) -> Result<i128, Error> {
        todo!()
    }

    // TODO [A5]: en estado Completada, enviar el saldo restante al fondo.
    pub fn retirar_excedente(env: Env) -> Result<i128, Error> {
        todo!()
    }

    // TODO [A1]: calcular Fallida si venció la fecha límite sin meta.
    pub fn estado(env: Env) -> Resumen {
        todo!()
    }

    // TODO [A1]
    pub fn ladrillo(env: Env, id: u32) -> Option<Ladrillo> {
        todo!()
    }

    // TODO [A1]: recorrer Clave::Ocupados.
    pub fn ladrillos(env: Env) -> Vec<Ladrillo> {
        todo!()
    }

    // TODO [A1]
    pub fn aporte(env: Env, donante: Address) -> i128 {
        todo!()
    }

    // TODO [A1]: usada por fondo-barrio para habilitar votos.
    pub fn es_guardian(env: Env, direccion: Address) -> bool {
        todo!()
    }
}

mod test;
