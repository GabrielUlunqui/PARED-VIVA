# Pitch — Pared Viva

## Formulario de inscripción

- **Capítulo:** Argentina
- **Categoría:** Impacto social
- **Etiquetas:** Soroban, SDK Stellar, Freighter, Rust, TypeScript

## Descripción corta

Una colecta en USDC para restaurar un mural de un barrio de Mendoza, donde cada aporte adopta un ladrillo del mural digital y le suma un recuerdo o una foto del donante. Un contrato en Soroban libera los fondos por hitos cuando aprueban 2 de 3 firmantes, y si no se llega a la meta, cada donante recupera su aporte. Después de restaurado, la venta de láminas financia el mantenimiento y los donantes votan qué pared se restaura después.

## Slides

1. **Portada:** "Pared Viva. Cada ladrillo hace arte". Fondo con la calle de noche y los ladrillos armando "La mazamorra" de Fernando Fader.
2. **Problema:** foto del mural deteriorado. "El barrio quiere restaurarlo, pero nadie confía en una colecta."
3. **Solución:** adoptás un ladrillo del mural digital, dejás un recuerdo y donás en USDC. Si no se llega a la meta, recuperás tu aporte.
4. **Demo:** alguien de afuera del equipo dona en vivo desde la laptop y el ladrillo se pinta; con el QR, el público abre el mural en su celular.
5. **Por qué Stellar:** comisiones de centavos, USDC nativo, contratos Soroban con reglas que nadie puede cambiar y firmas 2 de 3.
6. **Diferencial:** recuerdos anclados on-chain, venta de láminas con reparto automático y guardianes que votan la próxima pared.
7. **Modelo de negocio:** resumen de `docs/modelo-de-negocio.md`.
8. **Equipo:** A (contratos y red), B (integración Stellar), C (experiencia, memoria y presentación).

## Guion de la demo (4 min 30 s)

| Tiempo | Bloque | Quién habla | Qué se muestra |
|---|---|---|---|
| 0:00 a 0:30 | El problema | C | Slide del mural deteriorado y la home con los ladrillos armando las obras |
| 0:30 a 1:30 | Donar en vivo | C | Alguien de afuera del equipo elige un ladrillo en la laptop de presentación, deja un recuerdo y firma con Freighter. El ladrillo se pinta en la pantalla grande. En paralelo, el público escanea el QR del cartel (`/cartel`) y ve el mural y el ladrillo en su celular, sin instalar nada |
| 1:30 a 2:15 | Confianza | B | Campaña casi en la meta. En `/firmantes`, el firmante 1 aprueba y no pasa nada; el firmante 2 aprueba y el restaurador cobra el hito. Se abre la transacción en el explorador |
| 2:15 a 2:45 | Memoria | C | `/ladrillo/[id]` del ladrillo recién donado: recuerdo, CID en IPFS y contrato. "Nadie puede alterarlo" |
| 2:45 a 3:30 | El diferencial | A | Slide: venta de láminas con reparto automático y votación de guardianes. El contrato `fondo-barrio` ya está en testnet; la pantalla web es el próximo paso |
| 3:30 a 4:30 | Cierre y preguntas | Todos | "Ellos financian un mural. Nosotros, un barrio." |

Tener listo antes de empezar: cuentas de testnet fondeadas, campaña desplegada casi en la meta, cartel con QR impreso y el video de respaldo abierto en otra pestaña.

## Cartel con QR

La página `/cartel` arma un cartel A4 con el QR a la home del sitio. Para apuntar a otra dirección: `/cartel?url=https://tu-dominio`. Se imprime con el botón "Imprimir" o se guarda como PDF desde el navegador. Cuando el sitio esté desplegado, guardar el PDF como `docs/cartel.pdf`.

## Pendiente

- [ ] Video de respaldo grabado sobre el despliegue de demo
- [ ] Capturas para el repo y el formulario
- [ ] `docs/cartel.pdf` con la dirección final del despliegue
