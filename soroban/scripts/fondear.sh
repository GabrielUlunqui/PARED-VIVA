#!/usr/bin/env bash
# [A2] Envía USDC de prueba a una wallet del equipo.
# Uso (desde soroban/): ./scripts/fondear.sh <direccion G...> <monto en USDC>
# La wallet tiene que tener la trustline a USDC:<emisor admin> (se agrega desde Freighter → Manage assets).
set -euo pipefail

DESTINO=${1:?Falta la dirección G...}
MONTO_USDC=${2:-1000}
RED=testnet

stellar contract invoke --id usdc --source-account admin --network "$RED" \
  -- mint --to "$DESTINO" --amount "$(( MONTO_USDC * 10000000 ))"

echo "Enviados $MONTO_USDC USDC de prueba a $DESTINO"
