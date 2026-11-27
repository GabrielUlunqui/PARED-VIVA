# Marco legal — Pared Viva (Argentina / Mendoza)

> **Aclaración inicial.** Este informe fue preparado por el equipo de Pared Viva como mapa de riesgos para una hackathon. **No somos abogados, contadores ni escribanos; esto no es asesoramiento legal, fiscal ni regulatorio y no reemplaza la consulta con profesionales matriculados.** Antes de operar con dinero real, vender láminas o intervenir una pared hay que revisar el caso concreto con un abogado de Mendoza y un contador. Fecha de corte de la investigación: **27 de noviembre de 2026**.

---

## Resumen ejecutivo — lectura de 2 minutos

### Para la hackathon de mañana (BAF × Stellar | FLAT 2026, testnet)

1. **Lo mínimo indispensable es documental, no societario:** como la demo corre en **Stellar testnet, con tokens sin valor real**, no hace falta constituir una asociación ni registrarse como PSAV solo para mostrar el prototipo. Sí hace falta que la web diga visiblemente: **"demo en testnet, sin dinero real, sin inversión ni rendimiento"**.
2. **No usar un mural real sin autorización.** Para la demo hay que obtener aunque sea un consentimiento escrito simple del autor para digitalizar la imagen, dividirla en grilla y mostrarla. La Ciudad de Mendoza ya trabaja con un registro de murales y contempla restauraciones **"acordadas previamente con los autores"**: esa es exactamente la validación que tenemos que imitar.
3. **Recuerdos/IPFS son el mayor riesgo inmediato.** Todo lo subido a IPFS y todo hash/CID vinculado on-chain puede quedar público y replicado para siempre. La interfaz debe advertirlo **antes** de donar, exigir consentimiento, prohibir datos sensibles y fotos de menores, y nunca guardar texto/foto directamente on-chain: solo el CID.
4. **No prometer rentabilidad ni vender el token de guardián.** "Guardián" debe presentarse como reconocimiento simbólico e intransferible y la votación como consulta comunitaria no vinculante. Evitar "invertí", "rendimiento", "retorno", "ganancia", "valor del token" o "gobernanza que decide".
5. **El reembolso hay que explicarlo con precisión.** En la demo: meta 1.000 USDC, aporte mínimo 1 USDC; si vence la fecha sin llegar a la meta, cada donante puede reclamar exactamente lo aportado. En dinero real, esa promesa crea una obligación contractual seria y debe estar en las reglas de campaña.
6. **Permiso de la pared.** Aunque sea una demo, conviene elegir una pared con autorización escrita del propietario. En Ciudad de Mendoza, los murales artísticos quedan excluidos de la prohibición general de grafitis si se hacen **con autorización del propietario (y municipal si la pared es pública) más previa comunicación a la autoridad municipal**.
7. **Preparar estos textos antes de mostrar la web:** aviso testnet/sin valor real, checkbox de consentimiento para recuerdos, reglas de campaña, licencia del artista y acuerdo básico con el restaurador. Están en borrador en [docs/legal/](legal/).
8. **Para operar de verdad, lo prudente es empezar con una ONG aliada.** Constituir una asociación civil propia en Mendoza insume instrumento público, al menos 7 asociados, estatuto, libros, CUIT, contabilidad y presentaciones ante la Dirección de Personas Jurídicas (DPJ); una fundación tiene tasa publicada de $200.000 y los tiempos oficiales no están verificados. Una ONG ya exenta reduce fricción inicial, pero hay que firmar convenio de fiscal sponsorship y control.
9. **Crowdfunding de donación no es crowdfunding financiero CNV.** La Ley 27.349 regula el Sistema de Financiamiento Colectivo para inversión a través del mercado de capitales y su art. 28 **excluye expresamente** los proyectos de recaudación con fines benéficos, las donaciones y la venta directa de bienes/servicios. Eso no significa "zona sin ley": siguen aplicándose Código Civil, protección de datos, consumidor, copyright, lavado, tributos y permisos.
10. **El punto regulatorio más incierto para producción es PSAV/UIF.** La CNV excluye protocolos descentralizados sin proveedor identificable y billeteras de autocustodia, pero Pared Viva tendría equipo, frontend, configuración de campaña y firmantes identificables. No custodiamos claves ni cambiamos fiat/cripto, pero el contrato recibe y transfiere USDC de terceros: hay que obtener opinión legal antes de mainnet.

---

## A. Qué podemos hacer YA como equipo, sin figura jurídica, para la hackathon

| Acción | Por qué alcanza para la demo | Qué NO significa |
|---|---|---|
| Usar testnet y decir "sin valor real" en home, modal de donación y pitch | No hay transferencia patrimonial real ni oferta al público de inversión | No elimina copyright, datos personales, imagen ni permiso de pared |
| Mostrar direcciones públicas y transacciones de prueba | Son necesarias para la demo técnica | No usarlas como si fueran identidad verificada de personas reales |
| Firmar autorización simple con el artista del mural usado en la demo | Habilita digitalización y exhibición del prototipo | No autoriza por sí sola restauración física ni venta comercial de láminas salvo que lo diga |
| Poner checkbox expreso para recuerdos y prohibir menores/datos sensibles | Minimiza el conflicto entre supresión de datos e inmutabilidad | No garantiza borrado real de IPFS ni de copias de terceros |
| Obtener permiso escrito del dueño de la pared elegida | Evita conflicto posesorio y problemas con el municipio | No reemplaza permisos patrimoniales ni municipales si corresponden |
| Moderar solo en frontend/indexador y guardar el CID on-chain | Permite ocultar contenido inapropiado de la interfaz | El contenido sigue pudiendo existir en IPFS y el CID sigue público |

