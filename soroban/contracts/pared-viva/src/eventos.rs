use soroban_sdk::{contractevent, Address, String};

// Topics y data según PLAN_DE_TRABAJO.md §4.1. Se publican con `Evento { .. }.publish(env)`.

#[contractevent(topics = ["donacion"], data_format = "vec")]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Donacion {
    #[topic]
    pub ladrillo_id: u32,
    pub donante: Address,
    pub monto: i128,
    pub recuerdo: String,
}

#[contractevent(topics = ["hito_ok"], data_format = "vec")]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HitoAprobado {
    #[topic]
    pub hito: u32,
    pub firmante: Address,
    pub aprobaciones: u32,
}

#[contractevent(topics = ["hito_pago"], data_format = "vec")]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HitoPagado {
    #[topic]
    pub hito: u32,
    pub restaurador: Address,
    pub monto: i128,
}

#[contractevent(topics = ["reembolso"], data_format = "vec")]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Reembolso {
    pub donante: Address,
    pub monto: i128,
}
