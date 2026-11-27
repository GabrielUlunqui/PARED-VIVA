# Modelo de negocio — Pared Viva

**Fecha:** 27 de noviembre de 2026  
**Alcance:** investigación para el pitch y la continuidad post-hackathon. No es asesoría legal, contable ni impositiva.

## Resumen ejecutivo (lectura de 2 minutos)

- **Modelo recomendado:** el ingreso principal no debe ser una comisión sobre las donaciones barriales. Debe ser **B2G/B2B: campañas llave en mano para municipios, DGE/escuelas, museos, fundaciones y empresas con RSE**, cobradas como fee fijo de implementación más un success fee facturado al cliente institucional. Las donaciones de vecinos quedan **100 % en el escrow público**; cualquier fee institucional se factura por fuera para no contradecir la promesa de transparencia.
- **Secundarios:** (1) paquetes de sponsor/matching donde una parte visible va a la campaña y una parte claramente separada paga la operación de Pared Viva; (2) fee del 10 % sobre venta de láminas/merch, además del split artista/fondo. La “propina” voluntaria al donante puede probarse, pero no debe ser la fuente principal: es incierta y culturalmente puede generar fricción.
- **La comisión pura no cierra:** con metas de 1.000–5.000 USDC, un 5 % son solo 50–250 USDC por campaña. Ni siquiera cubre operación, soporte, moderación, seguridad, rampas ni ventas. ioby, referente de crowdfunding cívico, cerró tras 16 años aun habiendo movido más de USD 21 millones, explícitamente por no encontrar sostenibilidad financiera: [ioby — Closing Our Doors](https://ioby.org/resources/closing/).
- **Benchmark de fees:** GoFundMe cobra 0 % de plataforma y 2,9 % + USD 0,30 de procesamiento en EE. UU., financiado por propinas voluntarias; Kickstarter cobra 5 % + procesamiento si la campaña tiene éxito; Spacehive cobra 7,5 % + IVA y lo suma a la meta; Goteo cobra 5 %; Hispania Nostra cobra 7,5–10 %; Giveth y Gitcoin no retienen las donaciones. Fuentes en la tabla comparativa.
- **Mercado inicial real:** no hay un TAM público confiable para “crowdfunding cívico de restauración de murales en Argentina”. Los datos CCAF muestran que el crowdfunding de donación en LAC es pequeño comparado con las finanzas alternativas empresarias: aproximadamente USD 35 millones en 2019 y USD 15–16 millones en 2020, dentro de un mercado alternativo regional de USD 5.270 millones dominado por crédito/empresas: [CCAF 2021, executive summary y figura 5.9](https://www.jbs.cam.ac.uk/wp-content/uploads/2021/06/ccaf-2021-06-report-2nd-global-alternative-finance-benchmarking-study-report.pdf). Por eso el mercado inicial debe venderse como **servicio a instituciones**, no como volumen masivo de donaciones minoristas.
- **Mendoza tiene un anzuelo concreto:** la Dirección de Cultura de la Ciudad relevó murales con geolocalización y autores para evaluar restauraciones acordadas con sus autores. Es el aliado/cliente ideal para un piloto: [Prensa Ciudad de Mendoza, 28/05/2024](https://prensa.ciudaddemendoza.gob.ar/2024/05/28/la-ciudad-lanza-una-convocatoria-para-autores-de-murales-de-capital/). La provincia tuvo un Programa de Arte Público y Muralismo: [Gobierno de Mendoza](https://www.mendoza.gov.ar/prensa/programa-provincial-de-arte-publico-y-muralismo/). La Ciudad tiene 127.160 habitantes y la provincia 2.043.540 según el Censo 2022 definitivo: [planilla INDEC](https://censo.gob.ar/wp-content/uploads/2023/11/c2022_mendoza_est_c1_13.xlsx).
- **Financiamiento puente:** el camino natural es **Instaward vía el Capítulo Argentina → SCF Build**. Instawards no tiene aplicación abierta: requiere participación activa en el capítulo, sprint de 30 días, normalmente USD 1.000–5.000 inicial y hasta USD 15.000 agregado con follow-ons: [reglas oficiales](https://stellar.gitbook.io/scf-handbook/scf-awards/instawards/official-rules). SCF Build llega hasta USD 150.000 en XLM por hitos, con KYC/KYB, roadmap, presupuesto y posible Audit Bank: [Build Award](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award).
- **Rampa ARS:** hoy lo más prometedor es una combinación de Vesseo/Lemon/Ripio para usuarios que ya usan apps cripto y MoneyGram/Anclap para efectivo o banco. Anclap publica en vivo depósitos ARS con fee 1 % + ARS 10 y retiros 2 % + ARS 10, con KYC: [SEP-24 info](https://api.anclap.com/transfer24/info). Vesseo confirmó cash-in/out en pesos por MoneyGram en Argentina: [Vesseo](https://vesseoapp.com/es/blog-ar/con-vesseo-trae-tus-fondos-y-convertirlos-en-efectivo-en-argentina). Para la hackathon no hace falta resolverlo; para operar en serio sí es crítico.
- **Proyección honesta:** en el escenario base, el año 1 es deficitario (aprox. -USD 5.560 antes de grants) y el año 3 recién llega a equilibrio levemente positivo (aprox. +USD 6.350) con 30 campañas/año, tres licencias institucionales y costos muy lean. La conclusión es que **los grants de Stellar son puente de financiamiento, no modelo de negocio**, y que hay que conseguir instituciones anchor desde el primer piloto.

---

## 1. Qué es Pared Viva para el modelo de negocio

Pared Viva no es “otro GoFundMe con blockchain”. Es una infraestructura de campañas de restauración/memoria con cuatro garantías concretas ya reflejadas en el MVP:

1. **Escrow público en Soroban:** los aportes en USDC quedan en el contrato, no en una cuenta opaca.
2. **Liberación por hitos:** la campaña demo tiene meta 1.000 USDC y hitos 40/30/30 que se liberan cuando firman 2 de 3 firmantes.
3. **Reembolso si fracasa:** si vence la fecha sin llegar a la meta, cada donante puede recuperar su aporte.
4. **Memoria y continuidad:** cada donación de al menos 1 USDC adopta un ladrillo y guarda el CID de un recuerdo en IPFS; el excedente va al fondo de mantenimiento; las láminas reparten entre artista/fondo; los guardianes intransferibles votan la próxima pared.

### Necesario para la hackathon vs necesario para operar de verdad

| Para ganar/validar en la hackathon | Para operar con dinero real |
|---|---|
| Mostrar una campaña testnet con donación real en Stellar, hitos 2 de 3, reembolso, mural que se pinta y recuerdo IPFS. | Entidad legal, términos, política de reembolsos, compliance/KYC cuando corresponda, revisión impositiva, auditoría de contratos, monitoreo y custodia segura de claves. |
| Explicar el modelo de ingreso; no hace falta implementar cobro de fees en el contrato. | Implementar o facturar el modelo elegido sin contaminar el escrow de donantes. |
| Usar USDC de test y cuentas preparadas. | Rampa ARS↔USDC con costos, límites, tiempos, KYC, soporte y manejo de errores. |
| Un piloto con un mural/autor real y un usuario externo probando. | Permisos de autor/propietario del muro, derechos de imagen para láminas, contrato con restaurador, moderación de recuerdos y protección de datos. |
| Dashboard simple de impacto. | Reportes auditables para municipios/empresas: uso de fondos, hitos, donantes agregados, costos, evidencia fotográfica. |

---

## 2. Hallazgos

### 2.1 Fuentes de ingreso posibles y benchmarks

#### A. Comisión sobre donaciones

**Qué es.** Cobrar un porcentaje del monto donado o recaudado.

**Benchmarks verificados.**

| Plataforma | Fee publicado | Modelo | Fuente |
|---|---:|---|---|
| GoFundMe | 0 % plataforma; 2,9 % + USD 0,30 por donación en EE. UU.; propina voluntaria; recurrentes 5 % | Donaciones | [pricing](https://www.gofundme.com/c/pricing), [help](https://support.gofundme.com/hc/en-us/articles/203604424-Learn-about-GoFundMe-fees) |
| Kickstarter | 5 % del total si tiene éxito + procesamiento aprox. 3–5 % | Recompensas, todo o nada | [fees](https://www.kickstarter.com/help/fees) |
| Spacehive | 7,5 % + VAT sumado a la meta; Stripe aprox. 2,9 %; sin propinas | Crowdfunding cívico con match funds | [fees](https://help.spacehive.com/en/articles/10599548-what-are-the-fees-for-using-spacehive) |
| Goteo | 5 % si se alcanza el mínimo + costos bancarios/PayPal | Cívico/cultural/commons, open source | [términos](https://widget.goteo.org/legal/terms?currency=EUR) |
| Hispania Nostra | 7,5 % socios / 10 % no socios | Micromecenazgo de patrimonio | [FAQ](https://crowdfunding.hispanianostra.org/faq?user-lang=EN) |
| Catarse | 13 % total, incluye plataforma y medio de pago | Creativo/recompensas Brasil | [Catarse](https://crowdfunding.catarse.me/para-criadores/escritores) |
| Giveth | 0 %; 100 % va directo al proyecto | Donaciones cripto | [Zero Fees](https://docs.giveth.io/zero-fees) |
| Gitcoin | “keeps none of the funds raised”; matching por Quadratic Funding | Public goods | [programa](https://gitcoin.co/program) |
| Ideame, Argentina | 5 % histórica en todo o nada; 10 % en “todo suma” si no llegaba a meta | Recompensas/creativo LatAm | [deck histórico](https://es.slideshare.net/slideshow/ideame/33087441), [Crónista 2012](https://www.cronista.com/infotechnology/internet/ideame-permite-obtener-fondos-aunque-no-se-logre-la-meta-establecida/) — **histórico, no verificado como operación actual** |
| DonarOnline, Argentina | 3,5 % por transacción + plan mensual/anual + 0–5 % pasarela; Esencial ARS 4.990/mes o 59.880/año y Profesional ARS 19.400/mes o 232.800/año al momento de consulta | SaaS de recaudación para ONGs | [pricing](https://donaronline.org/pricing), [suscripción](https://soporte.donaronline.org/es/articles/9888686-suscripcion-a-uno-de-nuestros-planes) |
| Vaki, LatAm/Colombia | 6 % plataforma + aprox. 4 % pasarela; Vaki Social puede devolver la tasa plataforma si cumple requisitos | Donaciones/recaudo social | [costos](https://help.vaki.co/es/articles/9181108-costos-de-vaki-planifica-y-optimiza-tu-recaudo), [Vaki Social](https://help.vaki.co/es/articles/9187182-explorando-vaki-social-la-nueva-era-del-crowdfunding-con-impacto-social) |

**Por qué nos importa.** Una comisión de 5–7,5 % es aceptada por el mercado, pero en campañas chicas no produce ingresos suficientes. Si una campaña de barrio junta 1.000 USDC, 5 % = 50 USDC; en 5.000 USDC, 5 % = 250 USDC. Además, descontarla del escrow debilitaría el mensaje “todo lo que donás se ve y se destina al mural”.

**Recomendación.** No cobrar fee obligatorio sobre donaciones barriales. Si se implementa un success fee, que sea **facturado al cliente institucional por fuera del escrow** y mostrado en el presupuesto público de la campaña. DonarOnline es una evidencia local importante: incluso un producto de donaciones establecido combina comisión transaccional con planes SaaS mensuales/anuales; eso refuerza que la monetización institucional recurrente es más defendible que vivir solo del rake de cada donación.

#### B. Propina/fee opcional del donante

**Qué es.** Sugerir al donante un aporte adicional para sostener la plataforma, configurable y evitable.

GoFundMe lo usa como fuente central de monetización ([fuente](https://transparency.gofundme.com/hc/en-us/articles/25144121631643-Pricing-and-Fees)); Spacehive explícitamente lo rechaza por confundir a donantes y usa fee fija transparente ([fuente](https://help.spacehive.com/en/articles/10599548-what-are-the-fees-for-using-spacehive)). En el ecosistema Web3, Giveth documenta 0 % fees y reconoce en su foro debates sobre revenue streams, lo que muestra la tensión de sostener una plataforma gratuita: [Zero Fees](https://docs.giveth.io/zero-fees), [discusión de revenue](https://forum.giveth.io/t/revenue-streams-platform-fees-and-givfi-v0-1/823).

**Encaje con Pared Viva.** Puede probarse como “¿querés sumar 5 % para mantener Pared Viva?” con default no invasivo y posibilidad clara de poner 0. Debe ir a una dirección/treasury separada, nunca mezclarse con el escrow ni contar para la meta. No conviene asumir más de 1,5–2,5 % efectivo sobre GMV en proyecciones.

#### C. SaaS/licencia o campañas llave en mano para instituciones

**Qué es.** Municipios, DGE/escuelas, centros culturales, fundaciones o empresas pagan por lanzar campañas con la infraestructura, curaduría, reportes y soporte de Pared Viva.

**Benchmark.** Go Vocal no publica precio cerrado y vende planes anuales por capacidades/asientos ([planes](https://www.govocal.com/plans)). Como referencia puntual de procurement público, una comisión vecinal de Washington DC documentó una licencia anual de USD 2.000 para una organización pequeña ([resolución pública](https://anc3a.dc.gov/sites/default/files/file-upload/Dec%202024%20Resolution%20RE%20Proposed%20Go%20Vocal%20Contract_0.pdf)); un contrato UK de Go Vocal registra £16.625 anuales para una agencia mayor ([contrato G-Cloud](https://www.contractsfinder.service.gov.uk/Notice/Attachment/1ce345d8-976e-4ed0-9b53-9e118e044423)). No son “precio típico universal”, pero muestran un rango amplio según tamaño institucional.

**Encaje.** Es el mejor modelo principal porque quien recibe valor de reporte, transparencia y participación no es solo el vecino: es la institución que quiere ejecutar un programa de murales/medición sin construir tecnología propia.

#### D. Sponsor por pared y matching

**Qué es.** Una empresa, fundación o municipio aporta matching y/o paga un paquete de visibilidad vinculado a una pared.

Spacehive institucionalizó este modelo: municipios, empresas y fundaciones crean fondos que cofinancian proyectos locales y acompañan campañas ([Funds](https://about.spacehive.com/funds/), [cómo funcionan](https://help.spacehive.com/en/articles/10579785-how-spacehive-funds-work)). Esto valida que el matching institucional no es una idea exótica.

**Encaje.** Muy alto: murales son visibles, locales y fotografiables. Debe separarse contablemente: (a) el matching visible entra al escrow/campaña; (b) el fee de gestión/reporte de Pared Viva se factura aparte y se publica. La marca puede aparecer en la página del mural digital y reportes, no necesariamente invadiendo la obra física.

#### E. Venta de láminas/merch

**Qué es.** Cobrar un porcentaje de las ventas de láminas o productos derivados del mural.

Benchmarks: Etsy cobra 6,5 % de transacción + fee de procesamiento según país; para Argentina el procesamiento figura 6,5 % + USD 0,30 ([fees](https://www.etsy.com/legal/fees/), [processing](https://help.etsy.com/hc/en-us/articles/115015628847-What-are-Payment-Processing-Fees-for-Selling-on-Etsy)). Redbubble usa un markup del artista sobre precio base y documenta markup default 10 % en su ayuda actual ([Redbubble](https://help.redbubble.com/hc/en-us/articles/202270799-How-is-my-payment-calculated)). No son equivalentes exactos, pero muestran que un take-rate de 6–10 % sobre marketplace/creator commerce es normal.

**Encaje.** Es coherente con la fase 2 de Pared Viva, pero no puede sostener solo el negocio al inicio: depende de volumen, producción, logística y derechos de imagen. Propuesta: 10 % del bruto para plataforma, con el resto dividido transparentemente entre producción/envío, artista y fondo de mantenimiento.

#### F. Comparación con costos de cobro tradicionales

Mercado Pago Argentina publica para link de pago 6,29 % al instante, 4,39 % a 10 días, 3,39 % a 18 días y 1,49 % a 35 días, más IVA según corresponda: [Mercado Pago](https://www.mercadopago.com.ar/herramientas-para-vender/link-de-pago). Stellar cobra fees de red mínimos de 100 stroops por operación; 1 stroop = 0,0000001 XLM, y las transacciones Soroban agregan resource fee variable: [docs Stellar](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering), [glosario](https://developers.stellar.org/docs/learn/glossary). La ventaja de Stellar no es “gratis total”, sino que el costo de red es bajo; **el costo real lo concentran rampa, spread, KYC, soporte y operación**.

---

### 2.2 Clientes, usuarios y mercado

#### Quién usa y quién paga

| Actor | Rol de uso | ¿Paga? | Propuesta de valor |
|---|---|---|---|
| Vecinos y diáspora | Donan, adoptan ladrillos, dejan recuerdos, votan como guardianes | No fee obligatorio; propina opcional | Confianza, pertenencia, memoria verificable, reembolso si fracasa |
| Restauradores/artistas | Ejecutan obra por hitos; luego venden láminas | No; reciben pagos | Pagos transparentes, reputación pública, ingresos posteriores |
| Municipios/ministerios de cultura | Lanzan programas de restauración y participación | Sí: licencia/setup/servicios | Ejecución transparente, reportes, participación vecinal, control sin custodia manual |
| DGE/escuelas | Campañas de murales educativos y memoria escolar | Sí, con precio social/piloto | Proyecto educativo, voluntariado, trazabilidad |
| Fundaciones/ONGs | Curan campañas y aportan legitimidad | Sí o actúan como canal | Tecnología sin desarrollarla, rendición transparente |
| Empresas/RSE | Sponsor, matching, campañas de marca territorial | Sí: sponsor/matching | Impacto medible y visible, narrativa local, reportes |
| Museos/centros culturales | Validan patrimonio, memoria y calidad artística | Potencial cliente/aliado | Archivo de memoria y circuito cultural |

#### Datos de mercado

- Mendoza provincia tiene 2.043.540 habitantes y el departamento Capital 127.160 según la planilla definitiva INDEC del Censo 2022: [c2022_mendoza_est_c1_13.xlsx](https://censo.gob.ar/wp-content/uploads/2023/11/c2022_mendoza_est_c1_13.xlsx). Esto define un mercado piloto suficientemente manejable, no el TAM total.
- La Ciudad ya está pensando en restauración de murales: su relevamiento busca registrar obras/autores y evaluar restauración acordada previamente con autores: [convocatoria oficial](https://prensa.ciudaddemendoza.gob.ar/2024/05/28/la-ciudad-lanza-una-convocatoria-para-autores-de-murales-de-capital/).
- El Programa provincial de Arte Público y Muralismo existía desde 2017 y buscaba impulsar muralismo en distritos culturales: [Gobierno de Mendoza](https://www.mendoza.gov.ar/prensa/programa-provincial-de-arte-publico-y-muralismo/).
- La DGE convoca ColaborArte 2026 con muralistas y voluntarios en escuelas: [mendoza.edu.ar](https://www.mendoza.edu.ar/colaborarte-2026-una-accion-de-voluntariado-solidario/). Es un canal natural para campañas escolares, aunque habría que validar si pueden contratar/pagar tecnología.
- El mercado global de crowdfunding de donación fue estimado por CCAF en USD 7.000 millones en 2020, pero LAC fue solo aprox. USD 15–16 millones y el grueso de las finanzas alternativas regionales fueron modelos empresarios/de crédito: [CCAF 2021, executive summary y figura 5.9](https://www.jbs.cam.ac.uk/wp-content/uploads/2021/06/ccaf-2021-06-report-2nd-global-alternative-finance-benchmarking-study-report.pdf). **No hay datos públicos confiables para el subnicho “murales/patrimonio en Argentina”; no inventamos un TAM.** La venta inicial debe ser bottom-up por instituciones.
- La Fondation du patrimoine de Francia informa que la colecta representa en promedio 10 % del plan de financiamiento de un proyecto y documenta 81.000 donantes en 2025: [fuente](https://www.fondation-patrimoine.org/c/soumettre-un-projet/organiser-une-collecte/233). Esto sugiere que el crowdfunding rara vez reemplaza presupuestos públicos/mecenazgo: los complementa. Es una evidencia europea, no argentina.

#### Posibles primeros clientes/aliados en Mendoza

| Aliado/cliente | Por qué | Link |
|---|---|---|
| Dirección de Cultura, Municipalidad de la Ciudad de Mendoza | Ya relevó murales/autores para evaluar restauraciones; puede aportar pipeline y legitimidad | [convocatoria](https://prensa.ciudaddemendoza.gob.ar/2024/05/28/la-ciudad-lanza-una-convocatoria-para-autores-de-murales-de-capital/) |
| MMAMM | Tiene experiencia específica en restauración de murales y es sede de la hackathon | [restauración “Alegoría de la vida futura”](https://prensa.ciudaddemendoza.gob.ar/2014/11/19/un-recorrido-por-el-mmamm-y-su-fundamental-aporte-a-la-cultura-local/) |
| Secretaría/Dirección de Cultura de la Provincia | Programa provincial de Arte Público y Muralismo | [programa](https://www.mendoza.gov.ar/prensa/programa-provincial-de-arte-publico-y-muralismo/) |
| DGE / ColaborArte | Murales en escuelas, voluntariado y comunidad educativa | [ColaborArte 2026](https://www.mendoza.edu.ar/colaborarte-2026-una-accion-de-voluntariado-solidario/) |
| FLAT + MMAMM + BAF/StarMaker | Comunidad arte-tecnología, validación inicial y puente a Stellar | [hackathon Luma](https://luma.com/starmaker-vkkg), [edición virtual](https://luma.com/starmaker-6d3j) |
| Stellar Argentina Chapter | Canal obligado para Instawards y referidos hacia SCF | [capítulo Argentina](https://stellar.gitbook.io/ambassador-program/chapters/latin-america/argentina-chapter) |
| Emetur/turismo cultural | Murales restaurados como circuito y experiencia turística | [prensa Emetur](https://www.mendoza.gov.ar/prensa/emetur/) |
| Fondo Provincial de la Cultura | Existe un fondo provincial que acepta donaciones; evaluar convenio, no asumir elegibilidad | [Ley 6403](https://www.argentina.gob.ar/normativa/provincial/ley-6403-123456789-0abc-defg-304-6000mvorpyel) |

Nota legal local: Mendoza no tiene una ley de mecenazgo vigente; en 2024 la Legislatura trabajaba en un proyecto y declaró que “hoy no existe algo así más allá del auspicio”: [HCD Mendoza](https://www.hcdmza.gob.ar/site/noticias/9195-avanza-en-diputados-la-redaccion-final-de-una-ley-de-mecenazgo-cultural). Por lo tanto, no conviene basar el modelo en beneficios fiscales de mecenazgo provinciales.

---

### 2.3 Competencia y diferenciación

| Competidor/comparable | Comisión/modelo | Transparencia | Qué nos diferencia |
|---|---|---|---|
| GoFundMe | 0 % plataforma + procesamiento; propinas | Confía en organizador; no hay escrow público por hitos | Nuestro escrow, hitos y reembolso son ejecutables/verificables on-chain |
| Kickstarter | 5 % + procesamiento; todo o nada | Buena para recompensas creativas, no para rendición pública | Pared Viva agrega memoria, guardianes, mantenimiento y control de hitos |
| Spacehive | 7,5 % + procesamiento; matching institucional | Fuerte en proyectos cívicos y fondos de councils | Similar en civic matching, pero sin memoria inalterable, ladrillos ni escrow Soroban |
| Goteo | 5 %; cívico/open source | Cívico y transparente, pero plataforma web2 | Pared Viva ejecuta reglas en contrato y arma archivo de memoria vinculado a cada aporte |
| Hispania Nostra | 7,5–10 %; patrimonio | Especialización patrimonial e intermediación | Nosotros somos muralismo urbano argentino + memoria comunitaria + escrow programable |
| Fondation du patrimoine | 6 % de gastos de gestión para proyectos públicos/asociativos y 5 % para propietarios privados según [condiciones oficiales](https://www.fondation-patrimoine.org/c/conditions-relatives-dons/101); acompañamiento patrimonial | Institución fuerte, pero no plataforma abierta de escrow | Modelo de infraestructura replicable para municipios, no solo fundación central |
| Giveth | 0 %; donaciones directas wallet-to-wallet | Transacciones públicas, pero no hitos ni reembolso por campaña | Pared Viva agrega escrow, hitos 2/3, reembolso, memoria y continuidad |
| Gitcoin | No retiene fondos; quadratic funding/matching pools | Muy transparente en public goods Web3 | Gitcoin financia bienes públicos digitales; Pared Viva restaura activos físicos barriales |
| DonarOnline | 3,5 % por transacción + plan fijo + pasarela | SaaS serio para ONGs argentinas, con CRM/recurrencia | Pared Viva agrega escrow programable, hitos y memoria de territorio; aprende de su modelo SaaS |
| Vaki | 6 % + pasarela; categoría social puede devolver tasa plataforma | Fuerte en recaudo social LatAm y métodos locales | Pared Viva se especializa en restauración/patrimonio con control de ejecución, no solo recaudo |
| Cafecito | Microdonaciones argentinas; comisiones/costos se informan durante el pago, porcentaje público actual no verificado | Simple para creadores/ONGs | Pared Viva no es propina genérica: presupuesto, hitos, memoria y control comunitario |
| Ideame | 5–10 % histórico | Plataforma creativa LatAm | Pared Viva usa todo-o-nada con reembolso automatizado y rendición programable |

**Diferenciación central en una frase:** no vendemos “donaciones cripto”; vendemos **confianza operativa y memoria permanente para restaurar activos físicos del barrio**.

---

### 2.4 Financiamiento del ecosistema Stellar

#### Programa prioritario: Instaward vía Capítulo Argentina

La hackathon es “Bootcamp & Hackathon BAF × Stellar | FLAT 2026 - Mendoza”, híbrida, en el MMAMM, con el reto de construir una app funcional en Stellar probada por alguien externo; los mejores proyectos siguen con BAF y caminos como Instawards y SCF: [Luma presencial](https://luma.com/starmaker-vkkg), [Luma virtual](https://luma.com/starmaker-6d3j).

**Por qué aplicar primero a Instaward:**

- Está diseñado para ejecución temprana en sprints de 30 días.
- No hay aplicación abierta: empieza por participación activa en el capítulo local.
- La revisión suele ser de 3–5 días hábiles según reglas.
- Monto inicial típico USD 1.000–5.000 en XLM; con follow-ons puede agregar hasta USD 15.000: [reglas](https://stellar.gitbook.io/scf-handbook/scf-awards/instawards/official-rules).
- El Capítulo Argentina está identificado y tiene Chapter Lead: [Argentina Chapter](https://stellar.gitbook.io/ambassador-program/chapters/latin-america/argentina-chapter).
- Hay precedente reciente de proyectos del Argentina Builder Challenge con Instaward aprobado en menos de un mes según el ecosistema: [blog Stellar sept/oct 2026](https://stellar.org/blog/ecosystem/stellar-ambassador-program-september-october-2026).

**Scope sugerido de 30 días:** piloto controlado en testnet pública con una campaña equivalente a 1.000 USDC, 10 donantes externos, restaurador/firmantes reales, panel de impacto, documentación de rampa ARS y plan/presupuesto explícito para mainnet solo después de revisión de seguridad. No pedir dinero para “investigar”, sino para ejecutar.

#### Segundo paso: SCF Build

SCF Build ofrece hasta USD 150.000 en XLM, milestone-based, típicamente 3–6 meses, con tracks Open/Integration/RFP, formulario en communityfund.stellar.org, KYC/KYB, roadmap técnico, presupuesto por tramos y posibilidad de Audit Bank: [Build Award](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award), [grants overview](https://stellar.org/grants-and-funding). Se paga en cuatro tramos de 10/20/30/40 % según el [FAQ del handbook](https://stellar.gitbook.io/scf-handbook/additional-support/faq); conviene confirmarlo al aplicar.

**Encaje recomendado:** Integration Track si integramos Vesseo/MoneyGram/anchors existentes y tooling de Stellar; Open Track si el aporte principal es el protocolo de crowdfunding/memoria. Referral del capítulo/BAF mejora la señal.

#### Otros caminos

- **Marketing Grants:** hasta USD 500.000 para crecimiento/adquisición, pero exigen proyecto con tracción y capacidad de ejecutar campañas medibles; no es primera puerta: [marketing grants](https://stellar.org/grants-and-funding/marketing-grants).
- **Matching Fund / Enterprise Fund:** inversión, no grant; solo si se decide constituir empresa y levantar capital.
- **Stellar Disbursement Platform:** no es financiamiento, pero puede ser socio técnico para pagos masivos a restauradores/artistas/cuidadores con wallets creadas por SMS: [producto](https://stellar.org/products-and-tools/disbursement-platform).

---

### 2.5 On/off ramp en Argentina

#### Rutas posibles

| Ruta | Cómo funciona | Costos/fricción verificados | Evaluación |
|---|---|---|---|
| Vesseo | Wallet no custodial Stellar/USDC, enfocada en Argentina; rebrand de Vibrant | El sitio dice cash in/out en 16 países y MoneyGram con “zero fees”; su blog afirma retiro/depósito en pesos en miles de puntos de Argentina. Validar fees finales y spread en una operación real: [Vesseo cash](https://vesseoapp.com/es/blog-ar/con-vesseo-trae-tus-fondos-y-convertirlos-en-efectivo-en-argentina), [case study Stellar](https://stellar.org/case-studies/vesseo) | Mejor UX para vecino no experto si funciona en Mendoza |
| MoneyGram Ramps | Cash-in/out de USDC Stellar en locales participantes; wallet inicia referencia y el usuario presenta ID | Comisiones varían por local/monto; la red dice 170+ países para integración, pero eso no implica cobertura uniforme: [MoneyGram Ramps](https://xramps.moneygram.com/es/stellar/), [guía USDC](https://www.usdc.com/learn/how-to-buy-usdc-moneygram) | Crítico para efectivo; requiere prueba física en Mendoza |
| Anclap | Anchor argentino que emite ARS digital 1:1 en Stellar, SEP-6/24, KYC | API viva consultada: depósito ARS min 11/max 500.000, fee fijo 10 + 1 %; retiro fee fijo 10 + 2 %: [stellar.toml](https://api.anclap.com/.well-known/stellar.toml), [transfer24/info](https://api.anclap.com/transfer24/info) | Buena rampa bancaria ARS, pero entra/sale en ARS token; hay que convertir a USDC y asumir spread/liquidez |
| Lemon | Exchange/app argentina; integró Stellar para USDC en 2023 | La ayuda advierte memo obligatorio y costos de retiro informados antes de confirmar: [integración](https://lemon.me/blog/alianza-stellar), [ayuda redes](https://help.lemon.me/es/articles/5579116-que-red-selecciono-para-recibir-crypto) | Buena para usuarios ya bancarizados/cripto; fricción de memo y retiro |
| Ripio | Wallet/exchange argentina; soporta USDC por red Stellar | Ayuda lista USDC en red Stellar; comisión de red informada al enviar: [redes Ripio](https://help-ar.ripio.com/space/HC/1524301898/%C2%BFQu%C3%A9%20red%20utilizar%20para%20realizar%20env%C3%ADos%20y%20recepciones%20de%20criptomonedas%20dentro%20de%20la%20Wallet%3F), [Ripio/Stellar](https://launchpad.ripio.com/novedades/stellar-un-agregado-estelar-a-la-oferta-multichain-de-ripio) | Similar a Lemon; prueba de retiro necesaria |
| Circle Mint | Empresas depositan por wire y mintean/redeem USDC Stellar | Producto business; no es solución para vecino minorista: [USDC on Stellar](https://www.circle.com/multi-chain-usdc/stellar) | Útil para tesorería/instituciones, no onboarding masivo |
| Mercado Pago/cards | Cobro fiat tradicional | 1,49–6,29 % + IVA según liquidación: [link de pago](https://www.mercadopago.com.ar/herramientas-para-vender/link-de-pago) | Simple pero no entra al escrow Stellar sin una capa de custodia/conversión; rompe trazabilidad si se hace manual |

#### Flujo recomendado para el vecino sin cripto (post-MVP)

1. Elegir ladrillo y monto en pesos equivalentes, pero donar en USDC.
2. Onboarding con Vesseo o MoneyGram cash-in; para banco/digital, evaluar Anclap/Lemon/Ripio.
3. La wallet debe crear/financiar la cuenta, trustline de USDC y firma con passkey/Freighter cuando sea posible.
4. Donación directa al contrato; el evento pinta el ladrillo.
5. Si la campaña falla, el reembolso vuelve en USDC; el usuario puede salir por la misma rampa.

#### Cómo cobra el restaurador en pesos

- Recibe hitos en USDC desde el contrato.
- Opciones: (a) vender/retirar por Lemon/Ripio a banco, (b) cash-out en MoneyGram/Vesseo, (c) convertir USDC→ARS de Anclap y retirar a CBU/CVU, sujeto a 2 % + ARS 10 y KYC, o (d) acuerdo institucional con tesorería que lo compense en pesos mientras la institución custodia USDC.
- Para operación real hay que documentar facturación, retenciones, monotributo/IVA si corresponde y trazabilidad de pagos. No verificado: costo final total en Mendoza, porque depende de spread, líquido y proveedor en el momento.

---

### 2.6 Métricas de impacto recomendadas

**Activación y confianza**

- Donantes únicos por campaña y % de donantes externos al equipo.
- Mediana de donación y distribución (evitar que 1 donante grande “financie solo”).
- % de campañas que alcanzan meta antes del vencimiento.
- % de donaciones reembolsadas correctamente en campañas fallidas.
- Tiempo desde meta alcanzada hasta liberación del primer hito.

**Ejecución y transparencia**

- % de fondos liberados por hitos vs fondos retenidos.
- Número de aprobaciones 2/3 y tiempo de respuesta de firmantes.
- Costo total por campaña: plataforma, rampa, producción, administración.
- % de presupuesto efectivamente pagado al restaurador/proveedores vs meta.
- Excedente enviado al fondo de mantenimiento.

**Memoria y comunidad**

- Recuerdos archivados con CID válido y disponibilidad IPFS.
- % de ladrillos con recuerdo vs solo donación.
- Visitas al archivo/QR físico por mes.
- Guardianes activos que votan la próxima pared.
- Nuevas paredes propuestas por la comunidad.

**Sostenibilidad**

- Ingresos por cliente institucional, sponsor, merch y tips; margen por campaña.
- Costo de adquisición por campaña institucional.
- % de ingresos recurrentes (licencias) vs one-off.
- Volumen total movilizado y contraparte institucional/matching por cada USDC vecinal.

---

## 3. Modelo de negocio recomendado

### 3.1 Elección

**Modelo principal:** servicios B2G/B2B de campañas llave en mano, con transición a licencia anual cuando haya repetición. Incluye implementación técnica, configuración de campaña, onboarding de firmantes/restaurador, soporte, moderación básica, reporte de impacto y documentación de transparencia.

**Secundario 1:** sponsors/matching por pared, separando matching para campaña y fee de gestión para Pared Viva.

**Secundario 2:** fee del 10 % sobre venta bruta de láminas/merch en fase 2.

**Experimental, no pilar:** propina opcional del donante.

### 3.2 Por qué descartamos otros como modelo principal

| Alternativa | Pro | Contra decisiva | Decisión |
|---|---|---|---|
| 5–7,5 % sobre donaciones | Simple y comparable | 50–250 USDC por campaña chica; contradice “todo al mural”; no paga operación | Descartada como principal; solo success fee facturado a institución |
| Propina voluntaria | Mantiene 100 % al mural | Incierta, fricción UX, difícil de proyectar en Argentina | Experimental, máximo 1,5–2,5 % efectivo en supuestos |
| SaaS puro self-service | Escalable | Municipio/ONG no quiere operar blockchain solo al inicio; ciclo de venta largo | Primero servicio, después licencia |
| Sponsors solos | Alto encaje local | Demanda comercial constante y episódica | Secundario |
| Merch solo | Alineado al universo del proyecto | Volúmenes inciertos, producción/logística/derechos | Secundario fase 2 |
| Grants permanentes | No diluyen | No son ingreso recurrente ni controlable | Puente, no modelo |

### 3.3 Tabla de precios propuesta

**Son precios propuestos, no benchmarks de mercado.** Validar con 3–5 clientes piloto.

| Producto | Precio propuesto | Quién paga | Incluye | Notas de transparencia |
|---|---:|---|---|---|
| Piloto institucional | USD 1.500 fijo + 5 % de lo recaudado, facturado al cliente | Municipio/ONG/escuela/empresa | 1 campaña hasta 5.000 USDC, setup, onboarding, reporte | El 5 % no se descuenta del escrow vecinal |
| Campaña estándar | USD 3.000 fijo + 5 % success fee | Institución | Hasta 10.000 USDC, acompañamiento, reportes, soporte | Si no hay éxito, cobrar solo fijo o acordar reducción |
| Licencia anual | USD 6.000/año hasta 4 campañas + USD 2.000 onboarding inicial | Municipio/fundación/empresa | Panel, soporte, plantillas, reportes consolidados | Cuesta menos que 4 campañas sueltas; incentiva repetición |
| Sponsor pared | USD 1.000–3.000 por paquete | Empresa/RSE | Matching visible + marca en web/reporte + métricas | Propuesta de split contable: 70 % a campaña, 30 % servicio; publicar ambos |
| Láminas/merch | 10 % del bruto para Pared Viva | Comprador dentro del precio | Checkout, split, reporte | Producción/envío y split artista/fondo separados |
| Propina plataforma | Sugerida 5 %, editable a 0 | Donante | Infraestructura y soporte | Treasury separada; no cuenta para meta |

“0 % de fee de plataforma” no significa costo total cero para el usuario: la red Stellar, el spread y las rampas/pasarelas pueden cobrar aparte. La UX debe mostrar el costo total estimado antes de confirmar y distinguir fee de Pared Viva, costo de red y costo del proveedor de rampa.

### 3.4 Business Model Canvas en texto

- **Segmentos:** municipios y programas de cultura; DGE/escuelas; museos/centros culturales; fundaciones/ONGs; empresas con RSE; usuarios finales vecinos/diáspora/artistas/restauradores.
- **Propuesta de valor:** campañas de restauración con escrow público, hitos 2/3, reembolso automático, archivo de memoria en IPFS, mantenimiento posterior y reportes de impacto verificables.
- **Canales:** hackathon/BAF/Stellar Chapter; Dirección de Cultura/MMAMM; DGE; QR en paredes; prensa local; referidos de artistas y fundaciones.
- **Relación:** servicio asistido en pilotos; cuenta dedicada para instituciones; comunidad de guardianes para usuarios; reportes públicos para confianza.
- **Ingresos:** fees fijos y success fees institucionales, licencias anuales, servicios de sponsor/matching, 10 % merch; propinas opcionales experimentales.
- **Recursos clave:** contratos Soroban auditados, frontend/mural, pipeline de murales y autores, relaciones institucionales, archivo IPFS, red de restauradores/firmantes.
- **Actividades clave:** curaduría y due diligence de muros/autores, configuración de campañas, soporte de donantes/rampas, moderación, operación de hitos, reportes, ventas institucionales.
- **Socios clave:** Dirección de Cultura, MMAMM, DGE, BAF/StarMaker/Stellar Chapter, Vesseo/Lemon/Ripio/Anclap/MoneyGram, Pinata/IPFS, restauradores, fundaciones y empresas sponsor.
- **Costos clave:** desarrollo y seguridad, legal/contable/compliance, operación comunitaria/moderación, soporte de rampas, infraestructura, ventas y producción de reportes.

### 3.5 Proyección simple de ingresos y costos

**Moneda:** USD nominal. **No son precios de mercado verificados:** son supuestos de gestión. “GMV” = donaciones movilizadas en campañas. El fee de sponsor se cuenta solo como porción de servicio, no el matching que entra a campaña. Grants no se cuentan como ingreso operativo.

#### Supuestos de ingreso

- Success fee: 5 % del GMV, facturado al cliente institucional fuera del escrow.
- Sponsor service: USD 300/campaña patrocinada en año 1 y USD 400–500 en año 3.
- Merch: 10 % del bruto.
- Propina efectiva: 1,5 % pesimista, 2 % base, 2,5 % optimista del GMV.
- Una licencia anual de USD 6.000 cubre hasta 4 campañas.

#### Año 1 — post-hackathon/pilotos

| Escenario | Campañas | GMV prom. | Fee fijo/licencias | Success 5 % | Sponsor service | Merch 10 % | Tips efectivos | Ingresos | Costos | Neto antes de grants |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Pesimista | 2 | 2.000 | 3.000 | 200 | 300 | 50 | 60 | **3.610** | **8.000** | **-4.390** |
| Base | 4 | 3.000 | 9.000 | 600 | 900 | 200 | 240 | **10.940** | **16.500** | **-5.560** |
| Optimista | 8 | 4.000 | 20.000 | 1.600 | 1.500 | 500 | 800 | **24.400** | **22.000** | **+2.400** |

**Detalle del base año 1:** los USD 9.000 fijos suponen dos pilotos × USD 1.500 más dos campañas estándar × USD 3.000. El sponsor service supone 3 campañas patrocinadas × USD 300.

**Lectura:** incluso el optimista es frágil. El año 1 necesita grants, trabajo fundador no remunerado o un anchor institucional grande.

#### Año 3 — operación escalada

| Escenario | Campañas | GMV prom. | Fee fijo/licencias | Success 5 % | Sponsor service | Merch 10 % | Tips efectivos | Ingresos | Costos | Neto antes de grants |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Pesimista | 8 | 2.500 | 16.000 | 1.000 | 1.600 | 400 | 300 | **19.300** | **35.000** | **-15.700** |
| Base | 30 | 3.500 | 63.000 | 5.250 | 6.000 | 2.000 | 2.100 | **78.350** | **72.000** | **+6.350** |
| Optimista | 60 | 5.000 | 144.000 | 15.000 | 18.000 | 6.000 | 7.500 | **190.500** | **135.000** | **+55.500** |

**Detalle del base año 3:** 3 licencias × USD 6.000 = USD 18.000 cubriendo 12 campañas; 18 campañas standalone × USD 2.500 = USD 45.000; total fijo/licencias USD 63.000. Equilibrio apenas positivo: el negocio necesita repetición institucional, no solo más donantes.

#### Costos base estimados

| Rubro | Año 1 base | Año 3 base | Comentario |
|---|---:|---:|---|
| Desarrollo/producto/integraciones | 8.000 | 42.000 | Año 3 equivale aprox. 1–1,5 FTE lean/contractors |
| Legal/contable/compliance | 3.000 | 8.000 | No incluye litigios ni estructuras complejas |
| Operación comunidad/moderación/soporte | 2.000 | 8.000 | Incluye onboarding de campañas |
| Infraestructura/herramientas | 1.000 | 5.000 | RPC, hosting, Pinata, analytics, tooling |
| Seguridad/auditoría/renovación | 1.500 | 5.000 | Supone ayuda de Audit Bank; una auditoría completa puede costar más, no verificado |
| Ventas/administración | 1.000 | 4.000 | Materiales, reuniones, propuestas |
| **Total** | **16.500** | **72.000** | Muy lean; no incluye salarios completos de mercado de 3 fundadores |

### 3.6 Riesgos del modelo y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Las campañas barriales son chicas y el fee no cubre costos | Modelo inviable | B2G/B2B con licencias; no depender de rake de donaciones |
| Ciclos de venta municipales largos | Falta de cash | Sponsors/ONGs como entrada; piloto de bajo costo; Instaward puente |
| Rampa ARS cara o compleja | Baja conversión | Probar Vesseo/MoneyGram/Lemon/Ripio en Mendoza; mostrar costo total antes de donar; permitir donación institucional por match |
| Regulación/KYC/impuestos | Bloqueo operativo | Revisión legal antes de mainnet; separar donación sin retorno de inversión; documentar fees y facturación |
| Los contratos tienen bug o claves comprometidas | Pérdida de fondos/reputación | Auditoría, multisig/firmantes, límites de piloto, procedimiento de incidente |
| Reputación por contenido inapropiado en recuerdos | Riesgo legal/social | Moderación frontend, términos claros, no datos sensibles, proceso de retiro de display aunque CID exista |
| Dependencia de grants | Incertidumbre | Grants solo para hitos técnicos; ingresos B2G/B2B desde piloto 1 |
| Derechos de imagen del mural y láminas | No se puede vender merch | Contrato con autor/herederos/propietario; licencia explícita para reproducción |
| Competencia web2 más simple | Menor adopción | No competir en “donar fácil” solamente: vender escrow verificable + memoria + continuidad |

---

## 4. Recomendaciones concretas priorizadas

### Alta

| Prioridad | Acción | Responsable | Esfuerzo |
|---|---|---|---|
| Alta | En el pitch, presentar el modelo principal como **campañas llave en mano B2G/B2B**, con donaciones vecinales a 0 % obligatorio; no prometer que la comisión minorista sostiene el proyecto. | Todo el equipo | S |
| Alta | Mantener la demo en testnet y no implementar fees ni rampas reales; mostrar meta 1.000 USDC, hitos 40/30/30, reembolso, excedente y guardianes. | A + B | S |
| Alta | Conseguir una reunión/carta de interés con Dirección de Cultura/MMAMM usando el relevamiento de murales como anzuelo. | C + todo el equipo | M |
| Alta | Definir y ejecutar un sprint de 30 días para pedir Instaward vía Capítulo Argentina; incluir pilot, 10 usuarios externos, reporte de impacto y prueba de rampa. | Todo el equipo | M |
| Alta | Hacer una prueba real pequeña de on/off ramp en Mendoza con Vesseo/MoneyGram y otra con Lemon o Ripio; registrar costo total, tiempo, KYC, memo y errores. | B | M |
| Alta | Antes de mainnet con dinero real, consultar abogado/contador sobre donaciones, USDC, facturación, protección de datos, derechos de imagen y contrato con restaurador. | Todo el equipo + asesor externo | M |
| Alta | Construir un dashboard mínimo de impacto: donantes únicos, % liberado, hitos, recuerdos, reembolsos, excedente. | B + C | M |

### Media

| Prioridad | Acción | Responsable | Esfuerzo |
|---|---|---|---|
| Media | Diseñar un one-pager comercial para municipio/empresa con paquetes USD 1.500/3.000/6.000 y ejemplos de reporte. | C | S |
| Media | Crear paquete sponsor de USD 1.000–3.000 con separación explícita matching/servicio. | C + todo el equipo | M |
| Media | Diseñar la fase 2 de merch con split producción/artista/fondo/plataforma y licencia de imagen antes de vender. | A + C | M |
| Media | Preparar aplicación SCF Build solo después de evidencia del piloto e Instaward; usar referral del capítulo/BAF. | Todo el equipo | M |
| Media | Incorporar renovación de TTL, monitoreo y runbook operativo antes de mainnet. | A | M |
| Media | Evaluar Stellar Disbursement Platform para pagar restauradores/artistas en campañas grandes o multi-muro. | B | M |

### Baja

| Prioridad | Acción | Responsable | Esfuerzo |
|---|---|---|---|
| Baja | Convertir el servicio en SaaS self-service solo cuando haya al menos 5–10 campañas repetidas y soporte documentado. | A + B | L |
| Baja | Implementar aportes recurrentes de cuidadores con approve/transfer_from y keeper. | A + B | L |
| Baja | Medir impacto con taxonomía formal tipo IRIS/SDG si entran fundaciones grandes. | C | M |
| Baja | Explorar alianzas de turismo/circuitos de murales una vez restauradas las primeras paredes. | C | M |

---

## 5. Frase de negocio para el pitch

### 10 segundos

“Pared Viva vende infraestructura transparente para que municipios, empresas y comunidades restauren murales: los vecinos donan sin comisión obligatoria y las instituciones pagan por campañas verificables.”

### 30 segundos

“Nuestro negocio no es quedarnos con la donación del vecino. El vecino dona a un escrow público, con reembolso si la campaña fracasa y hitos aprobados 2 de 3. Pared Viva cobra a municipios, fundaciones y empresas por implementar y operar campañas llave en mano, con reportes de impacto; además suma sponsors por pared y un pequeño fee sobre láminas. Así mantenemos la promesa de transparencia y evitamos depender de comisiones de campañas de apenas 1.000 a 5.000 dólares.”

### 60 segundos

“El crowdfunding tradicional cobra entre 5 y 10 %, pero en una colecta barrial eso no alcanza para operar y encima reduce la plata del mural. Por eso Pared Viva separa dos cosas: la donación vecinal va completa a un contrato público, y la operación la paga quien se beneficia institucionalmente. Un municipio, una escuela, una fundación o una empresa contrata la campaña llave en mano: configuración, firmantes, restaurador, soporte, moderación y reporte verificable. Si una empresa quiere visibilidad, puede hacer matching y patrocinar la pared con una parte claramente separada para operación. Después, las láminas generan ingresos para el artista, el fondo de mantenimiento y la plataforma. En el corto plazo buscamos un Instaward de Stellar para ejecutar el primer piloto y luego un SCF Build para endurecer seguridad, rampas e integraciones. La sostenibilidad real viene de repetir campañas institucionales, no de vivir de retener donaciones chicas.”

---

## 6. Preguntas abiertas para decidir

1. **Forma legal:** ¿asociación civil, empresa híbrida, cooperativa o fiscal sponsor? ¿Quién factura los servicios institucionales?
2. **Custodia y responsabilidad:** ¿quién administra claves de despliegue, treasury, firmantes y fondos de mantenimiento? ¿Qué pasa si un firmante desaparece?
3. **Aceptación municipal:** ¿un municipio mendocino puede pagar un servicio relacionado con USDC/cripto? ¿Exige pagar en pesos, proveedor local registrado o licitación?
4. **Regulación CNV:** la regulación de financiamiento colectivo se orienta a inversores/valores negociables y excluye financiamiento que no involucre valores negociables ([Resolución CNV 1125/2026, art. 144](https://www.argentina.gob.ar/normativa/nacional/norma-424560/texto)); confirmar con abogado que donación + voto no financiero + lámina no configura inversión.
5. **Rampa:** ¿cuál es el costo total real de convertir ARS→USDC→ARS en Mendoza hoy, incluyendo spread, comisión de retiro, tiempo y límites?
6. **Propina:** ¿el donante argentino acepta una propina opcional en una colecta barrial o la percibe como fee encubierto?
7. **Derechos:** ¿cómo se obtiene permiso del autor/propietario para restaurar, fotografiar, tokenizar CID y vender láminas?
8. **Moderación:** ¿quién decide ocultar recuerdos inapropiados y bajo qué procedimiento, si el CID queda público?
9. **Gobernanza de guardianes:** ¿un voto por guardián puede ser capturado por alguien que hace muchas donaciones mínimas desde varias wallets? ¿Importa o es aceptable?
10. **Precio institucional:** ¿USD 1.500 por piloto es accesible para una escuela/municipio chico o debe existir un plan subsidiado por sponsor?
11. **Fondo de mantenimiento:** ¿quién lo gobierna y cuándo puede gastarse? ¿Es parte del producto comercial o solo del impacto?
12. **Salida del excedente:** ¿el fondo queda en USDC, se convierte a ARS al recibirse o se usa solo para la próxima campaña?

---

## 7. Fuentes principales consultadas

- GoFundMe pricing/help: https://www.gofundme.com/c/pricing y https://support.gofundme.com/hc/en-us/articles/203604424-Learn-about-GoFundMe-fees
- Kickstarter fees: https://www.kickstarter.com/help/fees
- Spacehive fees/funds: https://help.spacehive.com/en/articles/10599548-what-are-the-fees-for-using-spacehive y https://about.spacehive.com/funds/
- Goteo términos: https://widget.goteo.org/legal/terms?currency=EUR
- Hispania Nostra crowdfunding patrimonio: https://crowdfunding.hispanianostra.org/faq?user-lang=EN
- Giveth zero fees: https://docs.giveth.io/zero-fees
- Gitcoin Grants: https://gitcoin.co/program
- ioby cierre: https://ioby.org/resources/closing/
- CCAF Global Alternative Finance 2021: https://www.jbs.cam.ac.uk/wp-content/uploads/2021/06/ccaf-2021-06-report-2nd-global-alternative-finance-benchmarking-study-report.pdf
- INDEC/Censo Mendoza: https://censo.gob.ar/index.php/datos_definitivos_mendoza/ y https://censo.gob.ar/wp-content/uploads/2023/11/c2022_mendoza_est_c1_13.xlsx
- Relevamiento de murales Ciudad de Mendoza: https://prensa.ciudaddemendoza.gob.ar/2024/05/28/la-ciudad-lanza-una-convocatoria-para-autores-de-murales-de-capital/
- Programa provincial Arte Público y Muralismo: https://www.mendoza.gov.ar/prensa/programa-provincial-de-arte-publico-y-muralismo/
- ColaborArte DGE: https://www.mendoza.edu.ar/colaborarte-2026-una-accion-de-voluntariado-solidario/
- Hackathon: https://luma.com/starmaker-vkkg y https://luma.com/starmaker-6d3j
- Instawards: https://stellar.gitbook.io/scf-handbook/scf-awards/instawards/official-rules
- SCF Build: https://stellar.gitbook.io/scf-handbook/scf-awards/build-award
- Anclap: https://api.anclap.com/.well-known/stellar.toml y https://api.anclap.com/transfer24/info
- Vesseo/MoneyGram: https://vesseoapp.com/es/blog-ar/con-vesseo-trae-tus-fondos-y-convertirlos-en-efectivo-en-argentina y https://xramps.moneygram.com/es/stellar/
- USDC en Stellar: https://www.circle.com/multi-chain-usdc/stellar
- Fees Stellar: https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering
- Mercado Pago link de pago: https://www.mercadopago.com.ar/herramientas-para-vender/link-de-pago
- Fondation du patrimoine: https://www.fondation-patrimoine.org/c/soumettre-un-projet/organiser-une-collecte/233 y https://www.fondation-patrimoine.org/c/conditions-relatives-dons/101
- Ley 6403 Mendoza: https://www.argentina.gob.ar/normativa/provincial/ley-6403-123456789-0abc-defg-304-6000mvorpyel
- Resolución CNV 1125/2026: https://www.argentina.gob.ar/normativa/nacional/norma-424560/texto
- DonarOnline pricing: https://donaronline.org/pricing y https://soporte.donaronline.org/es/articles/9888686-suscripcion-a-uno-de-nuestros-planes
- Vaki costos: https://help.vaki.co/es/articles/9181108-costos-de-vaki-planifica-y-optimiza-tu-recaudo