---

## B. Hallazgos por tema

### 1. Figura jurídica en Mendoza

#### Asociación civil

**Qué es.** Persona jurídica sin fines de lucro, adecuada para una plataforma comunitaria que administra campañas, fondos de mantenimiento y relaciones con municipio/artistas. En Mendoza la autoridad es la Dirección de Personas Jurídicas y Registro Público (DPJ). La Resolución General DPJ 3300/2023 exige, para conformación y autorización de una asociación civil, presentar por correo un único PDF con formulario, acto constitutivo por instrumento público, estatutos, autoridades, declaraciones de beneficiario final/PEP, y demás documentación. El acta debe incluir, entre otros puntos, **mínimo 7 asociados**, domicilio de sede, cuota social y patrimonio inicial no inferior a 1/10 del SMVM.

**Costos y tiempos.** El portal de Atención Ciudadana indica que la constitución de asociación civil usa el código tributario 835. En otra página oficial de la DPJ el código 835 aparece a $75.000, pero **no verifiqué que ese importe corresponda específicamente a constitución AC** (podría ser otro trámite); debe confirmarse antes de presupuestar. La constitución de fundaciones sí aparece publicada con costo **$200.000**, código 838. No encontré tiempos oficiales de otorgamiento; cualquier estimación sería no verificada. La DPJ publicó en 2025 modelos predispuestos que pueden acelerar el control legal si se usan literalmente (RG DPJ 100/2025).

**Por qué nos importa.** Para la hackathon no hace falta. Para producción, una asociación civil propia da personalidad para firmar con artista/restaurador/municipio, abrir cuentas, facturar, contratar y ser responsable de datos. Costo de gobernanza alto para un MVP: libros rubricados, contador, asambleas anuales y presentaciones ante la DPJ.

Fuentes:
- Resolución General DPJ 3300/2023, Mendoza: https://www.mendoza.gov.ar/wp-content/uploads/sites/89/2023/08/pedido_215423_01082023.pdf
- Trámite Constitución (AC), Mendoza: https://atencionciudadana.mendoza.gob.ar/constitucion-ac/
- Constitución (Fundaciones), costo publicado: https://www.mendoza.gov.ar/servicios/gobierno/constitucion-3/
- Servicios DPJ asociación civil: https://www.mendoza.gov.ar/servicios/gobierno/personasjuridicas/asociacion-civil/

#### Fundación

**Qué es.** Más adecuada si hay un patrimonio fundacional permanente destinado a preservación de murales. Tiene gobierno más rígido y menor flexibilidad comunitaria que una asociación. En Mendoza el trámite publicado usa código 838 y costo $200.000.

**Encaje.** Posible a largo plazo si Pared Viva se convierte en fondo de preservación, pero excesiva para hackathon/MVP.

#### SAS

**Qué es.** Sociedad comercial de la Ley 27.349, pensada para emprendimientos con fines de lucro. En Mendoza existe trámite de constitución SAS; el portal indica códigos tributarios variables según uso de modelo, dictamen profesional o trámite ordinario, pero no verifiqué el monto vigente.

**Encaje.** No recomendado como vehículo principal si el relato es donación/comunidad sin fines de lucro: complica exenciones, percepción de donantes y distribución de excedentes. Podría servir si el modelo final es una empresa tecnológica que presta software a ONGs y no recibe las donaciones en su patrimonio.

Fuente: trámite Constitución SAS Mendoza: https://atencionciudadana.mendoza.gob.ar/constitucion-sas/

#### Cooperativa

**Qué es.** Entidad de esfuerzo propio y ayuda mutua regulada por Ley 20.337. Regla general: mínimo 10 asociados; cooperativas de trabajo pueden tener 6 por excepción. INAES exige desde la constitución auditoría externa por contador público nacional, capital social y matrícula.

**Encaje.** Interesante si el proyecto evoluciona a una cooperativa de trabajo de restauradores/cuidadores, pero no es la forma más simple para una plataforma de donaciones y votación de vecinos. Alto costo de cumplimiento.

Fuentes:
- Constitución de cooperativas, INAES: https://www.argentina.gob.ar/inaes/constitucion-de-cooperativas
- FAQ cooperativas, INAES: https://www.argentina.gob.ar/inaes/faq-cooperativas
- Ley 20.337: https://www.argentina.gob.ar/normativa/nacional/ley-20337-18462/texto

#### ONG aliada / fiscal sponsor — recomendación práctica

**Encaje.** Para salir a producción sin esperar meses de constitución, conviene operar mediante convenio con una asociación civil o fundación ya inscripta, idealmente exenta en Ganancias y con objeto cultural/comunitario compatible. La ONG sería donataria y responsable fiscal/fiduciaria; Pared Viva aportaría tecnología. El convenio debe regular: titularidad de fondos, comisión por uso de plataforma (si la hay), obligación de ejecutar la campaña, reembolsos, reportes, KYC/AML, permisos, datos personales y salida.

**Alerta.** Si la ONG solo presta su CUIT pero el equipo controla todo sin documentación, es una estructura débil y riesgosa.

#### Donaciones deducibles y facturación

