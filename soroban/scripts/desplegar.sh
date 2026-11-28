#!/usr/bin/env bash
# [A7] Compila, despliega en testnet, genera bindings y actualiza frontend/src/contracts/config.ts.
# Uso (desde soroban/): ./scripts/desplegar.sh [--pared-viva|--fondo-barrio|--ambos]
# Por defecto despliega pared-viva. Para fondo-barrio se puede usar ARTISTA_IDENTIDAD=nombre y FONDO_BPS=3000.
# Campaña: META_USDC=1000, MINIMO_USDC=1 y DIAS=14 por defecto; los hitos son 40/30/30 % de la meta.
set -euo pipefail

RED=testnet
FRONT=../frontend/src/contracts
CONFIG_TS=$FRONT/config.ts

cd "$(dirname "${BASH_SOURCE[0]}")/.."

uso() {
  echo "Uso: $0 [--pared-viva|--fondo-barrio|--ambos]" >&2
  exit 1
}

alias_id() {
  stellar contract alias show "$1" --network "$RED"
}

actualizar_config() {
  local clave=$1 valor=$2
  sed -i -E "s|(${clave}[[:space:]]*:[[:space:]]*)['\"][^'\"]*['\"]|\1'${valor}'|" "$CONFIG_TS"
  if ! grep -Eq "${clave}[[:space:]]*:[[:space:]]*'${valor}'" "$CONFIG_TS"; then
    echo "No se pudo actualizar CONTRATOS.$clave en $CONFIG_TS" >&2
    exit 1
  fi
}

ajustar_bindings() {
  local index_ts=$1
  INDEX_TS="$index_ts" node <<'NODE'
const fs = require('fs');
const archivo = process.env.INDEX_TS;
let texto = fs.readFileSync(archivo, 'utf8');
const nl = texto.includes('\r\n') ? '\r\n' : '\n';
for (const nombre of ['ClientOptions as ContractClientOptions', 'MethodOptions', 'Result']) {
  const linea = new RegExp(`^[ \\t]*${nombre},\\r?\\n`, 'm');
  if (!linea.test(texto)) {
    throw new Error(`No se encontró el import ${nombre} en ${archivo}`);
  }
  texto = texto.replace(linea, '');
}
const destino = /import type \{\r?\n/;
if (!destino.test(texto)) {
  throw new Error(`No se encontró el bloque import type en ${archivo}`);
}
texto = texto.replace(destino, `import type {${nl}  ClientOptions as ContractClientOptions,${nl}  MethodOptions,${nl}  Result,${nl}`);
fs.writeFileSync(archivo, texto);
NODE
}

generar_bindings() {
  local alias=$1 destino=$2
  stellar contract bindings typescript \
    --network "$RED" --contract-id "$alias" \
    --output-dir "$destino" --overwrite
  ajustar_bindings "$destino/src/index.ts"
}

desplegar_pared() {
  local admin token restaurador fondo firmante1 firmante2 firmante3 fecha_limite config_json id
  local meta=$(( ${META_USDC:-1000} * 10000000 )) minimo=$(( ${MINIMO_USDC:-1} * 10000000 ))
  local hito1=$(( meta * 40 / 100 )) hito2=$(( meta * 30 / 100 ))
  local hito3=$(( meta - hito1 - hito2 ))
  echo "Compilando pared-viva..."
  stellar contract build --package pared-viva

  admin=$(stellar keys address admin)
  token=$(alias_id usdc)
  restaurador=$(stellar keys address restaurador)
  fondo=$(stellar keys address fondo)
  firmante1=$(stellar keys address firmante1)
  firmante2=$(stellar keys address firmante2)
  firmante3=$(stellar keys address firmante3)
  fecha_limite=$(( $(date +%s) + ${DIAS:-14} * 24 * 3600 ))

  config_json=$(printf '{"admin":"%s","token":"%s","restaurador":"%s","fondo":"%s","firmantes":["%s","%s","%s"],"meta":"%s","fecha_limite":%s,"hitos":["%s","%s","%s"],"filas":20,"columnas":30,"aporte_minimo":"%s"}' \
    "$admin" "$token" "$restaurador" "$fondo" "$firmante1" "$firmante2" "$firmante3" "$meta" "$fecha_limite" "$hito1" "$hito2" "$hito3" "$minimo")
  echo "Config: $config_json"

  echo "Desplegando pared-viva en testnet..."
  stellar contract deploy \
    --wasm target/wasm32v1-none/release/pared_viva.wasm \
    --source-account admin --network "$RED" --alias pared-viva \
    -- \
    --config "$config_json"

  echo "Generando bindings de pared-viva..."
  generar_bindings pared-viva "$FRONT/pared-viva"

  id=$(alias_id pared-viva)
  actualizar_config paredViva "$id"
  actualizar_config usdc "$token"
  echo "ID de pared-viva: $id"
  echo "ID de USDC: $token"
}

desplegar_fondo() {
  local admin token campania artista id
  echo "Compilando fondo-barrio..."
  stellar contract build --package fondo-barrio

  admin=$(stellar keys address admin)
  token=$(alias_id usdc)
  campania=$(alias_id pared-viva)
  artista=$(stellar keys address "${ARTISTA_IDENTIDAD:-restaurador}")

  echo "Desplegando fondo-barrio en testnet..."
  stellar contract deploy \
    --wasm target/wasm32v1-none/release/fondo_barrio.wasm \
    --source-account admin --network "$RED" --alias fondo-barrio \
    -- \
    --admin "$admin" \
    --token "$token" \
    --campania "$campania" \
    --artista "$artista" \
    --fondo_bps "${FONDO_BPS:-3000}"

  echo "Generando bindings de fondo-barrio..."
  generar_bindings fondo-barrio "$FRONT/fondo-barrio"

  id=$(alias_id fondo-barrio)
  actualizar_config fondoBarrio "$id"
  actualizar_config usdc "$token"
  echo "ID de fondo-barrio: $id"
}

case "${1:-}" in
  ""|--pared-viva|pared-viva)
    desplegar_pared
    ;;
  --fondo-barrio|fondo-barrio)
    desplegar_fondo
    ;;
  --ambos|ambos)
    desplegar_pared
    desplegar_fondo
    ;;
  *)
    uso
    ;;
esac
