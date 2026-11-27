# Pared Viva — Plan de trabajo para 3 integrantes

Este documento divide el desarrollo en **tres frentes independientes** para que cada integrante avance solo, sin pisar archivos de los demás. La idea, la arquitectura y los contratos están en el [README](README.md); acá está **quién hace qué, en qué orden y cómo se integra**.

---

## Índice

1. [Principios](#1-principios)
2. [Los 3 roles](#2-los-3-roles)
3. [Mapa de propiedad de archivos](#3-mapa-de-propiedad-de-archivos)
4. [Interfaces compartidas (lo que se congela el día 1)](#4-interfaces-compartidas-lo-que-se-congela-el-día-1)
5. [Kickoff (los 3 juntos)](#5-kickoff-los-3-juntos)
6. [Integrante A — Contratos y red](#6-integrante-a--contratos-y-red)
7. [Integrante B — Integración Stellar y transacciones](#7-integrante-b--integración-stellar-y-transacciones)
8. [Integrante C — Experiencia, memoria y presentación](#8-integrante-c--experiencia-memoria-y-presentación)
9. [Puntos de integración](#9-puntos-de-integración)
10. [Dependencias y cómo no bloquearse](#10-dependencias-y-cómo-no-bloquearse)
11. [Git y revisión](#11-git-y-revisión)
12. [Comunicación](#12-comunicación)
13. [Checklist final de entrega](#13-checklist-final-de-entrega)

---

## 1. Principios

1. **Cada archivo tiene un solo dueño.** Solo el dueño lo modifica. Si otro necesita un cambio, se lo pide al dueño (mensaje o issue). Así no hay conflictos de merge.
2. **Primero se acuerdan las interfaces, después se programa.** Las firmas del contrato, los tipos TypeScript, los eventos entre componentes y el formato de los recuerdos se cierran en el kickoff (sección 4). Cambiarlas requiere el OK de los 3.
3. **Nadie espera a nadie.** Todo lo que depende de otro integrante se desarrolla primero contra un **mock** (datos falsos con la misma forma) y después se conecta a lo real.
4. **`main` siempre funciona.** Se trabaja en ramas propias y se integra con pull request.
5. **Solo A necesita Rust.** B y C trabajan solo con Node y el navegador. Así el bloqueo de Smart App Control en Windows (README §10) afecta a una sola persona.

## 2. Los 3 roles

| | **A — Contratos y red** | **B — Integración Stellar** | **C — Experiencia y memoria** |
|---|---|---|---|
| Resumen | Escribe, testea y despliega los contratos Soroban | Conecta el frontend con la blockchain: wallet, lecturas, transacciones y eventos | Diseña y construye lo que se ve, el archivo de memorias (IPFS) y la presentación |
| Lenguaje | Rust | TypeScript | Astro, CSS, TypeScript |
| Carpeta principal | `soroban/` | `frontend/src/lib/stellar/`, `frontend/src/lib/datos/` | `frontend/src/components/mural/`, `frontend/src/pages/` |
| Herramientas | Rust, Stellar CLI, WSL o Codespaces | Node, Freighter | Node, Freighter, Pinata, Figma (opcional) |
| Entregable estrella | Contrato `pared-viva` en testnet con tests | Donar desde la web y verlo en vivo | Mural que se pinta en vivo + demo + pitch |

## 3. Mapa de propiedad de archivos

> Regla: si un archivo no está en la tabla, el dueño es quien lo crea **dentro de su carpeta**. Si hace falta un archivo nuevo fuera de las carpetas asignadas, se acuerda en el chat antes de crearlo.

### Integrante A

| Ruta | Contenido |
|---|---|
| `soroban/**` | Todo el workspace de contratos, tests y scripts |
| `soroban/scripts/**` | Scripts de despliegue, fondeo de cuentas y carga de datos de demo |
| `frontend/src/contracts/**` | Bindings TypeScript **generados** + `config.ts` con IDs de contratos y red |

### Integrante B

| Ruta | Contenido |
|---|---|
| `frontend/src/lib/tipos.ts` | Tipos compartidos (contenido congelado en el kickoff) |
| `frontend/src/lib/eventos.ts` | Nombres y payloads de los eventos del navegador (congelado en el kickoff) |
| `frontend/src/lib/datos/**` | Interfaz `FuenteDatos` + implementación mock + implementación real |
| `frontend/src/lib/stellar/**` | RPC, wallet, armado y envío de transacciones, polling de eventos, errores |
| `frontend/src/components/wallet/**` | `ConectarWallet.astro` |
| `frontend/src/components/donar/**` | `DonarModal.astro` (flujo completo de donación) |
| `frontend/src/pages/firmantes.astro` | Panel de aprobación de hitos |
| `frontend/src/pages/mi-aporte.astro` | Ver mi aporte y pedir reembolso |
| `frontend/src/pages/guardianes.astro` | Propuestas y votación (fase 2) |

### Integrante C

| Ruta | Contenido |
|---|---|
| `frontend/package.json`, `frontend/package-lock.json` | Dependencias (B y A piden agregar paquetes a C) |
| `frontend/astro.config.mjs`, `frontend/tsconfig.json` | Configuración de Astro (adapter de servidor) |
| `frontend/.env.example` | Variables secretas de servidor (`PINATA_JWT`) |
| `frontend/public/**` | Imagen del mural, íconos, fuentes |
| `frontend/src/layouts/**` | `Base.astro` (HTML, head, nav, footer) |
| `frontend/src/styles/**` | Variables de diseño y estilos globales |
| `frontend/src/components/ui/**` | `Boton`, `Modal`, `Tarjeta`, `BarraProgreso`, `CuentaRegresiva` |
| `frontend/src/components/mural/**` | `MuralGrid.astro`, `Progreso.astro` |
| `frontend/src/lib/ipfs/**` | `subirRecuerdo()`, `leerRecuerdo()` |
| `frontend/src/pages/index.astro` | Home (compone componentes de B y C) |
| `frontend/src/pages/archivo.astro` | Galería de recuerdos |
| `frontend/src/pages/ladrillo/[id].astro` | Página de un ladrillo (destino del QR) |
| `frontend/src/pages/api/subir.ts` | Endpoint de servidor que sube a IPFS |
| `docs/**` | Pitch, slides, guion, cartel con QR, capturas, video de respaldo |

### Archivos de todos (se tocan solo con acuerdo)

| Ruta | Regla |
|---|---|
| `README.md`, `PLAN_DE_TRABAJO.md` | Cualquiera puede proponer cambios por PR; se aprueban entre los 3 |
| `.gitignore` (raíz) | Se crea en el kickoff y no se toca más |

## 4. Interfaces compartidas (lo que se congela el día 1)

Estas cuatro piezas son el "contrato" entre integrantes. Mientras se respeten, cada uno puede trabajar solo.

### 4.1 Interfaz del contrato `pared-viva` (dueño: A)

Las firmas de la **sección 6.2 del README** son definitivas: `__constructor`, `donar`, `aprobar_hito`, `reembolsar`, `retirar_excedente`, `estado`, `ladrillo`, `ladrillos`, `aporte`, `es_guardian`.

Eventos que emite el contrato (topics → data):

| Evento | Topics | Data |
|---|---|---|
| Donación | `("donacion", ladrillo_id: u32)` | `(donante: Address, monto: i128, recuerdo: String)` |
| Hito aprobado | `("hito_ok", hito: u32)` | `(firmante: Address, aprobaciones: u32)` |
| Hito liberado | `("hito_pago", hito: u32)` | `(restaurador: Address, monto: i128)` |
| Reembolso | `("reembolso",)` | `(donante: Address, monto: i128)` |

Errores (`#[contracterror]`, el número es lo que ve el frontend):

| Código | Nombre | Cuándo |
|---|---|---|
| 1 | `CampaniaNoActiva` | Donar fuera de estado `Activa` |
| 2 | `LadrilloOcupado` | El ladrillo ya tiene dueño |
| 3 | `LadrilloInvalido` | `id >= filas * columnas` |
| 4 | `NoEsFirmante` | Aprueba alguien que no es de los 3 |
| 5 | `YaAprobado` | El firmante ya aprobó ese hito |
| 6 | `HitoInvalido` | No es el siguiente hito pendiente |
| 7 | `MetaNoAlcanzada` | Aprobar sin estar en `Financiada` |
| 8 | `NoReembolsable` | Reembolsar fuera de `Fallida` |
| 9 | `SinAporte` | Reembolsar sin aporte o ya reembolsado |

### 4.2 Tipos TypeScript (dueño: B) — `frontend/src/lib/tipos.ts`

```ts
export type EstadoCampania = 'Activa' | 'Financiada' | 'Completada' | 'Fallida';

export interface Campania {
  estado: EstadoCampania;
  meta: bigint;            // unidades del token (1 USDC = 10_000_000n)
  recaudado: bigint;
  fechaLimite: number;     // timestamp en segundos
  hitoActual: number;      // índice del próximo hito pendiente
  hitos: bigint[];         // monto de cada hito
  filas: number;
  columnas: number;
  precioLadrillo: bigint;
}

export interface Ladrillo {
  id: number;
  donante: string;         // dirección G...
  monto: bigint;
  recuerdoCid: string;     // CID del JSON de recuerdo en IPFS
  fecha: number;           // timestamp en segundos
}

export interface Recuerdo {          // JSON guardado en IPFS
  version: 1;
  texto: string;                     // máx. 280 caracteres
  imagenCid?: string;                // CID de la imagen, si hay
  alias?: string;                    // nombre que quiere mostrar el donante
  creado: string;                    // ISO 8601
}
```

### 4.3 Fuente de datos (dueño: B) — `frontend/src/lib/datos/index.ts`

Las páginas de C leen datos **solo** a través de esta interfaz. Al principio devuelve el mock; cuando B termina la versión real, cambia una línea y C no toca nada.

```ts
import type { Campania, Ladrillo } from '../tipos';

export interface FuenteDatos {
  obtenerCampania(): Promise<Campania>;
  obtenerLadrillos(): Promise<Ladrillo[]>;
  obtenerLadrillo(id: number): Promise<Ladrillo | null>;
  suscribirDonaciones(cb: (l: Ladrillo) => void): () => void; // devuelve "desuscribir"
}

export const datos: FuenteDatos = /* fuenteMock | fuenteStellar */;
```

### 4.4 Eventos del navegador (dueño: B) — `frontend/src/lib/eventos.ts`

Los componentes de B y C se comunican con `CustomEvent` sobre `window`, sin importarse entre sí.

| Evento | Lo emite | Lo escucha | `detail` |
|---|---|---|---|
| `pv:ladrillo-seleccionado` | C (`MuralGrid`) | B (`DonarModal`) | `{ id: number }` |
| `pv:donacion-confirmada` | B (`DonarModal`) | C (`MuralGrid`, `Progreso`) | `{ ladrillo: Ladrillo, txHash: string }` |
| `pv:wallet-cambiada` | B (`ConectarWallet`) | B y C | `{ direccion: string \| null }` |

### 4.5 IPFS (dueño: C) — `frontend/src/lib/ipfs/index.ts`

```ts
// Sube imagen (opcional) + JSON Recuerdo; devuelve el CID del JSON.
export function subirRecuerdo(texto: string, imagen?: File, alias?: string): Promise<string>;
export function leerRecuerdo(cid: string): Promise<Recuerdo>;
export function urlGateway(cid: string): string;
```

Límites: imagen ≤ 2 MB, formatos `jpg`, `png`, `webp`; texto ≤ 280 caracteres.

## 5. Kickoff (los 3 juntos)

Duración estimada: una sesión corta. Al terminar, cada uno puede irse a trabajar solo.

- [ ] Leer juntos el README y este plan; ajustar lo que no convenza.
- [ ] Repasar y **congelar** las interfaces de la sección 4.
- [x] Crear el repositorio en GitHub y agregar a los 3 como colaboradores.
- [x] Crear `.gitignore` en la raíz.
- [x] Crear el archivo `CODEOWNERS` (sección 11) con los usuarios de GitHub reales.
- [x] Subir la estructura inicial: interfaces de la sección 4 ya implementadas (`tipos.ts`, `eventos.ts`, `datos/` con mock, `ipfs/` con stub, `contracts/config.ts`), esqueleto del contrato y páginas/componentes vacíos de cada integrante con `TODO [tarea]`.
- [ ] Activar protección de `main` (requiere PR y 1 aprobación).
- [ ] Cada uno clona el repo, corre `npm install` en `frontend/`, copia `.env.example` a `.env` y verifica `npm run dev`.
- [ ] Cada uno instala Freighter, la pone en **Testnet** y comparte su dirección `G...` pública en el chat (A la necesita para fondearla).
- [ ] Elegir el mural real, conseguir una foto en alta y definir el tamaño de la grilla (sugerido 20 × 30 = 600 ladrillos).

> Para encontrar el trabajo pendiente de cada uno: buscar `TODO [A`, `TODO [B` o `TODO [C` en el código.

## 6. Integrante A — Contratos y red

**Objetivo:** el contrato `pared-viva` (y en fase 2 `fondo-barrio`) funcionando en testnet, con tests, y los bindings listos para el frontend.

### A0. Entorno
- [ ] Destrabar la compilación (README §10): WSL2 recomendado, o Codespaces.
- [ ] En ese entorno: Rust, `rustup target add wasm32v1-none`, Stellar CLI.
- [ ] `stellar contract build` y `cargo test` compilan la plantilla actual.
- [ ] Crear identidades: `admin`, `restaurador`, `firmante1`, `firmante2`, `firmante3`, `fondo` (README §11).

**Listo cuando:** la plantilla compila y las identidades tienen XLM de testnet.

### A1. Esqueleto desplegado ⭐ (desbloquea a B)
- [x] Reemplazar el `hello_world` por la estructura de `pared-viva`: `Estado`, `Config`, `Resumen`, `Ladrillo`, `Clave`, `Error` y **todas** las funciones con sus firmas definitivas (cuerpos en `todo!()`). **Ojo:** el esqueleto no se pudo compilar en Windows por Smart App Control; lo primero es correr `cargo test` y corregir lo que haga falta.
- [ ] Implementación mínima: constructor guarda la config; `donar` guarda el ladrillo (todavía sin transferir tokens ni validar); `estado`, `ladrillo`, `ladrillos` devuelven lo guardado; el resto `panic!` con un error.
- [ ] Desplegar en testnet con alias `pared-viva`.
- [ ] Generar bindings en `frontend/src/contracts/pared-viva/`.
- [ ] Crear `frontend/src/contracts/config.ts`:
  ```ts
  export const RED = {
    rpcUrl: 'https://soroban-testnet.stellar.org',
    passphrase: 'Test SDF Network ; September 2015',
  };
  export const CONTRATOS = {
    paredViva: 'C...',
    usdc: 'C...',
  };
  ```
- [ ] Avisar en el chat: "esqueleto en testnet, ID C...".

**Listo cuando:** `stellar contract invoke --id pared-viva -- estado` responde y los bindings están en `main`.

### A2. Token de prueba y fondeo
- [ ] Desplegar el asset `USDC` de prueba emitido por `admin` y su SAC (README §11).
- [ ] Script `soroban/scripts/fondear.sh <direccion> <monto>`: crea trustline si hace falta (o explica cómo hacerla desde Freighter) y transfiere USDC de prueba.
- [ ] Fondear las wallets de B y C con 1.000 USDC de prueba.

**Listo cuando:** B y C ven saldo USDC en Freighter.

### A3. `donar` completo
- [ ] `donante.require_auth()`.
- [ ] Validar estado `Activa`, fecha límite no vencida, ladrillo válido y libre.
- [ ] Transferir `precio_ladrillo` del donante al contrato con el cliente del token.
- [ ] Sumar a `Recaudado` y `Aporte(donante)`; marcar `Guardian(donante)`.
- [ ] Si `recaudado >= meta` → estado `Financiada`.
- [ ] Emitir evento `donacion`.
- [ ] `extend_ttl` en las entradas persistentes escritas.

### A4. Hitos 2 de 3
- [ ] `aprobar_hito(firmante, hito)`: auth, validar firmante, estado `Financiada`, hito = `HitoActual`, no aprobado antes.
- [ ] Guardar `Aprobacion(hito, firmante)`; emitir `hito_ok`.
- [ ] Al llegar a 2 aprobaciones: transferir el monto del hito al restaurador, avanzar `HitoActual`, emitir `hito_pago`.
- [ ] Tras el último hito → estado `Completada`.

### A5. Reembolso y excedente
- [ ] `estado()` calcula `Fallida` si `ahora > fecha_limite` y `recaudado < meta`.
- [ ] `reembolsar(donante)`: auth, estado `Fallida`, aporte > 0, poner aporte en 0 **antes** de transferir, emitir `reembolso`.
- [ ] `retirar_excedente()`: en `Completada`, enviar el saldo restante al `fondo`.

### A6. Tests (`src/test.rs`)
- [ ] Todos los casos de la sección 6.5 del README.
- [ ] Usar `env.ledger().set_timestamp(...)` para simular fecha límite vencida.
- [ ] Usar `env.register_stellar_asset_contract_v2(...)` para un USDC de test.
- [ ] `cargo test` en verde antes de cada despliegue.

### A7. Despliegue de demo
- [ ] Script `soroban/scripts/desplegar.sh`: build + deploy + bindings + actualizar `config.ts`.
- [ ] Script `soroban/scripts/sembrar-demo.sh`: cuentas extra que donan ~90 % de la meta en ladrillos dispersos, para que en la demo se llegue a la meta en vivo.
- [ ] Desplegar la versión final, regenerar bindings, avisar el nuevo ID.

### A8. Fase 2 — `fondo-barrio`
- [ ] Crear `soroban/contracts/fondo-barrio/` con la misma estructura que `pared-viva` (`Cargo.toml`, `src/lib.rs`, `src/test.rs`).
- [ ] `vender_lamina` con split en puntos básicos (test de redondeo).
- [ ] `aportar`.
- [ ] `proponer`, `votar` (llama `es_guardian` en `pared-viva`), `cerrar_ronda`.
- [ ] Tests, despliegue, bindings en `frontend/src/contracts/fondo-barrio/`, ID en `config.ts`.

### Entregables de A
| # | Entregable | Desbloquea |
|---|---|---|
| A1 | Esqueleto en testnet + bindings + `config.ts` | B3 |
| A2 | USDC de prueba en las wallets del equipo | B5 |
| A3–A5 | Contrato MVP completo | P2 y P3 |
| A7 | Despliegue de demo sembrado | Ensayo de demo |
| A8 | `fondo-barrio` | B8 |

## 7. Integrante B — Integración Stellar y transacciones

**Objetivo:** que la web lea el estado real del contrato, que se pueda donar, aprobar hitos y reembolsar con Freighter, y que las donaciones aparezcan en vivo.

### B0. Entorno
- [ ] Node 22+ y `npm install` en `frontend/`.
- [ ] Freighter en Testnet con XLM (Friendbot) y USDC de prueba (lo manda A).

### B1. Interfaces y mock ⭐ (desbloquea a C) — ✅ incluido en la estructura inicial
- [x] `src/lib/tipos.ts` y `src/lib/eventos.ts` como la sección 4, con helpers `emitir` y `escuchar` tipados.
- [x] `src/lib/datos/mock.ts`: campaña de 20 × 30, 120 ladrillos ocupados con CIDs `mock-*`, `suscribirDonaciones` simula una donación cada 5 s.
- [x] `src/lib/datos/index.ts` elige mock o real según `PUBLIC_USAR_MOCK`.
- [ ] Ajustar el mock si hace falta (B es el dueño).

### B2. Wallet
- [ ] `src/lib/stellar/wallet.ts`: `conectar()`, `direccionActual()`, `firmar(xdr)` con `@stellar/freighter-api`.
- [ ] Verificar que Freighter esté instalada y en Testnet; si no, mensaje claro.
- [ ] Recordar la conexión entre recargas (`localStorage`).
- [ ] `src/components/wallet/ConectarWallet.astro`: botón "Conectar" / dirección abreviada `GABC…XYZ`; emite `pv:wallet-cambiada`.

### B3. Lecturas reales (requiere A1)
- [ ] `src/lib/stellar/cliente.ts`: instancia el cliente de los bindings con `RED` y `CONTRATOS` de `config.ts`.
- [ ] `src/lib/datos/stellar.ts`: implementa `obtenerCampania`, `obtenerLadrillos`, `obtenerLadrillo` convirtiendo los tipos del binding a `tipos.ts`.
- [ ] Cambiar `datos` a `fuenteStellar` (mantener una variable para volver al mock: `PUBLIC_USAR_MOCK=true`).

### B4. Tiempo real
- [ ] `src/lib/stellar/eventos-red.ts`: polling a `rpc.getEvents` cada 4 s filtrando el contrato y el topic `donacion`, guardando el último ledger visto.
- [ ] Implementar `suscribirDonaciones` real con eso.
- [ ] Probar con dos navegadores: donar en uno, ver el ladrillo aparecer en el otro.

### B5. Flujo de donación (requiere A2; usa `subirRecuerdo` de C o un stub)
- [ ] `src/components/donar/DonarModal.astro`, usando `Modal` de C.
- [ ] Se abre al escuchar `pv:ladrillo-seleccionado`.
- [ ] Pasos: (1) ladrillo y precio, (2) recuerdo: texto, imagen opcional, alias, (3) conectar wallet si falta, (4) subir a IPFS con `subirRecuerdo`, (5) simular y firmar `donar`, (6) confirmación con link a stellar.expert.
- [ ] Mientras C no termine IPFS: stub local que devuelve un CID fijo.
- [ ] `src/lib/stellar/errores.ts`: traducir errores a mensajes en español: códigos 1–9 del contrato, sin trustline de USDC, saldo insuficiente, usuario rechazó la firma, red equivocada.
- [ ] Al confirmar, emitir `pv:donacion-confirmada`.

### B6. Panel de firmantes (requiere A4)
- [ ] `src/pages/firmantes.astro`: lista de hitos con monto, estado (pendiente / 1 de 2 / pagado) y quién aprobó.
- [ ] Botón "Aprobar" visible solo si la wallet conectada es firmante y no aprobó.
- [ ] Mostrar el hash de la transacción de pago al restaurador.

### B7. Mi aporte y reembolso (requiere A5)
- [ ] `src/pages/mi-aporte.astro`: total aportado, ladrillos propios, si es guardián.
- [ ] Botón "Recuperar mi aporte" solo en estado `Fallida`.

### B8. Fase 2 — Guardianes (requiere A8)
- [ ] `src/pages/guardianes.astro`: propuestas, votos, botón votar si `es_guardian`.
- [ ] Compra de lámina con split (puede ser un botón en esta misma página).

### B9. Opcional — Passkeys
- [ ] Investigar `passkey-kit` + Launchtube para donar sin Freighter. Solo si B1–B7 están terminados. Si se hace, agregar las etiquetas "Claves de paso" y "Tubo de lanzamiento" en el formulario.

### Entregables de B
| # | Entregable | Desbloquea |
|---|---|---|
| B1 | `tipos.ts`, `eventos.ts`, mock | Todo C |
| B2 | `ConectarWallet` | C3 (lo pone en el header) |
| B3–B4 | Datos reales y en vivo | P1, P2 |
| B5 | `DonarModal` | P2 |
| B6–B7 | Firmantes y reembolso | P3 |

## 8. Integrante C — Experiencia, memoria y presentación

**Objetivo:** que la web se vea y se sienta como el producto (mural que se pinta en vivo), que los recuerdos se guarden en IPFS y se puedan ver, y que el pitch y la demo estén listos.

### C0. Entorno
- [ ] Node 22+ y `npm install` en `frontend/`.
- [ ] Freighter en Testnet.
- [ ] Cuenta en Pinata, crear JWT, guardarlo en `frontend/.env` (**nunca** en git).

### C1. Identidad visual y base
- [ ] Paleta, tipografías, logo simple de "Pared Viva".
- [ ] `src/styles/global.css` con variables CSS (colores, espaciados, radios).
- [ ] `src/layouts/Base.astro`: head, nav (Inicio, Archivo, Firmantes, Mi aporte), slot para `ConectarWallet` de B, footer.
- [ ] `src/components/ui/`: `Boton`, `Modal` (abrir/cerrar por JS, accesible con Escape), `Tarjeta`, `BarraProgreso`, `CuentaRegresiva`.

### C2. Mural ⭐ (con datos mock de B1)
- [ ] `src/components/mural/MuralGrid.astro`: la foto del mural dividida en `filas × columnas`.
- [ ] Ladrillo libre: gris o desaturado. Ladrillo adoptado: a color.
- [ ] Hover: tooltip con alias y fecha si está adoptado, o "Adoptá este ladrillo" si está libre.
- [ ] Click en libre → emitir `pv:ladrillo-seleccionado`. Click en adoptado → ir a `/ladrillo/[id]`.
- [ ] Escuchar `datos.suscribirDonaciones` y `pv:donacion-confirmada`: animar el ladrillo (de gris a color con brillo).
- [ ] Responsive: que funcione en celular (la demo arranca escaneando un QR).

### C3. Home
- [ ] `src/pages/index.astro`: hero con la frase del pitch, `MuralGrid`, `Progreso` (recaudado/meta + cuenta regresiva + estado), "Cómo funciona" en 3 pasos, e incluir `<DonarModal />` de B.
- [ ] `src/components/mural/Progreso.astro`: se actualiza con `pv:donacion-confirmada`.

### C4. IPFS
- [x] Adapter `@astrojs/node` instalado; `/api/subir`, `/archivo` y `/ladrillo/[id]` usan `prerender = false`.
- [ ] `src/pages/api/subir.ts` (hoy devuelve 501): recibe `multipart/form-data`, valida tamaño y tipo, sube imagen y JSON `Recuerdo` a Pinata con `PINATA_JWT`, devuelve `{ cid }`.
- [ ] `src/lib/ipfs/index.ts`: `subirRecuerdo`, `leerRecuerdo`, `urlGateway` (sección 4.5).
- [ ] `.env.example` con `PINATA_JWT=`.
- [ ] Avisar a B cuando esté para reemplazar el stub.

### C5. Memoria
- [ ] `src/pages/ladrillo/[id].astro`: posición en el mural, recuerdo (texto, imagen, alias), fecha, dirección del donante, CID con link al gateway, aclaración de que el contenido está anclado on-chain.
- [ ] `src/pages/archivo.astro`: galería de todos los recuerdos, de más nuevo a más viejo.
- [ ] Estados vacíos y de carga cuidados.

### C6. QR y material físico
- [ ] Agregar `qrcode` a `package.json` (C es dueño de las dependencias).
- [ ] Generar QR al `/` (para el cartel) y QR por ladrillo (para la demo).
- [ ] `docs/cartel.pdf`: cartel imprimible para "la pared" de la demo.

### C7. Pitch y demo
- [ ] `docs/pitch.md`: textos del formulario de inscripción (nombre, descripción corta, etiquetas: Soroban, Stellar SDK, Freighter, Rust, TypeScript).
- [ ] Slides: problema → solución → demo → por qué Stellar → diferencial → equipo.
- [ ] Guion de demo (README §14) con tiempos y quién habla.
- [ ] **Video de respaldo** grabado sobre el despliegue de demo (por si falla internet).
- [ ] Capturas para el repo y el formulario.

### Entregables de C
| # | Entregable | Desbloquea |
|---|---|---|
| C1 | `Layout`, `Modal`, estilos | B5 (usa `Modal`), B6, B7 (usan `Layout`) |
| C2–C3 | Mural y home | P1, P2 |
| C4 | `subirRecuerdo` real | B5 sin stub |
| C5 | Ladrillo y archivo | P3 |
| C6–C7 | QR, pitch, video | Entrega |

## 9. Puntos de integración

Son los momentos en que se juntan las piezas. Cada uno tiene una **prueba concreta** que los 3 verifican juntos. Las fechas se ponen en el kickoff según el deadline de la hackathon.

| Punto | Requiere | Prueba de que está logrado | Fecha |
|---|---|---|---|
| **P0 — Kickoff** | — | Repo creado, interfaces congeladas, mock de B en `main` | |
| **P1 — Esqueleto conectado** | A1, B1–B3, C1–C2 | La home muestra el mural con ladrillos **leídos del contrato en testnet** (guardados con `stellar contract invoke`) | |
| **P2 — Primera donación de punta a punta** ⭐ | A2–A3, B4–B5, C3–C4 | Desde la web: elegir ladrillo → recuerdo → firmar → el ladrillo se pinta en **otro navegador** y `/ladrillo/[id]` muestra el recuerdo desde IPFS | |
| **P3 — MVP completo** | A4–A6, B6–B7, C5 | Se llega a la meta, 2 firmantes liberan un hito desde `/firmantes`; en otra campaña vencida se reembolsa desde `/mi-aporte`. Tests en verde | |
| **P4 — Diferenciales y ensayo** | A7–A8, B8, C6–C7 | Despliegue de demo sembrado, votación de guardianes, primer ensayo completo de la demo cronometrado | |
| **P5 — Congelamiento** | Todo | No se agregan funciones: solo arreglos. Segundo ensayo, video de respaldo grabado, formulario enviado | |

> **Prioridad si falta tiempo:** P3 es lo mínimo que se presenta. P4 suma mucho pero es recortable. Nunca sacrificar P5 (ensayo + video).

## 10. Dependencias y cómo no bloquearse

| Si estás esperando… | Mientras tanto… |
|---|---|
| B esperando el esqueleto de A (A1) | Trabajar contra el mock (B1), hacer wallet (B2) y manejo de errores (B5) |
| B esperando USDC de prueba (A2) | Probar la firma con XLM, o pedir a A que corra `fondear.sh` antes que nada |
| B esperando `subirRecuerdo` de C (C4) | Usar el stub que devuelve un CID fijo |
| B esperando `Modal` y `Layout` de C (C1) | Usar un `<dialog>` HTML plano temporal **dentro de su componente** y reemplazar después |
| C esperando datos reales (B3) | Todo el diseño con el mock: es la misma interfaz |
| C esperando `DonarModal` de B (B5) | En la home, botón que solo emite `pv:ladrillo-seleccionado`; nada se rompe si nadie escucha |
| A esperando a cualquiera | A no depende de nadie: sus pruebas son `cargo test` y `stellar contract invoke` |
| Cambiar una interfaz de la sección 4 | Proponerlo en el chat, esperar el OK de los otros dos, y que el dueño haga el cambio en un PR propio |

## 11. Git y revisión

### Ramas

- `main`: protegida, siempre funciona.
- Ramas por tarea con prefijo del integrante: `a/donar-completo`, `b/wallet`, `c/mural-grid`.
- Un PR por tarea (A3, B5, C2...). PRs chicos se revisan rápido.

### Revisión cruzada

| Autor | Revisa |
|---|---|
| A | B |
| B | C |
| C | A |

La revisión tiene que ser rápida: si en unas pocas horas nadie revisó, el autor avisa en el chat. Se revisa que funcione y que **no toque archivos de otro dueño**.

### `CODEOWNERS` (en `.github/CODEOWNERS`)

GitHub pide automáticamente la revisión del dueño cuando un PR toca sus archivos. Reemplazar los usuarios:

```
# Integrante A — Contratos y red
/soroban/                               @usuario-a
/frontend/src/contracts/                @usuario-a

# Integrante B — Integración Stellar
/frontend/src/lib/tipos.ts              @usuario-b
/frontend/src/lib/eventos.ts            @usuario-b
/frontend/src/lib/datos/                @usuario-b
/frontend/src/lib/stellar/              @usuario-b
/frontend/src/components/wallet/        @usuario-b
/frontend/src/components/donar/         @usuario-b
/frontend/src/pages/firmantes.astro     @usuario-b
/frontend/src/pages/mi-aporte.astro     @usuario-b
/frontend/src/pages/guardianes.astro    @usuario-b

# Integrante C — Experiencia y memoria
/frontend/package.json                  @usuario-c
/frontend/package-lock.json             @usuario-c
/frontend/astro.config.mjs              @usuario-c
/frontend/tsconfig.json                 @usuario-c
/frontend/.env.example                  @usuario-c
/frontend/public/                       @usuario-c
/frontend/src/layouts/                  @usuario-c
/frontend/src/styles/                   @usuario-c
/frontend/src/components/ui/            @usuario-c
/frontend/src/components/mural/         @usuario-c
/frontend/src/lib/ipfs/                 @usuario-c
/frontend/src/pages/index.astro         @usuario-c
/frontend/src/pages/archivo.astro       @usuario-c
/frontend/src/pages/ladrillo/           @usuario-c
/frontend/src/pages/api/                @usuario-c
/docs/                                  @usuario-c
```

### Mensajes de commit

Formato corto: `[A3] donar transfiere USDC y marca guardián`. El código entre corchetes es la tarea de este plan.

### Secretos

- Claves de Stellar: solo en `stellar keys` (A) y en Freighter (cada uno). **Nunca** en el repo.
- `PINATA_JWT`: solo en `frontend/.env`.
- Los IDs de contratos (`C...`) y direcciones públicas (`G...`) **no** son secretos.

## 12. Comunicación

- **Sincronización diaria corta** (presencial o llamada): cada uno dice qué terminó, qué sigue y qué lo bloquea.
- **Canal del equipo** para avisos que destraban a otros: "esqueleto desplegado", "nuevo ID de contrato", "`Modal` en main", "IPFS listo".
- **Tablero de tareas**: un GitHub Project con una tarjeta por tarea de este plan (A0–A8, B0–B9, C0–C7) en columnas *Pendiente / En curso / En revisión / Hecho*.
- **Cada redespliegue del contrato** lo anuncia A con el nuevo ID; B y C hacen `git pull` y reinician `npm run dev`.

## 13. Checklist final de entrega

- [ ] Contrato `pared-viva` desplegado en testnet, ID en el README.
- [ ] `cargo test` en verde.
- [ ] Web desplegada (Vercel, Netlify o similar con adapter correspondiente) o corriendo localmente para la demo.
- [ ] Donación de punta a punta probada en el despliegue de demo.
- [ ] Liberación de hito 2 de 3 probada.
- [ ] Reembolso probado.
- [ ] Recuerdos visibles desde IPFS en `/ladrillo/[id]` y `/archivo`.
- [ ] QR impreso o en pantalla.
- [ ] Video de respaldo grabado.
- [ ] Slides terminadas y demo ensayada al menos dos veces, cronometrada.
- [ ] Formulario de inscripción completo: capítulo Argentina, categoría Impacto social, etiquetas Soroban, SDK Stellar, Freighter, Rust, TypeScript.
- [ ] README actualizado con IDs de contratos, link a la demo y capturas.