**Qué dice ARCA.** Las donaciones son deducibles solo si se hacen a fiscos o a instituciones reconocidas por ARCA como exentas en Ganancias y dentro de los límites/condiciones legales; las donaciones en dinero deben bancarizarse y la deducción general tiene límite del 5% de la ganancia neta del ejercicio. La Ley de Impuesto a las Ganancias, art. 26 inc. f), exime a asociaciones/fundaciones/entidades civiles de asistencia social, salud, caridad, educación, ciencia, literatura, arte, etc., si ganancias y patrimonio se destinan a sus fines y no se distribuyen. Pero el art. 85 inc. c), para deducción del donante, tiene una lista más restrictiva de objetivos. **No queda claro —y probablemente no alcanza— que "restaurar un mural" por sí solo habilite deducción al donante.** Esto requiere contador y, si se quiere ofrecer el beneficio, diseño del objeto social y confirmación de ARCA.

Además, ARCA exige a las entidades exentas informar donaciones recibidas. En USDC no hay bancarización tradicional; **no verificado** cómo ARCA espera documentar una donación cripto para deducción. Lo prudente: no prometer deducción impositiva en la web ni en el pitch.

**Facturación/comprobantes.** Una entidad debe emitir comprobantes/recibos y llevar contabilidad según su condición fiscal; si vende láminas, esa venta no es donación y debe facturarse según corresponda. El tratamiento exacto de IVA/Ganancias/Ingresos Brutos de una entidad exenta que vende láminas es contable y no quedó verificado en esta investigación.

Fuentes:
- ARCA, deducciones por donaciones: https://arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/deducciones-generales.asp
- Ley de Impuesto a las Ganancias t.o. 2019, arts. 26 y 85: https://www.argentina.gob.ar/normativa/nacional/decreto-824-2019-332890/actualizacion

---

### 2. Donaciones, crowdfunding y promesa de reembolso

**Régimen civil.** El CCyC art. 1542 define donación como un acto por el cual una persona se obliga a transferir gratuitamente una cosa a otra, y esta lo acepta. Las donaciones de cosas muebles no registrables pueden hacerse por tradición/entrega (art. 1554), por lo que una transferencia de USDC podría operar como entrega del activo digital, aunque la calificación jurídica exacta del USDC exige análisis profesional. El art. 1552 exige escritura pública solo para inmuebles, registrables y prestaciones periódicas/vitalicias — no aplica a aportes tipo USDC.

**Encaje.** En Pared Viva no conviene decir "devolución de una donación pura", sino que el aporte queda sujeto a reglas de campaña/escrow: se destina a restaurar si se alcanza la meta; si no, se habilita el reembolso. Es más transparente describirlo como **aporte condicionado en escrow** o donación con cargo/condición operativa, revisado por abogado.

**Crowdfunding CNV.** La Ley 27.349 creó el Sistema de Financiamiento Colectivo como régimen de promoción del capital emprendedor a través del mercado de capitales (art. 22). Las plataformas de financiamiento colectivo son sociedades anónimas autorizadas, reguladas, fiscalizadas y controladas por la CNV que ponen en contacto inversores con emprendedores (art. 23). El **art. 28 (Exclusiones)** dice textualmente: "Quedan excluidos del Sistema de Financiamiento Colectivo los proyectos destinados a: a) La recaudación de fondos con fines benéficos; b) Las donaciones; c) La venta directa de bienes y/o servicios a través de la plataforma de financiamiento colectivo; d) Los préstamos que no se encuadren dentro del supuesto del artículo 24, apartado ii)". Por tanto, **Pared Viva como donación sin contraprestación financiera queda expresamente excluido del régimen CNV**. **Pero**: si se ofrece retorno económico, participación en ingresos de láminas, tokens negociables o cualquier expectativa de ganancia, el análisis cambia radicalmente y podría requerirse plataforma autorizada.

**Promesa de reembolso.** La promesa visible "si no se llega a la meta, recuperás tu aporte" genera expectativa jurídica exigible. Debe precisar: fecha límite exacta, cómo se calcula la meta, gas/comisiones (si se devuelve neto o bruto), moneda de devolución, demora de red, qué pasa si falla el contrato, y quién responde si hay error o hack. La blockchain puede ejecutar el pago, pero no elimina la obligación legal de informar y cumplir.

Fuentes:
- CCyC, donación arts. 1542 y ss.: https://www.argentina.gob.ar/normativa/nacional/codigo-civil-y-comercial-de-la-nacion-ley-26994-235975/actualizacion
- Ley 27.349, Título II Sistema de Financiamiento Colectivo: https://www.argentina.gob.ar/normativa/nacional/ley-27349-273567/texto

---

### 3. Cripto, stablecoins, PSAV, UIF, impuestos y BCRA

**Definición y registro PSAV.** La Ley 27.739 incorporó a la Ley 25.246 (UIF) las definiciones de activos virtuales y PSAV. Es PSAV quien **como negocio** realiza para o en nombre de otra persona una o más actividades: intercambio fiat/cripto, intercambio cripto/cripto, transferencia, custodia/administración de activos virtuales o instrumentos que permitan ejercer control sobre ellos, y participación/servicios financieros en oferta/venta de activos virtuales. El registro lo centraliza la CNV.

La RG CNV 1058/2025, vigente para el registro TAD desde el 26/5/2025, establece que no están alcanzados como PSAV: quienes operan para sí mismos, quienes reciben/entregan activos virtuales como contraprestación por compraventa de sus propios productos/servicios, los protocolos descentralizados que proveen servicios de activos virtuales cuando no exista un proveedor identificable, y los proveedores exclusivamente de billeteras de autocustodia. También exceptúa ciertos umbrales en UVA para personas humanas, no aplicable a jurídicas.

