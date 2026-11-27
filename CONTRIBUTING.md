# Contribuir a Pared Viva

## Flujo de trabajo

1. `main` debe quedar siempre funcionando.
2. Cada tarea usa una rama con prefijo del integrante: `a/...`, `b/...`, `c/...`.
3. Un PR chico por tarea del plan (`A3`, `B5`, `C2`, etc.).
4. Revisión cruzada: A revisa B, B revisa C, C revisa A.
5. No tocar archivos de otro dueño salvo acuerdo explícito. El mapa está en `PLAN_DE_TRABAJO.md` §3 y el esquema de CODEOWNERS en §11.
6. Mensajes de commit: `[A3] descripción corta`.
7. Commits, PRs y pushes **sin** trailers "Generated with ..." ni `Co-Authored-By`.

## Verificación antes de PR

Contratos, desde `soroban/`:

```sh
cargo test
stellar contract build
```

Frontend, desde `frontend/`:

```sh
npm run check
npm run build
```

## Reglas del proyecto

- La interfaz pública del contrato se acuerda antes de cambiar integraciones.
- Ningún cambio del contrato se despliega sin tests en verde.
- No commitear secretos: claves Stellar, seed phrases ni `PINATA_JWT`.
- Los IDs de contratos (`C...`) y direcciones públicas (`G...`) no son secretos.
- Si se redespliega un contrato, avisar al equipo, actualizar `frontend/src/contracts/config.ts` y regenerar bindings.
