# Runbook de la demo — Pared Viva

Este runbook es para la mañana de la presentación. La campaña oficial está en **Stellar Testnet**; no uses fondos reales ni hagas transacciones de prueba sobre la campaña oficial salvo que sean parte del plan.

> **Estado preparado por el equipo:** la campaña quedó sembrada en **999/1.000 USDC** con 25 ladrillos ocupados. Cualquier donación en vivo de **1 USDC o más** alcanza la meta y la deja `Financiada` para mostrar la aprobación 2 de 3 del hito 0 (400 USDC al restaurador). Verificarlo igual la mañana de la demo porque el estado puede cambiar.

## Campaña de ensayo

Para probar Freighter, IPFS (`PINATA_JWT`) y la aprobación de hitos **sin tocar la campaña oficial**, hay una segunda instancia del mismo contrato con meta de 10 USDC (hitos 4/3/3 USDC, aporte mínimo 1 USDC):

- ID: [`CCSMURJVJBEVNCULQTYHGQP7JTNWA5SZGYHQGI5WPBUV6TEQS7K2ZTTP`](https://stellar.expert/explorer/testnet/contract/CCSMURJVJBEVNCULQTYHGQP7JTNWA5SZGYHQGI5WPBUV6TEQS7K2ZTTP) (alias local `pared-viva-ensayo`).
- En `frontend/.env`: `PUBLIC_CAMPANIA=ensayo` y reiniciar el dev server. La franja de testnet muestra "Campaña de ensayo".
- Donando 10 USDC o más queda `Financiada` y se puede ensayar `/firmantes` (o por CLI: `stellar contract invoke --id pared-viva-ensayo --network testnet --source-account firmante1 -- aprobar_hito --firmante firmante1 --hito 0`).
- **Antes de presentar, volver a `PUBLIC_CAMPANIA=oficial`** (o borrar la línea) y reiniciar el server.

## Regla de oro

Después de dejar la campaña cerca de la meta, **no hacer donaciones de prueba en la campaña oficial**. Una sola donación pequeña puede completar la meta antes de tiempo y la demo pierde el momento “se alcanza la meta en vivo”. Para probar wallets/IPFS usar otra campaña o hacerlo antes de sembrar el estado final.

---

## Escenario normal: la mañana de la demo

### 1. Congelar código e IDs

```sh
git status --short
```

- El código de la laptop de presentación debe ser el de `main`/la rama acordada.
- No redesplegar contratos salvo emergencia.
- Confirmar que los IDs de `frontend/src/contracts/config.ts` son los del despliegue oficial.

### 2. Leer el estado real sin transaccionar

Desde `soroban/`:

```sh
stellar contract invoke --id pared-viva --network testnet --send no --source-account admin -- estado
```

Confirmar:

- `estado: Activa` antes de empezar;
- meta 1.000 USDC (`10000000000` unidades);
- recaudado muy cerca de la meta;
- `hito_actual: 0`;
- grilla 20 × 30 y aporte mínimo 1 USDC.

También se puede abrir el contrato en Stellar Expert:

- [`pared-viva`](https://stellar.expert/explorer/testnet/contract/CD3ZVQAQKTT3F3OW6DL6LQA4CDD4IEWGHRG4ZZDZJZTXQRJ5DIZXC6RE)

### 3. Confirmar el monto de la donación en vivo

Con la siembra actual, cualquier monto desde el mínimo de 1 USDC completa la meta. Aun así, decidir antes de subir quién dona y qué monto exacto va a ingresar. No improvisar otro número en el escenario.

### 4. Verificar la laptop y las wallets

- Freighter/Varial instalada y en **Testnet**.
- Cuenta donante con XLM para fees, trustline USDC y saldo suficiente.
- `frontend/.env` existe y tiene:
  ```env
  PUBLIC_USAR_MOCK=false
  PINATA_JWT=<jwt real de Pinata>
  ```
- Probar que `/api/subir` no responde 503 por falta de `PINATA_JWT`.
- Firmantes disponibles. Si no están en Freighter, se puede aprobar por CLI con las identidades locales:

```sh
stellar contract invoke --id pared-viva --network testnet --source-account firmante1 \
  -- aprobar_hito --firmante firmante1 --hito 0

stellar contract invoke --id pared-viva --network testnet --source-account firmante2 \
  -- aprobar_hito --firmante firmante2 --hito 0
```

La primera aprobación no paga; la segunda libera el hito 0 al restaurador.

### 5. Levantar la app y preparar el QR

Sin deploy público, usar la red local:

```sh
cd frontend
npm ci
npm run dev -- --host 0.0.0.0
```

- Anotar la IP LAN de la laptop.
- Abrir `/cartel?url=http://IP-LAN:4321` y probar el QR con un teléfono real conectado a la misma red.
- Si hay deploy público, usar esa URL en vez de la IP LAN.
- Dejar claro que el celular es **modo lectura**: la donación en vivo se firma desde la laptop.

### 6. Abrir las ventanas de la demo

Antes de presentar, dejar pestañas listas con:

1. home `/` con el mural;
2. `/firmantes`;
3. un `/ladrillo/<id>` ocupado;
4. Stellar Expert del contrato;
5. video de respaldo descargado/abierto;
6. segunda ventana o navegador para ver el mural actualizarse.

### 7. Ensayo cronometrado

Hacer dos ensayos del guion sin transaccionar en la campaña oficial:

- explicar problema;
- mostrar QR/modo lectura;
- simular dónde se elegirá el ladrillo;
- mostrar `/firmantes` y explicar qué pasará con 1/2 y 2/3;
- abrir video de respaldo y verificar sonido/pantalla completa.

---

## Recuperación si testnet se resetea o hay que redesplegar

> Solo para emergencia. Este procedimiento no está automatizado completo: conviene cronometrarlo una vez si se quiere depender de él.

Desde `soroban/`:

```sh
# 1) Recuperar/fondear cuentas locales existentes.
for n in admin restaurador firmante1 firmante2 firmante3 fondo vecino; do
  if stellar keys address "$n" >/dev/null 2>&1; then
    stellar keys fund "$n" --network testnet
  else
    stellar keys generate "$n" --network testnet --fund
  fi
done

# 2) Recrear el USDC de prueba emitido por admin y su contrato SAC.
stellar contract asset deploy \
  --asset "USDC:$(stellar keys address admin)" \
  --source-account admin --network testnet --alias usdc

# 3) Asegurar trustlines/saldos de cuentas operativas.
./scripts/fondear.sh restaurador 1
./scripts/fondear.sh fondo 1
./scripts/fondear.sh vecino 100

# 4) Compilar, desplegar ambos contratos, regenerar bindings y actualizar config.ts.
./scripts/desplegar.sh --ambos

# 5) Sembrar 900 USDC con 18 recuerdos de ejemplo.
./scripts/sembrar-demo.sh

# 6) Sumar 99 USDC para dejar 999/1.000 en un redeploy fresco:
#    3 × 1 USDC en los ladrillos 597-599 y 4 × 24 USDC en 113, 232, 351 y 470.
#    Esos ladrillos no están en la lista dispersa del script.
VECINO=$(stellar keys address vecino)
for ladrillo in 597 598 599; do
  stellar contract invoke --id pared-viva --source-account vecino --network testnet \
    -- donar --donante "$VECINO" --ladrillo_id "$ladrillo" \
    --recuerdo_cid "mock-prueba-$ladrillo" --monto 10000000
done
N=19
for ladrillo in 113 232 351 470; do
  stellar contract invoke --id pared-viva --source-account vecino --network testnet \
    -- donar --donante "$VECINO" --ladrillo_id "$ladrillo" \
    --recuerdo_cid "mock-demo-$N" --monto 240000000
  N=$((N + 1))
done

# 7) Verificar sin transaccionar.
stellar contract invoke --id pared-viva --network testnet --send no --source-account admin -- estado
stellar contract invoke --id pared-viva --network testnet --send no --source-account admin -- ladrillos
```

Después:

- revisar el diff de `frontend/src/contracts/config.ts` y de los bindings generados;
- actualizar los IDs del README si cambiaron;
- correr `npm run check` y `npm run build` en `frontend/`;
- volver al escenario normal.

---

## Checklist de 10 minutos antes de presentar

- [ ] `git status` revisado y no se toca más código.
- [ ] `estado()` leído en solo lectura: campaña `Activa`, cerca de la meta, `hito_actual=0`.
- [ ] Server levantado en la laptop y home cargando datos reales (`PUBLIC_USAR_MOCK=false`).
- [ ] `PINATA_JWT` configurado; la subida de recuerdos no está en error 503.
- [ ] Freighter/Varial en Testnet; donante con XLM, trustline y USDC suficiente.
- [ ] Monto de la donación en vivo decidido; nadie hace donaciones de prueba en la campaña oficial.
- [ ] Firmante 1 y firmante 2 listos en `/firmantes` o por CLI con los comandos de arriba.
- [ ] QR probado desde un teléfono real; copy explicado como modo lectura.
- [ ] Video de respaldo abierto/descargado y una captura del explorador disponible.
- [ ] Plan C listo: si falla testnet o Pinata, cambiar `.env` a `PUBLIC_USAR_MOCK=true`, reiniciar el server y presentar el mock como simulación de UX, sin afirmar que es blockchain real.