**Aplicación a Pared Viva.** En testnet no hay operación de valor. En mainnet:

- No hacemos exchange fiat/cripto ni cripto/cripto.
- No custodiamos claves de usuarios: cada donante firma desde su propia wallet (Freighter/passkey).
- Pero el contrato recibe USDC, los retiene como escrow y luego transfiere al restaurador o reembolsa.
- Y hay un equipo identificable que despliega/configura el contrato, opera la web y designa firmantes.

La exclusión de "protocolo descentralizado sin proveedor identificable" **no debería darse por sentada**. Tampoco está claro que recibir donaciones sea "contraprestación por productos o servicios propios". La categoría "transferencia de activos virtuales" por cuenta de terceros es amplia. **Conclusión: encuadre PSAV no verificado / jurídicamente incierto.** Es el punto que más necesita opinión legal antes de operar con dinero real. Factores que empeoran el encuadre: cobrar comisión de plataforma, controlar el único frontend operativo, poder cambiar firmantes o pausar campañas.

**UIF.** La Ley 27.739 incorporó a los PSAV como sujetos obligados ante la UIF. La Resolución UIF 49/2024 exige sistema de prevención LA/FT/FP basado en riesgo, identificación/verificación de clientes, monitoreo continuo, PEP, beneficiario final, listas y reportes de operaciones sospechosas. La UIF además publicó instructivos de reporte de operaciones con activos virtuales (con umbral referenciado a SMVM; verificar el umbral exacto vigente antes de operar, **no verificado en esta investigación**). Si Pared Viva no es PSAV, estas obligaciones no aplican automáticamente, pero conviene implementar mitigación proporcional: identidad del restaurador/ONG/firmantes, screening básico, límites, monitoreo de donaciones anómalas y política de origen de fondos.

**Impuestos.** ARCA afirma que los resultados por enajenación de criptoactivos/monedas digitales están gravados en Ganancias; para personas jurídicas tributan según las alícuotas del art. 73; para personas humanas hay reglas de impuesto cedular según fuente y moneda. También considera criptoactivos alcanzados por Bienes Personales. Para Pared Viva/ONG: recibir USDC como donación no es lo mismo que venderlos, pero hay que valuarlos en pesos, registrarlos contablemente y analizar ganancia/pérdida al convertirlos o transferirlos. El restaurador que cobra en USDC presta un servicio y debe facturar/declarar conforme a su condición fiscal. **No usar en la web "donación deducible" ni "USDC equivale siempre a USD 1".**

**BCRA.** El BCRA y la CNV advirtieron que los criptoactivos no son dinero de curso legal y alertaron volatilidad, ciberataques, lavado y riesgos de contraparte. La Comunicación "A" 7506 prohíbe a las entidades financieras realizar/facilitar operaciones con activos digitales no autorizados; no prohíbe directamente a una ONG recibir USDC, pero complica rampas bancarias y obliga a usar proveedores regulados para conversión a pesos.

Fuentes:
- Ley 27.739: https://www.argentina.gob.ar/normativa/nacional/ley-27739-2024-397355/texto
- RG CNV 1058/2025: https://www.argentina.gob.ar/normativa/nacional/resolucion-1058-2025-410635/texto
- Resolución UIF 49/2024: https://www.boletinoficial.gob.ar/detalleAviso/primera/305109/20240325
- UIF, normativa PSAV: https://www.argentina.gob.ar/noticias/normativa-uif-para-proveedores-de-servicios-de-activos-virtuales
- UIF, reporte de operaciones: https://www.argentina.gob.ar/uif/instructivos/reporte-de-operaciones
- ARCA, criptoactivos y Ganancias: https://www.arca.gob.ar/economia-digital/criptoactivos/impuesto-a-las-ganancias.asp
- ARCA, criptoactivos y Bienes Personales: https://www.arca.gob.ar/economia-digital/criptoactivos/impuesto-sobre-los-bienes-personales.asp
- Alerta BCRA/CNV 2021: https://www.bcra.gob.ar/noticias/alerta-del-bcra-y-la-cnv-sobre-los-riesgos-e-implicancias-de-los-criptoactivos/
- BCRA Comunicación A 7506 / restricciones: https://www.bcra.gob.ar/noticias/el-bcra-desalienta-la-oferta-de-criptoactivos-a-traves-del-sistema-financiero/

---

### 4. Derechos de autor y derechos del artista

**Qué protege la ley.** La Ley 11.723 protege obras artísticas, incluidas pintura, dibujo, escultura, fotografías y producciones artísticas (art. 1). El art. 2 otorga al autor la facultad de disponer de la obra, publicarla, exponerla, adaptarla o autorizar su adaptación y reproducirla en cualquier forma. El art. 4 reconoce como titulares al autor, herederos/derechohabientes y a quienes con permiso del autor la traducen, refunden, adaptan o modifican sobre la nueva obra resultante. La duración general actual es vida del autor más 70 años para herederos/derechohabientes (art. 5, sustituido por Ley 24.870).

**Derechos morales.** La ley argentina y la doctrina reconocen derechos morales de paternidad e integridad, irrenunciables/inalienables; el art. 83 preserva acciones contra mutilaciones o alteraciones incluso respecto de obras en dominio público. Por tanto, "la pared está en la vía pública" **no significa dominio público ni permiso para modificarla**. Restaurar puede ser materialmente conservar, pero si cambia colores, formas, símbolos o agrega elementos, puede afectar integridad.

