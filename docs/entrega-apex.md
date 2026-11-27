# Borrador de entrega en Apex — Pared Viva

Documento de trabajo para cargar el proyecto en Apex. Los corchetes `[COMPLETAR]` marcan datos que no deben inventarse.

## Campos del proyecto

- **Nombre:** Pared Viva
- **Tagline / descripción corta (máx. 160 caracteres):**
  > Memoria viva y crowdfunding transparente para restaurar murales barriales con USDC en Stellar.
- **Track:** Open Innovation `[CONFIRMAR EN EL FORMULARIO]`
- **Capítulo:** Argentina
- **Categoría:** Impacto social / Social impact `[CONFIRMAR NOMBRE EXACTO EN EL FORMULARIO]`
- **Etapa:** Testnet
- **Etiquetas / stack:** Soroban, Stellar SDK, Freighter, Rust, TypeScript
- **Open source:** sí
- **GitHub:** https://github.com/GabrielUlunqui/PARED-VIVA
- **Website:** `[COMPLETAR: URL pública de la app, si existe; no usar localhost]`
- **Demo/video:** `[COMPLETAR: URL pública o no listada del video de respaldo, o URL de demo si el formulario la pide]`
- **Logo/capturas:** `[COMPLETAR: subir capturas reales de home, mural, ladrillo/IPFS, firmantes y explorador]`

## Descripción larga propuesta

> Pared Viva convierte la restauración de un mural barrial en una campaña transparente y verificable. Cada vecino adopta un ladrillo digital del mural, deja un recuerdo asociado y aporta USDC de prueba en Stellar Testnet. El mural virtual se pinta en tiempo real y los recuerdos quedan vinculados al ladrillo para construir un archivo comunitario.
>
> El problema que atacamos es la desconfianza en las colectas barriales: la plata suele moverse por transferencias informales y nadie puede verificar si llegó al restaurador ni en qué etapa se gastó. Pared Viva usa un contrato Soroban como escrow público. Los fondos se liberan por hitos 40/30/30 solo cuando 2 de 3 firmantes los aprueban. Si la campaña vence sin llegar a la meta, cada donante puede recuperar su aporte. Si se supera la meta, el excedente va a un fondo de mantenimiento. En la fase 2, la venta de láminas reparte fondos entre artista y mantenimiento, y los donantes actúan como guardianes que proponen y votan próximas paredes.
>
> En la demo se puede ver una campaña real desplegada en Stellar Testnet: una grilla de 600 ladrillos, donaciones visibles on-chain, lectura del estado del contrato desde el frontend, eventos para actualizar el mural, panel de firmantes y páginas de memoria por ladrillo. Los contratos están escritos en Rust y tienen tests; el frontend usa Astro, TypeScript, Stellar SDK y Freighter/Varial.
>
> Uso de Stellar con sentido: USDC mediante Stellar Asset Contract para aportes estables; Soroban para escrow, hitos, reembolsos, guardianes y votación; eventos para actualización en vivo; bajas comisiones para microdonaciones. No usamos blockchain como adorno: las reglas críticas de confianza se ejecutan en el contrato.
>
> Validación externa: `[COMPLETAR con la evidencia real de la plantilla de abajo: quién probó, qué hizo, qué entendió, qué falló, qué cambió el equipo y link de transacción/captura/video si existe]`.
>
> Estado actual y límites: prototipo en Testnet, sin dinero real ni inversión. La campaña de demostración quedó sembrada en 999/1.000 USDC para poder alcanzar la meta en vivo y mostrar la aprobación 2 de 3; verificar el estado antes de enviar porque puede cambiar. La votación/compra de láminas existe como contrato `fondo-barrio` desplegado, pero la interfaz web de guardianes sigue en desarrollo. Antes de mainnet se requiere auditoría, revisión legal/contable, permisos de autor/propietario/municipio y una operación de rampas en pesos.

## Uso de Stellar — respuesta corta

