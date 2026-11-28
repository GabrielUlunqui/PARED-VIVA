#!/usr/bin/env bash
# Siembra una campaña con los recuerdos reales de IPFS de scripts/siembra/siembra.tsv
# (ladrillo, monto en USDC, CID): una cuenta de testnet distinta por recuerdo.
# Uso (desde soroban/): ./scripts/sembrar-campania.sh
# Variables opcionales: CAMPANIA=pared-viva (alias del contrato), SIEMBRA=scripts/siembra/siembra.tsv.
# Si un CID ya está en la campaña, se saltea (se puede volver a correr si se corta).
set -euo pipefail

RED=testnet
cd "$(dirname "${BASH_SOURCE[0]}")/.."

CAMPANIA=${CAMPANIA:-pared-viva}
SIEMBRA=${SIEMBRA:-scripts/siembra/siembra.tsv}

[[ -f $SIEMBRA ]] || { echo "No existe $SIEMBRA: corré antes node scripts/siembra/subir-recuerdos.mjs" >&2; exit 1; }

if ! ACTUALES=$(stellar contract invoke --id "$CAMPANIA" --network "$RED" --source-account admin -- ladrillos 2>/tmp/sembrar-campania.err); then
  echo "No se pudieron leer los ladrillos de $CAMPANIA:" >&2
  cat /tmp/sembrar-campania.err >&2
  exit 1
fi

SEMBRADOS=0
SALTADOS=0
n=0
while IFS=$'\t' read -r -u 3 ladrillo monto cid; do
  cid=${cid%$'\r'}
  [[ -n ${ladrillo:-} ]] || continue
  n=$(( n + 1 ))
  nombre="siembra$n"

  if grep -q "\"$cid\"" <<<"$ACTUALES"; then
    echo "#$ladrillo ya tiene su recuerdo ($cid); se saltea."
    SALTADOS=$(( SALTADOS + 1 ))
    continue
  fi

  if ! stellar keys address "$nombre" >/dev/null 2>&1; then
    echo "Creando y fondeando $nombre con XLM de testnet..."
    stellar keys generate "$nombre" --network "$RED" --fund >/dev/null
  fi
  direccion=$(stellar keys address "$nombre")

  ./scripts/fondear.sh "$nombre" "$monto"

  echo "$nombre adopta el ladrillo $ladrillo con $monto USDC ($cid)..."
  stellar contract invoke --id "$CAMPANIA" --source-account "$nombre" --network "$RED" \
    -- donar --donante "$direccion" --ladrillo_id "$ladrillo" --recuerdo_cid "$cid" --monto "$(( monto * 10000000 ))"

  SEMBRADOS=$(( SEMBRADOS + 1 ))
done 3<"$SIEMBRA"

echo "Siembra terminada en $CAMPANIA: $SEMBRADOS donaciones nuevas, $SALTADOS ya existentes."
stellar contract invoke --id "$CAMPANIA" --network "$RED" --source-account admin -- estado