**Aplicación exacta a Pared Viva.** Necesitamos autorización expresa del autor/derechohabiente para:

1. fotografiar y digitalizar el mural;
2. recortarlo/dividirlo en grilla y mostrarlo online;
3. restaurarlo físicamente, definiendo si es restauración fiel o intervención/actualización;
4. vender láminas/reproducciones y usar la imagen en prensa/redes;
5. crear obras derivadas, filtros, versiones digitales, animaciones o láminas modificadas;
6. fijar el porcentaje del split artista/fondo y el mecanismo de pago en USDC.

También hay que revisar si el mural fue obra encargada, colectiva o realizada en relación de dependencia, porque puede haber coautores o derechos del comitente. Si el autor murió, consultar herederos/derechohabientes durante el plazo legal. El restaurador debe firmar que su trabajo se realiza bajo instrucciones, que no reclama titularidad sobre la obra original y que cualquier aporte propio se licencia/cede en la medida permitida, sin perjuicio de derechos irrenunciables.

Fuentes:
- Ley 11.723 actualizada: https://www.argentina.gob.ar/normativa/nacional/ley-11723-1933-42755/actualizacion
- Ley 24.870, duración vida + 70 años: https://www.argentina.gob.ar/normativa/nacional/ley-24870-1997-45758/texto
- Registro de murales de Ciudad de Mendoza y restauración acordada con autores: https://prensa.ciudaddemendoza.gob.ar/2024/05/28/la-ciudad-lanza-una-convocatoria-para-autores-de-murales-de-capital/

---

### 5. Espacio público, patrimonio y permiso de la pared

**Ciudad de Mendoza.** El Código de Convivencia (Ordenanza 3877/2014) prohíbe grafitis/pintadas en espacio público (art. 21.1), pero excluye expresamente de la prohibición —verificado en el texto de la ordenanza— "los murales artísticos que se realicen **con autorización del propietario y municipal en su caso, y con previa comunicación a la autoridad municipal**". La frase "y municipal en su caso" importa: si la pared es de dominio público/municipal, no alcanza con comunicar: hace falta **autorización municipal**. Si la pared es privada, hace falta autorización escrita del propietario + comunicación previa al municipio. Esto es clave: el consentimiento del dueño solo no basta.

La Municipalidad además lanzó en 2024 un relevamiento/registro geolocalizado de murales y autores para evaluar restauraciones "acordadas previamente con los autores". Para Pared Viva, el mejor camino institucional es elegir un mural de ese registro o registrarlo y acordar con Cultura la intervención. (Verificado el 27/11/2026 en la página oficial de prensa: la convocatoria existió, el registro busca geolocalizar obras y autores, y el texto dice literalmente que el relevamiento permitirá evaluar "un trabajo de restauración acordado previamente con los autores".)

**Patrimonio provincial.** La Ley provincial 6.034 declara de interés la protección, conservación y restauración de bienes del patrimonio cultural de Mendoza. Son integrantes bienes con interés antropológico, histórico, arqueológico, artístico, monumental, etc., luego de declaración por autoridad de aplicación. El Decreto 1882/2009 asigna a la Dirección de Patrimonio Cultural la aprobación de intervenciones sobre bienes patrimoniales y su entorno, incluida restauración o cualquier intervención que afecte estructura o imagen. Por tanto, antes de intervenir hay que verificar si el inmueble/mural o su entorno están declarados, tienen más de 50 años o forman parte de conjunto protegido. Si está protegido, se requiere aprobación patrimonial además del permiso del dueño/municipio.

**Godoy Cruz, Guaymallén y otros municipios.** No verifiqué una ordenanza específica de murales/arte urbano para cada municipio. No asumir que vale la regla de Ciudad de Mendoza: hay que consultar a la dirección de cultura/espacio público del departamento correspondiente y documentar la respuesta por escrito.

**Mecenazgo.** Mendoza no tiene ley de mecenazgo cultural vigente: la Cámara de Diputados provincial informó en junio y noviembre de 2024 que el proyecto está en elaboración/fusión de iniciativas. No hay beneficios impositivos de mecenazgo provincial en los que apoyarse. (Verificado en fuente oficial legislativa.)

Fuentes:
- Código de Convivencia Ciudad de Mendoza, Ordenanza 3877/2014: https://ciudaddemendoza.gob.ar/wp-content/uploads/2025/01/ORDENANZA-3877-CODIGO-DE-CONVIVENCIA-CIUDAD-DE-MENDOZA.pdf
- Programa Mejores Fachadas y regla de autorización propietario + comunicación municipal: https://prensa.ciudaddemendoza.gob.ar/2025/04/23/el-programa-mejores-fachadas-ya-es-una-realidad-en-ciudad/
- Registro de murales y autores: https://prensa.ciudaddemendoza.gob.ar/2024/05/28/la-ciudad-lanza-una-convocatoria-para-autores-de-murales-de-capital/
- Ley 6.034 de patrimonio cultural de Mendoza: https://www.mendoza.gov.ar/wp-content/uploads/sites/17/2023/04/Ley-6034.pdf
- Decreto 1882/2009 reglamentario: https://www.mendoza.gov.ar/wp-content/uploads/sites/17/2023/04/Decreto-1882.pdf
- Mecenazgo en elaboración / no vigente: https://www.hcdmza.gob.ar/site/noticias/9195-avanza-en-diputados-la-redaccion-final-de-una-ley-de-mecenazgo-cultural

