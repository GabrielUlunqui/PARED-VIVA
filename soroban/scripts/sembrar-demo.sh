#!/usr/bin/env bash
# [A7] Crea cuentas de demo que adoptan ladrillos hasta ~90 % de la meta,
# para que en la demo se alcance la meta en vivo.
# Uso (desde soroban/): ./scripts/sembrar-demo.sh
# Variables opcionales: TOTAL_DEMO=18, MONTO_POR_CUENTA=50 (18 × 50 = 900 USDC).
set -euo pipefail

RED=testnet
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Grilla 20 × 30: ids repartidos en filas y columnas para que el mural se vea disperso.
LADRILLOS_DISPERSOS=(14 73 132 191 250 309 368 427 486 545 34 93 152 211 270 329 388 447)
TOTAL_DEMO=${TOTAL_DEMO:-${#LADRILLOS_DISPERSOS[@]}}
MONTO_POR_CUENTA=${MONTO_POR_CUENTA:-50}
MONTO_UNIDADES=$(( MONTO_POR_CUENTA * 10000000 ))

if (( TOTAL_DEMO < 1 || TOTAL_DEMO > ${#LADRILLOS_DISPERSOS[@]} )); then
  echo "TOTAL_DEMO tiene que estar entre 1 y ${#LADRILLOS_DISPERSOS[@]}" >&2
  exit 1
fi

consultar_ladrillos() {
  stellar contract invoke --id pared-viva --network "$RED" --source-account admin -- ladrillos 2>/tmp/sembrar-demo-error.out
}

if ! LADRILLOS_ACTUALES=$(consultar_ladrillos); then
  echo "No se pudieron leer los ladrillos de pared-viva:" >&2
  cat /tmp/sembrar-demo-error.out >&2
  exit 1
fi

SEMBRADOS=0
SALTADOS=0

for i in $(seq 0 $(( TOTAL_DEMO - 1 ))); do
  numero=$(( i + 1 ))
  nombre="demo$numero"
  cid="mock-demo-$numero"
  ladrillo=${LADRILLOS_DISPERSOS[$i]}

  if grep -q "\"$cid\"" <<<"$LADRILLOS_ACTUALES"; then
    echo "$cid ya está en el mural; se saltea $nombre."
    SALTADOS=$(( SALTADOS + 1 ))
    continue
  fi

  if stellar keys address "$nombre" >/dev/null 2>&1; then
    echo "Reutilizando $nombre."
  else
    echo "Creando y fondeando $nombre con XLM de testnet..."
    stellar keys generate "$nombre" --network testnet --fund >/dev/null
  fi
  direccion=$(stellar keys address "$nombre")

  ./scripts/fondear.sh "$nombre" "$MONTO_POR_CUENTA"

  echo "$nombre adopta el ladrillo $ladrillo con $MONTO_POR_CUENTA USDC ($cid)..."
  stellar contract invoke --id pared-viva --source-account "$nombre" --network "$RED" \
    -- donar --donante "$direccion" --ladrillo_id "$ladrillo" --recuerdo_cid "$cid" --monto "$MONTO_UNIDADES"

  SEMBRADOS=$(( SEMBRADOS + 1 ))
done

if (( SEMBRADOS == 0 && SALTADOS > 0 )); then
  echo "La demo ya estaba sembrada; no se repitió ninguna donación."
else
  echo "Demo sembrada: $SEMBRADOS donaciones nuevas, $SALTADOS ya existentes."
fi
