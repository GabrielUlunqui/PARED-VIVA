# Instrucciones para agentes

## Git

- Commits, PRs y pushes **sin** "Generated with ..." ni trailers `Co-Authored-By`.

## Verificación

- Frontend (desde `frontend/`): `npm run check` y `npm run build`.
- Contratos (desde `soroban/`): `cargo test` y `stellar contract build`. En esta PC con Windows, Smart App Control bloquea los build scripts de Cargo (os error 4551): compilar en WSL2 o Codespaces.

## Organización

- Propiedad de archivos y tareas por integrante en `PLAN_DE_TRABAJO.md`. Los `TODO [A3]`, `TODO [B5]`, etc. apuntan a esas tareas.