---

### 6. Datos personales, imagen, menores, IPFS e inmutabilidad

**Ley 25.326.** Datos personales son información de cualquier tipo referida a personas físicas determinadas o determinables. Datos sensibles incluyen origen racial/étnico, opiniones políticas, convicciones religiosas/filosóficas/morales, afiliación sindical, salud y vida sexual. Tratamiento incluye recolección, conservación, almacenamiento, modificación, cesión y destrucción. La ley exige consentimiento (art. 5) y reconoce derechos de acceso, rectificación, actualización y supresión (art. 16). La AAIP es la autoridad de control.

**Conflicto blockchain/IPFS.** La tecnología blockchain es inherentemente inmutable y las operaciones irreversibles, como la propia normativa argentina reconoce al describirla. En Pared Viva hay tres capas:

1. **On-chain:** dirección del donante, monto, ladrillo, CID y eventos de hitos/votos.
2. **IPFS:** foto/texto/audio del recuerdo.
3. **Frontend/indexadores/pinning:** copias, cachés, metadatos y moderación.

Aunque una dirección sea seudónima, puede convertirse en dato personal si es vinculable a una persona. Un texto o foto claramente es dato personal si identifica a alguien. La supresión absoluta es imposible de garantizar una vez replicado en IPFS/blockchain. Por eso la regla de diseño no debe ser "después lo borramos", sino **minimización desde el inicio**: no subir datos sensibles, no fotos de menores, no documentos, no domicilios, no teléfonos, no datos de terceros sin consentimiento; usar apodo; solo CID on-chain; permitir ocultar en frontend y despinnear/bloquear en nuestro gateway, explicando que copias externas pueden persistir.

**Imagen y menores.** CCyC art. 53 exige consentimiento para captar o reproducir imagen o voz, salvo excepciones como actos públicos, interés científico/cultural/educacional prioritario con precauciones o información de interés general. Esas excepciones no deberían estirarse para un archivo permanente de recuerdos. El consentimiento no se presume y es de interpretación restrictiva (art. 55). Los menores ejercen derechos mediante representantes legales (arts. 25–26). Recomendación fuerte: para el MVP, prohibir fotos de menores aunque haya consentimiento; si aparecen personas, exigir declaración de que el upload cuenta con consentimiento de todas.

**Moderación.** Necesitamos un canal de reporte, revisión humana y criterios para ocultar contenido ilegal, ofensivo, discriminatorio, íntimo no consentido o con datos sensibles. La moderación debe estar documentada porque el operador de la plataforma puede ser considerado responsable del archivo/base de datos que decide publicar/indexar, aunque el archivo binario esté en IPFS.

Fuentes:
- Ley 25.326 actualizada: https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/actualizacion
- AAIP, documentos y medidas de seguridad: https://www.argentina.gob.ar/aaip/documentos-de-proteccion-de-datos-personales
- CCyC arts. 25–26, 52–55: https://www.argentina.gob.ar/normativa/nacional/codigo-civil-y-comercial-de-la-nacion-ley-26994-235975/actualizacion

---

### 7. Venta de láminas y defensa del consumidor

**Qué aplica.** Si Pared Viva/ONG vende láminas online de manera organizada, puede quedar alcanzada por la Ley 24.240 aunque destine fondos a mantenimiento. El art. 4 exige información cierta, clara y detallada sobre características esenciales del bien/servicio y condiciones de comercialización. El art. 34 otorga revocación dentro de 10 días corridos en supuestos de venta a distancia, sin responsabilidad y con gastos de devolución a cargo del vendedor. La Disposición 954/2025 (Secretaría de Comercio) exige un link destacado denominado **"BOTÓN DE ARREPENTIMIENTO"** en el primer acceso de páginas que comercialicen bienes/servicios a distancia y prohíbe exigir registración previa para usarlo.

**Encaje.** Donar no es comprar una lámina; no mezclar ambos flujos. La compra de lámina debe mostrar vendedor real, CUIT/domicilio, precio total, costos de envío, plazos, stock, política de devolución, botón de arrepentimiento, licencia del artista y factura. Si la lámina se vende solo en fase 2, dejarlo fuera del MVP pero no prometerla como ya operativa.

Fuentes:
- Ley 27.250 que sustituye art. 4 de Ley 24.240: https://www.argentina.gob.ar/normativa/nacional/ley-27250-2016-262686/texto
- Art. 34 Ley 24.240 según norma modificatoria: https://www.argentina.gob.ar/normativa/nacional/norma-139252/texto
- Disposición 954/2025, botón de arrepentimiento: https://www.argentina.gob.ar/normativa/nacional/disposici%C3%B3n-954-2025-417152/texto

---

### 8. Token de guardián y votación

**Ley de Mercado de Capitales.** La Ley 26.831 art. 2 define valores negociables de modo amplio, incluyendo valores homogéneos y fungibles, contratos de inversión y derechos susceptibles de tráfico generalizado e impersonal. La RG CNV 1058/2025 prohíbe a los PSAV ofrecer/intermediar activos virtuales que sean valores negociables sin autorización de oferta pública (art. 37).

**Encaje.** El token/registro de guardián de Pared Viva debe quedar estructuralmente fuera de esa zona:

