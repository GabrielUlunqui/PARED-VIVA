#!/usr/bin/env bash
# [A2] Envía USDC de prueba a una identidad local o a una wallet del equipo.
# Uso (desde soroban/): ./scripts/fondear.sh <identidad|direccion G...> <monto en USDC>
set -euo pipefail

RED=testnet
DESTINO=${1:-}
MONTO_USDC=${2:-}

uso() {
  echo "Uso: $0 <identidad|direccion G...> <monto en USDC>" >&2
  exit 1
}

unidades_desde_usdc() {
  local monto=$1 entero fraccion
  [[ $monto =~ ^[0-9]+(\.[0-9]{1,7})?$ ]] || return 1
  entero=${monto%%.*}
  if [[ $monto == *.* ]]; then
    fraccion=${monto#*.}
  else
    fraccion=""
  fi
  fraccion="${fraccion}0000000"
  fraccion=${fraccion:0:7}
  echo $((10#$entero * 10000000 + 10#$fraccion))
}

[[ -n $DESTINO && -n $MONTO_USDC ]] || uso
if ! MONTO=$(unidades_desde_usdc "$MONTO_USDC") || (( MONTO <= 0 )); then
  echo "Monto inválido: $MONTO_USDC (usá un número positivo con hasta 7 decimales)" >&2
  exit 1
fi

ADMIN=$(stellar keys address admin)
ES_IDENTIDAD=0
if DESTINO_ID=$(stellar keys address "$DESTINO" 2>/dev/null); then
  ES_IDENTIDAD=1
else
  DESTINO_ID=$DESTINO
fi

if [[ ! $DESTINO_ID =~ ^G[A-Z2-7]{55}$ ]]; then
  echo "Destino inválido: no es una identidad local ni una dirección G... válida" >&2
  exit 1
fi

if (( ES_IDENTIDAD )); then
  echo "Creando o actualizando la trustline USDC de $DESTINO..."
  if ! stellar tx new change-trust --line "USDC:$ADMIN" --source-account "$DESTINO" --network "$RED" >/tmp/fondear-trustline.out 2>&1; then
    echo "No se pudo crear la trustline de $DESTINO:" >&2
    cat /tmp/fondear-trustline.out >&2
    exit 1
  fi
fi

echo "Minteando $MONTO_USDC USDC de prueba para $DESTINO_ID..."
set +e
SALIDA=$(stellar contract invoke --id usdc --source-account admin --network "$RED" \
  -- mint --to "$DESTINO_ID" --amount "$MONTO" 2>&1)
ESTADO=$?
set -e

if (( ESTADO != 0 )); then
  echo "$SALIDA" >&2
  if (( ES_IDENTIDAD == 0 )); then
    cat >&2 <<EOF

No se pudo mintear en la dirección externa $DESTINO_ID.
Si el error es por falta de trustline (por ejemplo op_no_trust), agregala desde Freighter:
  1. Abrí Freighter en Testnet → Manage assets → Add asset.
  2. Asset code: USDC
  3. Issuer: $ADMIN
  4. Volvé a correr: ./scripts/fondear.sh $DESTINO $MONTO_USDC
EOF
  fi
  exit "$ESTADO"
fi

echo "Enviados $MONTO_USDC USDC de prueba a $DESTINO_ID"
