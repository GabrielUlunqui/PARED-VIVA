# Reglas de la campaña

> Borrador de trabajo para la hackathon, no documento final. Completar los [CORCHETES] y revisar con abogado y contador antes de operar con dinero real. Contexto y fuentes en [docs/legal.md](../legal.md).

**Reglas de la campaña [NOMBRE DE LA CAMPAÑA / MURAL]**

1. **Objetivo.** Reunir aportes para restaurar el mural [DESCRIPCIÓN/UBICACIÓN] mediante el restaurador [NOMBRE], con autorización de [AUTOR] y [PROPIETARIO/MUNICIPIO si corresponde].
2. **Meta y aporte mínimo.** La meta es **1.000 USDC**. El aporte mínimo por ladrillo es **1 USDC**. En la demo testnet estos montos no tienen valor real.
3. **Ladrillos y recuerdos.** El mural digital se divide en [FILAS × COLUMNAS] ladrillos. Cada aporte adopta un ladrillo disponible y puede asociar un recuerdo. La adopción no otorga propiedad sobre el mural físico ni sobre la obra.
4. **Escrow.** Los aportes quedan registrados en el contrato de campaña hasta que se cumplan las reglas. No hay retiros manuales discrecionales por el equipo.
5. **Hitos.** Los fondos de la meta se liberan al restaurador en tres hitos: **hito 0: 400 USDC (40%)**, **hito 1: 300 USDC (30%)**, **hito 2: 300 USDC (30%)**. Cada hito requiere aprobación de **2 de 3 firmantes**: [NOMBRES/ROLES].
6. **Evidencia.** Cada hito se aprueba contra la evidencia publicada en [LINK/CRITERIO]: inicio, avance intermedio y finalización. La aprobación queda registrada on-chain.
7. **Si no se llega a la meta.** Si al vencer la fecha límite [FECHA/HORA] la campaña no alcanza la meta, cada donante puede reclamar el reembolso del monto registrado a su favor. El reembolso se ejecuta a la misma dirección que aportó. [ACLARAR GAS/COMISIONES SI CORRESPONDE].
8. **Si se supera la meta.** Los aportes que excedan 1.000 USDC quedan en el fondo de mantenimiento del mural. Cuando los tres hitos estén completos, el excedente podrá transferirse al fondo [DIRECCIÓN/DESCRIPCIÓN]. En la configuración actual, un excedente de 50 USDC sobre una recaudación de 1.050 USDC se destinaría íntegramente a ese fondo.
9. **Si el restaurador no cumple.** El contrato inteligente no puede recuperar automáticamente fondos ya transferidos. Si el restaurador incumple un hito, los firmantes pueden no aprobar hitos futuros y la entidad responsable podrá exigir regularización, reembolso por vía contractual o reemplazo según el acuerdo firmado con el restaurador. Los donantes serán informados en [CANAL].
10. **Si un firmante desaparece.** El esquema es 2 de 3: la campaña puede continuar con dos firmantes activos. En la versión actual no existe reemplazo automático de firmantes; si dos claves desaparecen, los hitos futuros no podrán aprobarse y los fondos no liberados podrían quedar inmovilizados en el contrato. Esta limitación se informa antes de donar.
11. **Votación de guardianes.** Cada donante registrado es guardián simbólico e intransferible. La votación para elegir próximas paredes es consultiva y no obliga al municipio, propietario, autor o restaurador.
12. **Modificación de reglas.** Estas reglas no se modificarán retroactivamente durante la campaña salvo corrección de errores o exigencia legal. Toda aclaración se publicará en [CANAL].
13. **Contacto y reclamos.** [EMAIL/CANAL].