- intransferible por diseño;
- no comprable ni vendible;
- sin rendimiento, dividendos, intereses, buyback, staking o expectativa de ganancia;
- sin representar deuda, participación patrimonial ni derecho sobre ingresos;
- no usar "inversión", "rentabilidad", "retorno", "apreciación", "tokenizamos el mural", "dueños del mural", "gobernanza vinculante".

La votación de guardianes debe ser **consultiva/comunitaria**. La decisión final de intervenir una pared depende siempre del propietario, autor, restaurador, municipio y, si corresponde, autoridad patrimonial. En el pitch decir: "los guardianes proponen y priorizan; la ejecución requiere acuerdo institucional".

Fuentes:
- Ley 26.831 art. 2 y competencia CNV: https://www.argentina.gob.ar/normativa/nacional/ley-26831-206592/texto
- RG CNV 1058/2025, art. 37: https://www.argentina.gob.ar/normativa/nacional/resolucion-1058-2025-410635/texto

---

## C. Tabla priorizada de riesgos legales

| Prioridad | Riesgo legal | Norma / fuente | Qué hacer | Cuándo |
|---|---|---|---|---|
| 1 | Publicar recuerdos personales irreversibles sin consentimiento | Ley 25.326 arts. 5/16; CCyC 53/55 | Checkbox expreso, advertencia de irreversibilidad, prohibir datos sensibles/menores, moderación y canal de reporte | Antes de la demo |
| 2 | Usar imagen del mural sin permiso | Ley 11.723 arts. 1, 2, 4, 5, 83 | Autorización escrita del autor para digitalizar/exhibir/restaurar/vender láminas | Antes de usar imagen real |
| 3 | Intervenir pared sin propietario/municipio | Ord. 3877/2014 Cód. Convivencia Mendoza; Ley 6034/Decreto 1882 | Permiso escrito del dueño + comunicación municipal + chequeo patrimonio | Antes de cualquier intervención física |
| 4 | Parecer oferta de inversión | Ley 26.831 art. 2; RG CNV 1058/2025 art. 37 | Token intransferible, sin rendimiento; lenguaje "donación/reconocimiento" | Ya, en pitch/web |
| 5 | Encuadre incierto como PSAV/UIF | Ley 27.739; Ley 25.246; RG CNV 1058; UIF 49/2024 | Opinión legal mainnet; diseño no custodial; documentar que no hay exchange ni control de claves | Antes de dinero real |
| 6 | Promesa de reembolso imprecisa | CCyC contratos/donación; buena fe | Reglas exactas: fecha, meta, neto/bruto, gas, fallas, firmantes, restaurador incumplidor | Antes de abrir campaña real |
| 7 | Falta de entidad responsable y facturación | RG DPJ 3300/2023; ARCA | Convenio con ONG aliada o constituir AC; contador; recibos/facturación | Antes de dinero real |
| 8 | Donaciones cripto no bancarizadas/no deducibles | LIG arts. 26/85; ARCA | No prometer deducción; contabilizar valuación y registro | Antes de dinero real |
| 9 | Venta de láminas sin botón/info de consumidor | Ley 24.240 arts. 4/34; Disp. 954/2025 | Flujo separado de compra, botón, identidad del vendedor, política devolución | Antes de vender láminas |
| 10 | Restaurador cobra hito y no cumple | Derecho contractual CCyC; reglas campaña | Acuerdo por hitos con evidencias, cura, retención de hitos futuros, sustitución y reclamo off-chain | Antes de financiar restauración |
| 11 | Firmante pierde clave o desaparece | Diseño contrato / responsabilidad operativa | 2 de 3 sigue operando; documentar contacto; para producción considerar rotación de firmantes | Ya en reglas |
| 12 | Mural patrimonial o entorno protegido | Ley 6034; Decreto 1882 | Consulta previa a Dirección de Patrimonio Cultural | Antes de elegir pared real |

---

## D. Recomendaciones concretas priorizadas

### Prioridad alta

1. **[Alta | Todo el equipo | S]** Agregar en home, modal y pitch: "Prototipo en Stellar testnet. Los tokens son de prueba y no tienen valor real. No es una inversión ni ofrece rendimiento."
2. **[Alta | C | S]** Implementar antes de subir recuerdo el checkbox de consentimiento de [legal/consentimiento-recuerdos.md](legal/consentimiento-recuerdos.md) y prohibir fotos de menores/datos sensibles.
3. **[Alta | C | S]** Agregar aviso permanente: "Los recuerdos publicados en IPFS y los identificadores registrados en blockchain pueden ser permanentes y no borrarse."
4. **[Alta | Todo el equipo | S]** Elegir para la demo un mural cuyo autor firme la autorización corta de [legal/licencia-del-artista.md](legal/licencia-del-artista.md); si no hay autor, usar una obra propia/mock.
5. **[Alta | C | M]** Incorporar moderación frontend: reportar, ocultar CID en la interfaz y registro interno de decisiones. Documentar que no equivale a borrado blockchain/IPFS.
6. **[Alta | B | M]** Publicar las reglas de campaña adaptadas al contrato: meta 1.000 USDC, mínimo 1 USDC, hitos 400/300/300, aprobación 2/3, reembolso y excedente al fondo.
7. **[Alta | Todo el equipo | M]** Para producción, conseguir una ONG aliada y redactar convenio de fiscal sponsor antes de aceptar USDC real.
8. **[Alta | A + abogado externo | M]** Encargar opinión legal sobre PSAV/UIF para el diseño exacto: quién despliega, quién puede cambiar firmantes, quién controla frontend, si hay comisión y si el contrato es realmente no custodial.
9. **[Alta | Todo el equipo | M]** Eliminar del pitch palabras de inversión; reemplazar por "donación", "aporte solidario", "reconocimiento", "participación consultiva".