> Pared Viva usa Stellar como capa de confianza, no como adorno. Los aportes se hacen en USDC de prueba mediante un Stellar Asset Contract. Un contrato Soroban custodia los fondos, registra cada ladrillo/recuerdo, calcula el estado de la campaña, habilita reembolsos si no se llega a la meta y libera hitos al restaurador solo con aprobaciones 2 de 3. Los eventos del contrato actualizan el mural en vivo. Un segundo contrato, `fondo-barrio`, implementa el split de láminas y la votación de guardianes para la siguiente etapa.

## Links verificables

- Repositorio: https://github.com/GabrielUlunqui/PARED-VIVA
- Contrato `pared-viva`: https://stellar.expert/explorer/testnet/contract/CD3ZVQAQKTT3F3OW6DL6LQA4CDD4IEWGHRG4ZZDZJZTXQRJ5DIZXC6RE
- USDC de prueba (SAC): https://stellar.expert/explorer/testnet/contract/CAKOGDRIVNTTJMVT5YEI5R5EY5FOBGPJSO4QOEFNHIZZBHYH7XQNSKDP
- Contrato `fondo-barrio`: https://stellar.expert/explorer/testnet/contract/CB36KQWDL6BD6TJVVOMRVKSHVM5QK7VTOLLU6ZG3EH3ZK43LID42NNIA
- Transacción de validación externa: `[COMPLETAR]`
- Video de respaldo: `[COMPLETAR]`
- URL pública de la app: `[COMPLETAR]`

## Plantilla para documentar validación externa

Completar una tabla por persona externa. No inventar datos ni usar a un integrante del equipo.

| Campo | Respuesta |
|---|---|
| Nombre o iniciales (con consentimiento) | `[COMPLETAR]` |
| Relación con el equipo | `[COMPLETAR: ninguna / conocido / jurado / vecino / otro]` |
| Fecha y lugar | `[COMPLETAR]` |
| Dispositivo y wallet | `[COMPLETAR: laptop/celular, Freighter/Varial, Testnet]` |
| Qué se le pidió hacer | `[COMPLETAR: mirar home, elegir ladrillo, escribir recuerdo, donar, revisar hito]` |
| Qué hizo realmente | `[COMPLETAR]` |
| ¿Entendió qué estaba pasando? | `[COMPLETAR]` |
| ¿Dónde se trabó o qué no entendió? | `[COMPLETAR]` |
| Comentario textual útil | `[COMPLETAR]` |
| ¿Qué cambió el equipo después de la prueba? | `[COMPLETAR]` |
| Transacción testnet, si firmó | `[COMPLETAR: link de Stellar Expert]` |
| Captura/video, sin datos sensibles | `[COMPLETAR: link]` |
| Consentimiento para citarla | `[COMPLETAR: sí/no]` |

### Texto breve si solo hay una validación

> Validamos el flujo con `[NOMBRE/INICIALES]`, una persona externa al equipo, el `[FECHA]`. Le pedimos que recorriera el mural, eligiera un ladrillo y explicara con sus palabras qué pasaba con su aporte. `[RESUMEN DE LO QUE ENTENDIÓ Y DÓNDE SE TRABÓ]`. Como resultado, cambiamos `[CAMBIO REAL]`. Evidencia: `[LINK DE TX/CAPTURA/VIDEO]`.

## Checklist antes de enviar Apex

- [ ] URL pública o decisión explícita de dejar `websiteUrl` vacío.
- [ ] Video de respaldo subido y probado en navegación privada.
- [ ] Capturas reales agregadas al formulario.
- [ ] Validación externa documentada con evidencia.
- [ ] README y repo público revisados como los vería un jurado.
- [ ] Links de contratos abiertos y correctos.
- [ ] No se afirma que la interfaz de guardianes está terminada.
- [ ] No se afirma que los recuerdos actuales de ejemplo son archivos IPFS reales si usan CIDs `mock-*`.
- [ ] Estado de campaña verificado la mañana de la demo; estaba sembrada en 999/1.000 USDC para la presentación.
