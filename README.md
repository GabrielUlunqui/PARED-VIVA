# Pared Viva

> Otros proyectos financian la restauración de un mural. Pared Viva hace que el mural se mantenga solo, guarde la memoria del barrio y elija qué pared salvar después.

**Eje II — Memoria** (toca también **Territorio** y **Arte**). Construido sobre **Stellar / Soroban**.

---

## Índice

1. [La idea](#1-la-idea)
2. [El problema](#2-el-problema)
3. [Cómo funciona](#3-cómo-funciona)
4. [Por qué Stellar](#4-por-qué-stellar)
5. [Arquitectura](#5-arquitectura)
6. [Contratos](#6-contratos)
7. [Frontend](#7-frontend)
8. [Flujos de usuario](#8-flujos-de-usuario)
9. [Estructura del repositorio](#9-estructura-del-repositorio)
10. [Entorno de desarrollo](#10-entorno-de-desarrollo)
11. [Despliegue en testnet](#11-despliegue-en-testnet)
12. [Forma de trabajo](#12-forma-de-trabajo)
13. [Plan de desarrollo](#13-plan-de-desarrollo)
14. [Guion de la demo](#14-guion-de-la-demo)
15. [Riesgos y decisiones](#15-riesgos-y-decisiones)
16. [Pitch](#16-pitch)

---

## 1. La idea

Una colecta en USDC para restaurar un mural de un barrio de Mendoza. El mural se divide en una grilla de **ladrillos digitales**: cada aporte adopta un ladrillo, lo "pinta" en el mural virtual en tiempo real y le suma un **recuerdo** (foto, texto o audio) del donante. El archivo de la memoria del barrio se construye con las mismas donaciones.

Un contrato en Soroban guarda los fondos y los libera **por hitos** al restaurador cuando aprueban **2 de 3 firmantes**. Si no se llega a la meta antes de la fecha límite, **cada donante recupera su aporte**.

Después de restaurado, el mural sigue vivo:

- La **venta de láminas** reparte automáticamente entre el artista y un **fondo de mantenimiento**.
- Cada donante es **guardián** (token intransferible) y **vota qué pared del barrio se restaura después**.
- Un **QR en la pared física** abre el archivo de voces y recuerdos del lugar.

## 2. El problema

| Problema | Cómo lo resuelve Pared Viva |
|---|---|
| Las colectas barriales no son transparentes: nadie sabe en qué se gastó la plata | Fondos en un contrato público; se liberan solo por hitos aprobados por 2 de 3 firmantes |
| Si la colecta fracasa, la plata queda en el limbo | Reembolso automático si no se llega a la meta antes de la fecha límite |
| La memoria del lugar (fotos, historias) se pierde o se modifica | Cada recuerdo queda anclado on-chain con su hash: nadie puede alterarlo |
| Un mural restaurado se vuelve a deteriorar y no hay plata para mantenerlo | Láminas y cuidadores alimentan un fondo de mantenimiento permanente |
| Cada campaña termina y la comunidad se dispersa | Los guardianes votan la próxima pared: la campaña se vuelve un protocolo de barrio |

## 3. Cómo funciona

```
 ┌──────────────┐   adopta ladrillo + recuerdo   ┌────────────────────┐
 │   Vecino /   │ ─────────────────────────────▶ │  Contrato Campaña  │
 │   donante    │      (USDC + hash IPFS)        │  (escrow + grilla) │
 └──────────────┘                                └─────────┬──────────┘
        ▲                                                  │
        │ reembolso si no se llega a la meta               │ 2 de 3 firmantes
        └──────────────────────────────────────────────────┤ aprueban hito
                                                           ▼
                                                 ┌────────────────────┐
                                                 │    Restaurador     │
                                                 └────────────────────┘
 Después de la restauración:
 ┌──────────────┐  compra lámina  ┌────────────────────┐  % artista
 │  Comprador   │ ──────────────▶ │  Contrato Fondo    │ ──────────▶ Artista
 └──────────────┘                 │  (split + votos)   │  % fondo
 ┌──────────────┐  aporte USD 1   │                    │ ──────────▶ Fondo de mantenimiento
 │  Cuidador    │ ──────────────▶ │                    │
 └──────────────┘                 └─────────┬──────────┘
 ┌──────────────┐  vota próxima pared       │
 │  Guardián    │ ──────────────────────────┘ ──▶ financia la próxima campaña
 └──────────────┘
```

**Estados de una campaña:**

```
  Activa ──(meta alcanzada)──▶ Financiada ──(hito 1..N aprobados)──▶ Completada
    │
    └──(fecha límite sin meta)──▶ Fallida ──▶ reembolsos habilitados
```

## 4. Por qué Stellar

| Necesidad | Herramienta de Stellar |
|---|---|
| Aportes chicos sin que la comisión se coma la donación | Comisiones de fracciones de centavo |
| Moneda estable para donar desde cualquier lugar | **USDC** nativo vía **Stellar Asset Contract (SAC)** |
| Escrow, hitos, votos y reparto automático | **Soroban** (smart contracts en Rust) |
| Que un vecino sin cripto pueda donar | **Passkeys / smart wallets** (huella o FaceID) — *stretch goal* |
| Entrada y salida desde pesos o efectivo | **Anchors** (SEP-24 / SEP-6) — *fuera del MVP* |
| Aporte mensual de cuidadores | `approve` + `transfer_from` del SAC (allowance con vencimiento) |

## 5. Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                       Frontend (Astro)                          │
│  Mural en vivo · Donar · Ver ladrillo (QR) · Firmantes · Votos  │
└───────┬──────────────────────┬─────────────────────┬────────────┘
        │ firma de tx          │ lectura/simulación  │ subida de archivos
        ▼                      ▼                     ▼
┌───────────────┐     ┌──────────────────┐   ┌──────────────────────┐
│   Freighter   │     │  Stellar RPC     │   │ Endpoint de servidor │
│ (o passkey)   │     │  (testnet)       │   │ Astro → IPFS (Pinata)│
└───────────────┘     └────────┬─────────┘   └──────────────────────┘
                               ▼
               ┌───────────────────────────────────┐
               │            Soroban                │
               │  ┌─────────────┐  ┌─────────────┐ │
               │  │ pared-viva  │◀─│ fondo-barrio│ │  (llamada entre contratos:
               │  │ (campaña)   │  │ (fase 2)    │ │   ¿es guardián?)
               │  └──────┬──────┘  └──────┬──────┘ │
               │         └──────┬─────────┘        │
               │          ┌─────▼─────┐            │
               │          │ USDC (SAC)│            │
               │          └───────────┘            │
               └───────────────────────────────────┘
```

**Qué va on-chain y qué no:**

| On-chain (Soroban) | Off-chain |
|---|---|
| Aportes, saldos, estado de la campaña | Archivos de recuerdos (fotos, audios) → IPFS |
| Dueño y hash (CID) de cada ladrillo | Imagen base del mural |
| Aprobaciones de hitos y pagos | Textos descriptivos de propuestas → IPFS |
| Guardianes, propuestas y votos | |

El hash on-chain es lo que hace al archivo **inalterable**: si alguien cambia el archivo en IPFS, cambia su CID y deja de coincidir con el registrado.

## 6. Contratos

Se programan dos contratos propios y se usan contratos existentes de la red.

### 6.1 Contratos existentes (no se programan)

| Contrato | Uso |
|---|---|
| **USDC (Stellar Asset Contract)** | Recibir y enviar aportes con `transfer`, y aportes mensuales con `approve` / `transfer_from`. En testnet se puede usar un asset propio de prueba para no depender de faucets. |
| **Smart wallet con passkey** (p. ej. `passkey-kit`) | Opcional: donar con huella o FaceID sin instalar Freighter. |

### 6.2 `pared-viva` — Campaña (MVP)

Contrato principal: escrow, grilla de ladrillos, recuerdos y guardianes en **un solo contrato** para evitar llamadas entre contratos en el MVP.

**Configuración (constructor):**

```rust
fn __constructor(env: Env, config: Config)

#[contracttype]
pub struct Config {
    pub admin: Address,
    pub token: Address,          // USDC (SAC)
    pub restaurador: Address,
    pub fondo: Address,          // recibe el excedente sobre la meta
    pub firmantes: Vec<Address>, // exactamente 3
    pub meta: i128,              // en unidades del token (USDC tiene 7 decimales en Stellar)
    pub fecha_limite: u64,       // timestamp del ledger
    pub hitos: Vec<i128>,        // montos por hito; deben sumar `meta`
    pub filas: u32,
    pub columnas: u32,
    pub aporte_minimo: i128,     // monto mínimo por ladrillo (evita ocupar el mural con montos ínfimos)
}
```

**Funciones:**

| Función | Quién | Qué hace |
|---|---|---|
| `donar(donante, ladrillo_id, recuerdo_cid, monto)` | Donante | `require_auth`; valida que la campaña esté activa, el ladrillo libre y `monto >= aporte_minimo`; transfiere `monto` (lo elige el donante) del donante al contrato; registra el ladrillo; suma al aporte del donante; lo marca como guardián; emite evento |
| `aprobar_hito(firmante, hito)` | Firmante | `require_auth`; valida que sea uno de los 3, que la meta esté alcanzada y que el hito sea el siguiente pendiente; registra la aprobación; **con la 2.ª aprobación transfiere el monto del hito al restaurador** |
| `reembolsar(donante)` | Donante | Si pasó la fecha límite sin meta, devuelve el aporte completo y lo pone en 0 |
| `retirar_excedente()` | Cualquiera | Tras completar todos los hitos, envía el sobrante (aportes por encima de la meta) al `fondo` |
| `estado()` | Lectura | Devuelve `Resumen`: estado, meta, recaudado, fecha límite, hito actual, hitos, grilla y aporte mínimo |
| `ladrillo(id)` / `ladrillos()` | Lectura | Dueño, monto, CID y fecha de cada ladrillo (para pintar la grilla) |
| `aporte(donante)` | Lectura | Total aportado por una dirección |
| `es_guardian(direccion)` | Lectura | Usada por `fondo-barrio` para habilitar votos |

**Modelo de datos:**

```rust
#[contracttype]
pub enum Estado { Activa, Financiada, Completada, Fallida }

#[contracttype]
pub struct Ladrillo {
    pub id: u32,
    pub donante: Address,
    pub monto: i128,
    pub recuerdo: String, // CID de IPFS
    pub fecha: u64,
}

#[contracttype]
pub enum Clave {
    Config,                       // instance
    Recaudado,                    // instance
    HitoActual,                   // instance
    Ocupados,                     // instance: Vec<u32> con los ids adoptados
    Ladrillo(u32),                // persistent
    Aporte(Address),              // persistent
    Guardian(Address),            // persistent
    Aprobacion(u32, Address),     // persistent (hito, firmante)
    Aprobaciones(u32),            // persistent: cantidad de aprobaciones del hito
}
```

El esqueleto con estos tipos, los errores y todas las firmas está en `soroban/contracts/pared-viva/src/lib.rs`.

**Reglas de seguridad:**

- Toda función que mueve fondos o registra acciones llama a `require_auth()` sobre quien actúa.
- Los firmantes se fijan en el constructor y no se pueden cambiar.
- Un firmante no puede aprobar dos veces el mismo hito.
- Los hitos se liberan **en orden**, nunca dos veces.
- Reembolso solo en estado `Fallida`, y el aporte se pone en 0 **antes** de transferir.
- Validar montos (`> 0`) e índices de ladrillo (`< filas * columnas`).
- `overflow-checks = true` ya está activado en el perfil release del workspace.
- Las entradas `persistent` vencen si no se renueva su TTL: el contrato llama a `extend_ttl` al escribir ladrillos, aportes y guardianes.

**Eventos** (para que el frontend actualice el mural en vivo): `donacion`, `hito_ok`, `hito_pago`, `reembolso`. Topics, datos y códigos de error en [PLAN_DE_TRABAJO.md §4.1](PLAN_DE_TRABAJO.md#41-interfaz-del-contrato-pared-viva-dueño-a).

### 6.3 `fondo-barrio` — Fondo, láminas y votación (fase 2)

| Función | Quién | Qué hace |
|---|---|---|
| `__constructor(admin, token, campania, artista, fondo_bps)` | — | `fondo_bps` = porcentaje para el fondo en puntos básicos (p. ej. 3000 = 30 %) |
| `vender_lamina(comprador, monto)` | Comprador | Transfiere `monto`; envía `monto * (10000 - fondo_bps) / 10000` al artista y el resto queda en el fondo |
| `aportar(cuidador, monto)` | Cuidador | Aporte libre al fondo |
| `cobrar_cuidador(cuidador)` | Cualquiera (keeper) | Usa `transfer_from` sobre la allowance que el cuidador otorgó con `approve`; limitado a una vez por período |
| `proponer(guardian, descripcion_cid, monto)` | Guardián | Crea una propuesta de próxima pared |
| `votar(guardian, propuesta_id)` | Guardián | Verifica `es_guardian` llamando al contrato `pared-viva`; un voto por guardián por ronda |
| `cerrar_ronda()` | Admin | Al vencer la ronda, la propuesta ganadora recibe los fondos (o se crea su campaña) |

> **Pagos recurrentes:** Stellar no tiene débitos automáticos. El cuidador firma **una vez** un `approve` sobre el USDC a favor del contrato (con ledger de vencimiento) y un proceso externo llama `cobrar_cuidador` cada mes. Para la hackathon se puede mostrar como un aporte manual.

### 6.4 Token de guardián

En el MVP **no es un contrato separado**: es un registro `Guardian(Address) -> bool` dentro de `pared-viva`, sin función de transferencia (intransferible por diseño). Si más adelante se quiere mostrar en wallets como NFT, se puede usar la librería **OpenZeppelin Stellar Contracts** con `transfer` bloqueado.

### 6.5 Tests

Cada contrato tiene `src/test.rs` con tests del entorno de host (`cargo test`). Casos mínimos:

- [ ] Donar ladrillo libre registra ladrillo, aporte y guardián
- [ ] Donar menos del aporte mínimo falla
- [ ] Donar ladrillo ocupado falla
- [ ] Donar después de la fecha límite falla
- [ ] 1 aprobación no libera; 2 aprobaciones liberan el hito correcto
- [ ] Un no-firmante no puede aprobar; un firmante no puede aprobar dos veces
- [ ] Reembolso funciona solo en `Fallida` y solo una vez
- [ ] El excedente va al fondo al completar
- [ ] Split de láminas reparte exacto (sin perder centavos por redondeo)

## 7. Frontend

**Stack:** Astro 7 + `@stellar/stellar-sdk` + `@stellar/freighter-api`. Sin framework de UI en el MVP: componentes `.astro` con `<script>` en TypeScript. Si una vista se complica, se agrega React o Svelte con `astro add`.

**Páginas:**

| Ruta | Contenido |
|---|---|
| `/` | Hero, mural en vivo (grilla), barra de progreso hacia la meta, cuenta regresiva, botón "Adoptá un ladrillo" |
| `/ladrillo/[id]` | Recuerdo del ladrillo (foto/texto/audio desde IPFS), donante, fecha, link a la transacción. **Destino de los QR** |
| `/archivo` | Galería de todos los recuerdos |
| `/firmantes` | Panel para los 3 firmantes: hitos, fotos de avance, botón aprobar |
| `/guardianes` | Propuestas de próxima pared y votación (fase 2) |
| `/api/subir` | Endpoint de servidor: sube el archivo a IPFS y devuelve el CID (la clave de Pinata nunca llega al navegador) |

**Componentes:**

- `MuralGrid.astro` — dibuja la imagen del mural en una grilla; los ladrillos adoptados se ven a color y los libres en gris.
- `DonarModal.astro` — conectar wallet → elegir ladrillo → subir recuerdo → firmar `donar`.
- `ConectarWallet.astro` — `requestAccess` / `getAddress` de Freighter.
- `Progreso.astro` — recaudado vs. meta y fecha límite.

**Integración con los contratos:**

1. Generar el cliente TypeScript del contrato desplegado:
   ```sh
   stellar contract bindings typescript \
     --network testnet --contract-id <ID> \
     --output-dir frontend/src/contracts/pared-viva
   ```
2. Lecturas (`estado`, `ladrillos`): se simulan contra el RPC, no cuestan nada ni requieren firma.
3. Escrituras (`donar`, `aprobar_hito`): se arma la tx con el cliente, se firma con Freighter y se envía.
4. **Mural en vivo:** polling a `getEvents` del RPC cada pocos segundos filtrando eventos `donacion`.

**Variables de entorno** (`frontend/.env`, nunca se commitea):

```env
PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
PUBLIC_CONTRATO_PARED_VIVA=C...
PUBLIC_CONTRATO_USDC=C...
PINATA_JWT=...            # solo servidor, sin prefijo PUBLIC_
```

> El endpoint `/api/subir` y las páginas `/archivo` y `/ladrillo/[id]` corren en servidor (`prerender = false`) con el adapter `@astrojs/node`, ya instalado.

## 8. Flujos de usuario

**Donar un ladrillo**
1. El vecino entra a la web (o escanea el QR del cartel en la pared).
2. Toca un ladrillo gris en el mural.
3. Escribe un recuerdo y opcionalmente sube una foto → se sube a IPFS → CID.
4. Conecta Freighter y firma `donar(ladrillo, cid)`.
5. El ladrillo se pinta a color para todos los que están mirando.

**Liberar un hito**
1. El restaurador sube fotos del avance.
2. El firmante 1 aprueba en `/firmantes` → no pasa nada todavía.
3. El firmante 2 aprueba → el contrato transfiere el monto del hito al restaurador. Todo queda público.

**Campaña fallida**
1. Pasa la fecha límite sin meta → estado `Fallida`.
2. Cada donante ve el botón "Recuperar mi aporte" → firma `reembolsar`.

**Después de la restauración** (fase 2)
1. Se venden láminas → split automático artista / fondo.
2. Los guardianes proponen y votan la próxima pared.
3. El QR en la pared física lleva a `/archivo`.

## 9. Estructura del repositorio

La letra indica el dueño según [PLAN_DE_TRABAJO.md](PLAN_DE_TRABAJO.md). Los `TODO [A3]`, `TODO [B5]`, etc. en el código apuntan a la tarea del plan.

```
PARED VIVA/
├── README.md · PLAN_DE_TRABAJO.md
├── docs/pitch.md                        C
├── frontend/                            Astro (adapter Node)
│   ├── astro.config.mjs · package.json  C
│   ├── .env.example                     C
│   ├── public/                          C
│   └── src/
│       ├── contracts/config.ts          A  (IDs de contratos y red; acá van los bindings generados)
│       ├── lib/
│       │   ├── tipos.ts · eventos.ts    B  (interfaces congeladas)
│       │   ├── datos/                   B  (FuenteDatos: mock.ts / stellar.ts)
│       │   ├── stellar/                 B  (wallet, cliente, eventos-red, errores)
│       │   └── ipfs/                    C
│       ├── components/
│       │   ├── wallet/ · donar/         B
│       │   ├── mural/ · ui/             C
│       ├── layouts/ · styles/           C
│       └── pages/
│           ├── index · archivo · ladrillo/[id] · api/subir   C
│           └── firmantes · mi-aporte · guardianes            B
└── soroban/                             A
    ├── Cargo.toml                       (workspace; fija soroban-sdk)
    ├── scripts/                         (desplegar, fondear, sembrar-demo)
    └── contracts/
        ├── pared-viva/src/{lib.rs,test.rs}
        └── fondo-barrio/                (fase 2)
```

## 10. Entorno de desarrollo

### Herramientas instaladas

| Herramienta | Versión | Notas |
|---|---|---|
| Node.js | 24.x | |
| npm | 11.x | |
| Astro | 7.4.x | `frontend/` |
| @stellar/stellar-sdk | 17.4.x | |
| @stellar/freighter-api | 6.0.x | |
| Rust | 1.100 (toolchain `stable-x86_64-pc-windows-gnu`) | GNU en lugar de MSVC para no instalar Visual Studio Build Tools |
| Target `wasm32v1-none` | — | Target de compilación de contratos Soroban |
| Stellar CLI | 30.0.1 | Binario en `%USERPROFILE%\.cargo\bin\stellar.exe` |
| soroban-sdk | 29.x | Definido en `soroban/Cargo.toml` |

Además: extensión **Freighter** en el navegador, configurada en **Testnet**.

### Instalación desde cero (otra máquina)

```sh
# Rust
winget install Rustlang.Rustup        # en Linux/macOS: https://rustup.rs
rustup target add wasm32v1-none

# Stellar CLI
winget install Stellar.StellarCLI     # o binario desde github.com/stellar/stellar-cli/releases

# Frontend
cd frontend
npm install
```

### Comandos

```sh
# Contratos (desde soroban/)
stellar contract build                # compila todos los contratos a WASM
cargo test                            # tests

# Frontend (desde frontend/)
npm run dev                           # http://localhost:4321
npm run build
```

### ⚠️ Windows: Smart App Control

Si `stellar contract build` o `cargo test` fallan con:

```
Una directiva de Control de aplicaciones bloqueó este archivo. (os error 4551)
```

es **Smart App Control** de Windows 11 bloqueando los build scripts que Cargo genera (ejecutables sin firma). Opciones:

1. **Desactivar Smart App Control** (Seguridad de Windows → Control de aplicaciones y navegador → Smart App Control). En muchas versiones de Windows 11 **no se puede volver a activar sin reinstalar** Windows.
2. **Compilar dentro de WSL2 (Ubuntu)**: no le afecta Smart App Control. Requiere `wsl --install` (admin + reinicio) e instalar Rust y Stellar CLI dentro de Linux.
3. **Compilar en la nube** (GitHub Codespaces u otra máquina Linux/macOS) y traer el `.wasm` o desplegar desde ahí.

## 11. Despliegue en testnet

```sh
cd soroban

# 1. Identidades (se fondean con Friendbot)
stellar keys generate admin --network testnet --fund
stellar keys generate restaurador --network testnet --fund
stellar keys generate firmante1 --network testnet --fund
stellar keys generate firmante2 --network testnet --fund
stellar keys generate firmante3 --network testnet --fund
stellar keys generate fondo --network testnet --fund
stellar keys generate vecino --network testnet --fund

# 2. Token de prueba "USDC" emitido por admin y su contrato SAC
stellar contract asset deploy --asset USDC:$(stellar keys address admin) \
  --source-account admin --network testnet --alias usdc
# (cada cuenta que vaya a recibir el asset necesita su trustline:
#  stellar tx new change-trust --line USDC:<ADMIN> --source-account vecino --network testnet)
# (luego admin les envía USDC con `stellar contract invoke --id usdc -- mint ...`)

# 3. Compilar, desplegar la campaña y generar bindings (ver el script para el --config completo)
./scripts/desplegar.sh

# 4. Probar
stellar contract invoke --id pared-viva --network testnet --source-account vecino \
  -- donar --donante vecino --ladrillo_id 0 --recuerdo_cid "bafy..."
stellar contract invoke --id pared-viva --network testnet -- estado

# 5. Generar bindings para el frontend
stellar contract bindings typescript --network testnet --contract-id pared-viva \
  --output-dir ../frontend/src/contracts/pared-viva
```

> Montos: USDC en Stellar usa **7 decimales** → `1 USDC = 10_000_000`. En el ejemplo: meta 1.000 USDC, aporte mínimo por ladrillo 1 USDC (cada donante elige cuánto aportar).
> `stellar contract invoke --id pared-viva --network testnet -- -h` muestra la CLI generada con todas las funciones.

## 12. Forma de trabajo

> El plan detallado para 3 integrantes (tareas, propiedad de archivos, interfaces e integración) está en [PLAN_DE_TRABAJO.md](PLAN_DE_TRABAJO.md).

### Roles

| Rol | Responsabilidades |
|---|---|
| **Contratos** | `pared-viva`, tests, despliegue en testnet, bindings |
| **Frontend** | Astro, mural en vivo, flujo de donación, integración con Freighter e IPFS |
| **Producto / diseño / pitch** | Imagen del mural, UI, textos, cartel con QR, guion de la demo, slides |

Con 2 personas: contratos + frontend, y el pitch se reparte. Con 4: se suma alguien dedicado a diseño o se divide el frontend.

### Reglas del equipo

- **Rama `main` siempre funcionando.** Cada tarea en su rama (`feat/donar`, `feat/mural-grid`, `fix/...`) y se integra con pull request revisado por otra persona.
- **El contrato manda.** La interfaz (nombres de funciones, parámetros, eventos) de la sección 6 se acuerda **primero**; el frontend trabaja contra esa interfaz con datos falsos (mocks) mientras el contrato se termina.
- **Tests antes de desplegar.** Ningún cambio al contrato se despliega sin `cargo test` en verde.
- **Un solo despliegue "oficial" en testnet** cuyo ID está en `frontend/.env`; si se redespliega, se avisa y se regeneran los bindings.
- **Nada de secretos en el repo:** claves de Stellar en `stellar keys`, JWT de Pinata en `.env` (ignorado por git).
- **Sincronización corta** al inicio de cada bloque de trabajo: qué hice, qué sigue, qué me bloquea.

### Definición de "terminado"

Una tarea está terminada cuando: funciona en testnet, tiene tests (si es contrato), está en `main` y otra persona del equipo la probó.

## 13. Plan de desarrollo

### Fase 0 — Preparación
- [x] Proyecto Astro creado con SDKs de Stellar
- [x] Rust + `wasm32v1-none` + Stellar CLI instalados
- [x] Workspace Soroban inicializado (`soroban/`)
- [ ] Resolver compilación en Windows (ver sección 10)
- [ ] Freighter instalado y en testnet en todos los navegadores del equipo
- [ ] Cuenta en Pinata (IPFS) y JWT en `.env`
- [ ] Elegir el mural real y conseguir una foto en alta

### Fase 1 — MVP (lo que se presenta sí o sí)
- [ ] Contrato `pared-viva`: constructor, `donar`, `estado`, `ladrillos`
- [ ] `aprobar_hito` con liberación automática 2 de 3
- [ ] `reembolsar`
- [ ] Tests de la sección 6.5
- [ ] Despliegue en testnet + bindings
- [ ] Frontend: mural en grilla leyendo `ladrillos()`
- [ ] Frontend: flujo de donación con Freighter
- [ ] Subida de recuerdo a IPFS y página `/ladrillo/[id]`
- [ ] Panel `/firmantes`
- [ ] Mural en vivo con eventos

### Fase 2 — Diferenciales
- [ ] `retirar_excedente` al fondo
- [ ] Contrato `fondo-barrio`: split de láminas
- [ ] Propuestas y votación de guardianes
- [ ] QR imprimible por ladrillo y cartel para la pared

### Fase 3 — Si sobra tiempo
- [ ] Donar con passkey (sin Freighter)
- [ ] Aporte mensual de cuidadores con `approve` / `transfer_from`
- [ ] Entrada desde pesos con un anchor
- [ ] Múltiples murales (fábrica de campañas)

## 14. Guion de la demo

1. **El problema (30 s):** foto del mural deteriorado. "El barrio quiere restaurarlo, pero nadie confía en una colecta."
2. **Donar en vivo (60 s):** alguien del jurado o del público escanea el QR, elige un ladrillo, deja un recuerdo y firma. **El ladrillo se pinta en la pantalla grande.**
3. **Confianza (45 s):** se alcanza la meta. El firmante 1 aprueba → no pasa nada. El firmante 2 aprueba → el restaurador recibe el hito. Se muestra la tx en el explorador.
4. **Memoria (30 s):** se abre el ladrillo donado: el recuerdo, con su hash on-chain. "Nadie puede alterarlo."
5. **El diferencial (45 s):** venta de una lámina con reparto automático; los guardianes votan la próxima pared. "Ellos financian un mural. Nosotros, un barrio."

> Tener preparado: cuentas de testnet fondeadas, campaña desplegada **casi** en la meta y un video de respaldo por si falla la conexión.

## 15. Riesgos y decisiones

| Riesgo / decisión | Mitigación |
|---|---|
| Pagar en pesos requiere un anchor con liquidez en ARS | Fuera del MVP; en la demo se dona en USDC |
| No hay pagos recurrentes nativos | `approve` + `transfer_from` con un keeper; en la demo, aporte manual |
| Las entradas de Soroban vencen (TTL / rent) | `extend_ttl` al escribir; documentar renovación periódica |
| Llamadas entre contratos agregan complejidad | MVP en un solo contrato; `fondo-barrio` solo consulta `es_guardian` |
| Archivos en IPFS pueden dejar de estar disponibles si nadie los "pinea" | Pinning en Pinata; el hash on-chain igual prueba integridad |
| Un firmante pierde su clave | 2 de 3: con dos firmantes activos se sigue operando |
| Contenido inapropiado en recuerdos | Moderación en el frontend (ocultar), aunque el hash quede on-chain; no subir datos personales sensibles |
| Smart App Control bloquea compilación en Windows | Ver sección 10 |

## 16. Pitch

**Pared Viva (Eje II, Memoria; toca también Territorio)**

Una colecta en USDC para restaurar un mural de un barrio de Mendoza, donde cada aporte adopta un ladrillo del mural digital y le suma un recuerdo o una foto del donante. Un contrato en Soroban libera los fondos por hitos cuando aprueban 2 de 3 firmantes, y si no se llega a la meta, cada donante recupera su aporte. Después de restaurado, la venta de láminas financia el mantenimiento y los donantes votan qué pared se restaura después.