### Prioridad media

10. **[Media | A | M]** En una versión de producción evaluar rotación de firmantes o mecanismo de emergencia; hoy, si dos claves desaparecen, fondos futuros pueden quedar bloqueados.
11. **[Media | B | S]** Separar visualmente donación de compra de lámina; no presentar la lámina como recompensa automática de la donación.
12. **[Media | C | M]** Crear registro de autorizaciones: artista, dueño de pared, municipio, restaurador, personas fotografiadas.
13. **[Media | Todo el equipo | M]** Consultar por escrito a Cultura/Patrimonio del municipio donde esté la pared antes de seleccionarla.
14. **[Media | A/B | M]** Diseñar eventos off-chain de evidencia de hitos: fotos, informe del restaurador, aprobación escrita, CID del informe.
15. **[Media | Todo el equipo | M]** Definir política AML proporcional aunque no seamos sujetos obligados: verificar restaurador/ONG/firmantes, revisar donaciones inusuales, bloquear donaciones de origen sancionado.

### Prioridad baja

16. **[Baja | Todo el equipo | L]** Evaluar constituir asociación civil propia en Mendoza usando modelos DPJ 100/2025 una vez validado el proyecto.
17. **[Baja | A | L]** Evaluar gobernanza más robusta: rotating multisig, pausas, recuperación, disclosure de firmantes.
18. **[Baja | C | L]** Diseñar política de archivo histórico que equilibre memoria comunitaria, privacidad y derecho al olvido.

---

## E. Preguntas abiertas para decidir

1. ¿Pared Viva será una plataforma tecnológica neutral al servicio de ONGs o la entidad que recibe/administra donaciones? Esta decisión define PSAV, consumidor, facturación y responsabilidad.
2. ¿Quién será donatario legal en mainnet: una ONG aliada, una futura asociación civil o el restaurador directamente?
3. ¿Cobraremos comisión de plataforma? Si sí, cómo se calcula, se informa y se factura; esto puede acercar el modelo a actividad "como negocio".
4. ¿Los firmantes serán personas públicas identificables (municipio/ONG/artista) o miembros del equipo? ¿Qué independencia tendrán?
5. ¿La votación de guardianes tendrá algún efecto sobre fondos o solo prioriza propuestas?
6. ¿Aceptaremos recuerdos con imágenes de personas o solo texto/imágenes sin personas para el MVP?
7. ¿Cuál será la política de contenido y el plazo de respuesta a reportes?
8. ¿Se permitirá reembolso neto de gas o exactamente el monto aportado? El contrato hoy devuelve el monto registrado; hay que explicarlo.
9. ¿Qué pasa si el autor no quiere vender láminas pero sí restauración? La licencia debe ser modular.
10. ¿Hay que registrar la campaña ante algún organismo municipal/provincial si se publicita masivamente? No verificado.

---

# F. Borradores listos para adaptar

Borradores de trabajo para la hackathon, no documentos finales: completar los [CORCHETES] y revisarlos con abogado y contador antes de producción. Donde diga "USDC" se asume mainnet; para la demo debe quedar activada la aclaración de testnet.

| Documento | Archivo |
|---|---|
| Términos y Condiciones de la plataforma | [legal/terminos-y-condiciones.md](legal/terminos-y-condiciones.md) |
| Política de Privacidad | [legal/politica-de-privacidad.md](legal/politica-de-privacidad.md) |
| Reglas de la campaña | [legal/reglas-de-la-campania.md](legal/reglas-de-la-campania.md) |
| Autorización / licencia del artista | [legal/licencia-del-artista.md](legal/licencia-del-artista.md) |
| Acuerdo con el restaurador por hitos | [legal/acuerdo-con-el-restaurador.md](legal/acuerdo-con-el-restaurador.md) |
| Aviso de riesgos cripto para donantes | [legal/aviso-de-riesgos-cripto.md](legal/aviso-de-riesgos-cripto.md) |
| Consentimiento para subir recuerdos | [legal/consentimiento-recuerdos.md](legal/consentimiento-recuerdos.md) |

## G. Notas de verificación y límites de esta investigación

- Las normas nacionales se citaron desde argentina.gob.ar/normativa (textos actualizados o vigentes según el portal) y Boletín Oficial; las provinciales/municipales desde mendoza.gov.ar y ciudaddemendoza.gob.ar.
- La página de prensa de la Ciudad de Mendoza sobre el registro de murales fue verificada con su contenido literal (convocatoria 28/5/2024, registro geolocalizado de obras y autores, restauración "acordada previamente con los autores"); igualmente conviene abrirla en navegador antes de citarla públicamente porque es una nota de prensa, no una norma.
- Ítems marcados como **no verificado** dentro del texto: costo exacto del trámite 835 de constitución de asociación civil; tiempos de otorgamiento DPJ; umbral exacto de reporte UIF para PSAV (referenciado a SMVM); tratamiento contable de la venta de láminas por entidad exenta; ordenanzas de murales en Godoy Cruz/Guaymallén; documentación ARCA de donaciones cripto para deducción; encuadre PSAV del diseño concreto de Pared Viva.
- No se encontró ley de mecenazgo vigente en Mendoza; solo proyectos en elaboración según fuente legislativa oficial (noviembre 2024).
