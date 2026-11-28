# Parches post-demo (rama `a/parches-post-demo`)

Parches de la auditoría 4 (`Temp\pv\auditoria-4-contratos.md`) aplicados sobre los contratos, **sin desplegar**. Cada commit es un hallazgo. Tests: `cargo test` verde en `pared-viva` (44/44) y `fondo-barrio` (14/14).

## Qué cambia por hallazgo

| Commit | Cambio | ¿Rompe interfaz? |
|---|---|---|
| `[A1-fix]` | `reembolsar` escribe `Guardian=false` al devolver el aporte | No (misma firma; cambio de comportamiento) |
| `[M4-fix]` | `donar` rechaza `recuerdo_cid` vacío o >128 chars; errores nuevos `RecuerdoInvalido=21`, `NoEsAprobador=22` | **Aditiva** (errores nuevos: agregar a `errores.ts` del frontend) |
| `[A2-fix]` | `ladrillos_pagina(desde, limite)` con cap 50 + `total_ocupados` | **Aditiva** (2 métodos nuevos; regenerar bindings; `ladrillos()` queda legacy) |
| `[A3-fix]` | constructor exige `aporte_minimo * filas * columnas >= meta` | No cambia firma, **pero el deploy actual (mínimo 1 USDC, meta 1000, grilla 600) no pasaría**: hay que desplegar con mínimo ≥2 USDC |
| `[A4-fix]` | `rotar_firmante(aprobador1, aprobador2, saliente, nuevo)` — los otros dos firmantes rotan a uno caído. Valida duplicados **antes** de `require_auth` (auth duplicado aborta la tx) | **Aditiva** |
| `[M1-fix]` | `upgrade(hash)` con auth del admin | **Aditiva** — decisión de gobernanza pendiente (ver abajo) |
| `[C1-fix]` | `fondo-barrio`: `cerrar_ronda` exige ventana mínima (120 ledgers ~10 min, constante) y quorum (`VOTOS_MINIMOS=2`); emite evento `ronda_fin`; errores `RondaAbierta=8`, `SinQuorum=9` | **Aditiva** (errores/evento nuevos); semántica de cierre cambia |
| `[M3]` | `propuestas_pagina(ronda, desde, limite)` en fondo-barrio | **Aditiva** |

## Plan de migración (cuando se decida aplicar)

1. `cargo test -p pared-viva` y `cargo test -p fondo-barrio` verdes.
2. `stellar contract build` de ambos paquetes (en WSL2 si Smart App Control bloquea).
3. Deploy de contratos **nuevos** (el `pared-viva` actual no tiene `upgrade`, así que es migración, no actualización): nuevo contract id. Deployar `pared-viva` con `aporte_minimo = 2 USDC`.
4. Regenerar bindings TS → `frontend/src/contracts/pared-viva/`.
5. Actualizar `frontend/src/contracts/config.ts` (lo hace `desplegar.sh`) y sumar errores 21/22 a `frontend/src/lib/stellar/errores.ts`.
6. Frontend: pasar la home/`/archivo`/`mi-aporte` a `ladrillos_pagina` en loop (o lectura por id) y dejar de depender de `ladrillos()` completo.
7. `sembrar-demo.sh` de nuevo (18 bricks × 50 USDC supera el mínimo nuevo sin cambios) y verificación del guion completo.
8. La campaña anterior queda congelada como está: no hay migración de estado. Decidir si se la descarta (testnet) o se documenta como "edición 0".

## Decisiones de gobernanza abiertas

1. **`upgrade` con admin single-key** es una llave maestra: alternativa exigir 2 de 3 firmantes (mismo patrón que `rotar_firmante`). Sin upgrade la alternativa es inmutabilidad total — declararlo en el pitch.
2. **El pago de `cerrar_ronda` sigue yendo al guardián proponente.** Quorum+ventana lo hacen visible pero no lo impiden si el admin cierra con cómplices. Opciones: destino restringido a una nueva campaña, desembolso manual/multisig fuera del contrato, o aceptarlo como mecanismo de premio.
3. **`VOTOS_MINIMOS` y `LEDGERS_MINIMOS_RONDA` son constantes** pensadas para demo; en producción pasarlas por constructor (quorum proporcional a guardianes, ventana de días).
4. **Guardian = donante con plata dentro.** Alternativa no implementada: snapshot de guardianes al llegar a `Financiada` (incluye a quienes después no se reembolsan en una Fallida).
5. **Quien no se reembolsa en campaña Fallida sigue guardián** (consecuencia del diseño simple). ¿Es lo deseado?
