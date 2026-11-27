#!/usr/bin/env bash
# [A7] Compila, despliega pared-viva en testnet y genera los bindings para el frontend.
# Uso (desde soroban/): ./scripts/desplegar.sh
set -euo pipefail

RED=testnet
FRONT=../frontend/src/contracts

stellar contract build

# TODO [A1]: completar --config con las identidades reales (README §11).
stellar contract deploy \
  --wasm target/wasm32v1-none/release/pared_viva.wasm \
  --source-account admin --network "$RED" --alias pared-viva \
  -- \
  --config "{
    \"admin\": \"$(stellar keys address admin)\",
    \"token\": \"$(stellar contract alias show usdc --network $RED)\",
    \"restaurador\": \"$(stellar keys address restaurador)\",
    \"fondo\": \"$(stellar keys address fondo)\",
    \"firmantes\": [\"$(stellar keys address firmante1)\", \"$(stellar keys address firmante2)\", \"$(stellar keys address firmante3)\"],
    \"meta\": \"10000000000\",
    \"fecha_limite\": $(( $(date +%s) + 14 * 24 * 3600 )),
    \"hitos\": [\"4000000000\", \"3000000000\", \"3000000000\"],
    \"filas\": 20,
    \"columnas\": 30,
    \"precio_ladrillo\": \"50000000\"
  }"

stellar contract bindings typescript \
  --network "$RED" --contract-id pared-viva \
  --output-dir "$FRONT/pared-viva" --overwrite

echo "ID de pared-viva: $(stellar contract alias show pared-viva --network $RED)"
echo "Actualizar CONTRATOS.paredViva en $FRONT/config.ts y avisar al equipo."
