use soroban_sdk::{contracterror, contracttype, Address, String, Vec};

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
    pub aporte_minimo: i128,
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
    pub aporte_minimo: i128,
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
    MontoInsuficiente = 20,
    RecuerdoInvalido = 21,
    NoEsAprobador = 22,
}
