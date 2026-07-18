# Requirements Document

## Introduction

Esta feature ("Guías VIP enriquecidas + Planner editable con PDF") mejora la sección VIP de la PWA (`/pwa/vip`) con dos objetivos de negocio orientados a aumentar el valor percibido por quien pagó el Acceso VIP y reducir el riesgo de reembolso:

- **Objetivo 1 — Guías VIP enriquecidas.** Llevar las 10 guías VIP actuales (`lib/pwa/vip-content.ts`) al nivel de profundidad, longitud y calidad de los bonos TURBO (`lib/pwa/bonus-guides.ts`). Esto exige un cambio aditivo y retrocompatible al tipo `VipGuide` (campo opcional `sources`), un ajuste menor del renderer compartido (`app/pwa/vip/guia/[slug]`) y, sobre todo, contenido notablemente más largo y completo con criterios objetivos de longitud por categoría.
- **Objetivo 2 — Planner editable con PDF.** Transformar el planner de solo lectura (`app/pwa/vip/planner/page.tsx`) en una planilla rellenable (8 filas × 7 días), con autoguardado en `localStorage` mientras se escribe, persistencia al recargar/reentrar, y un botón que descarga directamente un PDF en blanco (plantilla vacía, sin los datos del usuario) usando una librería liviana client-side, sin pasar por el diálogo de impresión del navegador.

Este documento deriva los requisitos a partir del `design.md` aprobado, que es la fuente de verdad. Donde el diseño dejaba abierta una opción (enfoque del PDF), se fija la decisión confirmada por el usuario: descarga directa de archivo `.pdf` con librería client-side (enfoque jsPDF), descartando el diálogo de impresión.

## Glossary

- **VIP_Content**: Módulo de datos `lib/pwa/vip-content.ts` que define el tipo `VipGuide` y el arreglo `VIP_GUIDES`, junto con los selectores `getVipGuide(slug)` y `getVipGuidesByCategory()`.
- **VipGuide**: Tipo de datos de una guía VIP (slug, category, emoji, title, intro, sections, closing, cta opcional y `sources` opcional).
- **VipSource**: Fuente citada al pie de una guía, con forma `{ label: string; url: string }`, estructuralmente idéntica a `BonusSource` y `GuideSource`.
- **VIP_Renderer**: Renderer compartido de página de guía en `app/pwa/vip/guia/[slug]/page.tsx`.
- **GuideSources_Component**: Componente reutilizado `components/pwa/guias/GuideSources.tsx` que renderiza la lista de fuentes.
- **VIP_Hub**: Página `/pwa/vip` que lista las guías por categoría mediante tarjetas (cards).
- **TURBO_Benchmark**: Profundidad y estructura de los bonos TURBO (`lib/pwa/bonus-guides.ts`) usada como vara de medición de calidad para las guías VIP.
- **Planner_Page**: Componente cliente de página `app/pwa/vip/planner/page.tsx` que orquesta estado, hidratación, autoguardado, render del grid y acciones.
- **Planner_Grid**: La tabla editable de 8 filas (`PLANNER_ROWS`) × 7 días (`PLANNER_DAYS`) de inputs controlados.
- **Planner_State**: Módulo nuevo `lib/pwa/planner-state.ts` con tipos, constantes (`PLANNER_DAYS`, `PLANNER_ROWS`), y helpers puros server-safe (`createEmptyPlanner`, `loadPlannerFromStorage`, `savePlannerToStorage`, `setCell`, `clearPlanner`).
- **PlannerData**: `Record<PlannerRowKey, string[]>` donde cada arreglo tiene exactamente 7 strings (uno por día).
- **PlannerStored**: Envoltura persistida `{ version: 1; data: PlannerData; updatedAt: string }`.
- **Planner_Storage_Key**: Clave centralizada `STORAGE_KEYS.vipPlanner` con valor `'pwa_vip_planner'` en `lib/constants.ts`.
- **PDF_Generator**: Módulo nuevo client-only `lib/pwa/planner-pdf.ts` con la función `generateBlankPlannerPdf()`.
- **Blank_PDF**: Archivo PDF de plantilla en blanco (encabezado de los 7 días + columna de labels de filas + celdas de datos vacías), sin datos del usuario.
- **SSR**: Renderizado del lado del servidor de Next.js, donde `window` y `localStorage` no existen.
- **Debounce_Interval**: Retardo de autoguardado de 400 ms tras la última pulsación de tecla.

## Requirements

### Requirement 1: Ampliación retrocompatible del tipo de datos de guías

**User Story:** Como desarrollador del contenido VIP, quiero ampliar el tipo `VipGuide` con un campo de fuentes opcional, para poder respaldar afirmaciones de salud sin romper las guías existentes.

#### Acceptance Criteria

1. THE VIP_Content SHALL define el tipo VipSource con un campo `label` de tipo string no vacío (longitud de 1 a 200 caracteres) y un campo `url` de tipo string no vacío (longitud de 1 a 2048 caracteres).
2. THE VIP_Content SHALL extender el tipo VipGuide con un campo opcional `sources` de tipo arreglo de VipSource, con un máximo de 50 elementos, ubicado al final del tipo.
3. WHERE una guía existente no define el campo `sources`, THE VIP_Content SHALL mantener su forma de datos válida sin requerir cambios en esa guía.
4. WHERE una guía define el campo `sources` como un arreglo vacío, THE VIP_Content SHALL tratar la guía como válida y equivalente en estructura a una guía sin el campo `sources`.
5. THE VipSource SHALL ser estructuralmente compatible con el tipo GuideSource que recibe el GuideSources_Component, exponiendo los mismos campos requeridos sin requerir conversiones de tipo.

### Requirement 2: Renderizado condicional de fuentes en la guía

**User Story:** Como usuario VIP, quiero ver las fuentes que respaldan una guía cuando existan, para confiar en la información de salud que leo.

#### Acceptance Criteria

1. WHEN el VIP_Renderer muestra una guía cuyo campo `sources` contiene al menos una fuente válida, THE VIP_Renderer SHALL renderizar el GuideSources_Component incluyendo únicamente las fuentes válidas, hasta un máximo de 50, preservando el orden en que aparecen dentro del campo `sources`.
2. IF el campo `sources` de la guía es indefinido, es una colección vacía, o no contiene ninguna fuente válida —entendiendo por fuente válida aquella cuyo `label`, tras recortar espacios en blanco al inicio y al final, tiene una longitud de entre 1 y 200 caracteres, y cuyo `url`, evaluado sin distinción entre mayúsculas y minúsculas, comienza con `http://` o `https://`—, THEN THE VIP_Renderer SHALL omitir por completo el GuideSources_Component, sin renderizar su encabezado ni su contenedor.
3. IF una guía contiene simultáneamente fuentes válidas e inválidas, THEN THE VIP_Renderer SHALL renderizar únicamente las fuentes válidas y descartar las inválidas sin interrumpir ni alterar el renderizado del resto de la guía.
4. WHEN el VIP_Renderer renderiza el GuideSources_Component, THE VIP_Renderer SHALL ubicarlo como última sección de la guía, preservando el orden y el estilo de las secciones existentes.
5. WHEN el VIP_Renderer renderiza una guía, THE VIP_Renderer SHALL conservar la identidad visual VIP existente (badge dorado / corona).

### Requirement 3: Profundidad y longitud objetivo de las guías por categoría

**User Story:** Como cliente que pagó el Acceso VIP, quiero que las guías sean notablemente más largas y completas que las versiones cortas anteriores, para sentir que la compra valió la pena.

#### Acceptance Criteria

1. WHERE una guía tiene categoría `masterclass`, THE VIP_Content SHALL incluir entre 6 y 8 secciones, una intro ampliada de al menos 150 palabras, al menos una sección de errores comunes o qué NO hacer con al menos 3 items, al menos una sección con calendario o rutina paso a paso con al menos 5 pasos, y un arreglo `sources` con al menos una fuente.
2. WHERE una guía tiene categoría `protocolo`, THE VIP_Content SHALL incluir entre 6 y 8 secciones, al menos 5 pasos secuenciales numerados, al menos una checklist accionable de al menos 4 items marcables, y criterios explícitos de cuándo aplicar y cuándo NO aplicar el protocolo.
3. WHERE una guía tiene categoría `protocolo` y contiene afirmaciones de salud, THE VIP_Content SHALL incluir un arreglo `sources` con al menos una fuente que respalde esas afirmaciones.
4. WHERE una guía tiene categoría `mini-guia`, THE VIP_Content SHALL incluir entre 5 y 6 secciones, al menos 2 ejemplos concretos listos para copiar, y al menos un bloque de `items` por sección con al menos 3 items por bloque.
5. THE VIP_Content SHALL enriquecer las 10 guías del inventario (`masterclass-sueno`, `masterclass-cortisol`, `masterclass-ejercicio`, `masterclass-ayuno`, `anti-rebote`, `reintroduccion-alimentos`, `deshincha-72h`, `en-viajes`, `cena-anti-rebote`, `snacks-que-desinflaman`) de modo que cada una alcance o supere los mínimos de su categoría.
6. IF una guía tiene 0 secciones, 0 items o 0 ejemplos, THEN THE VIP_Content SHALL considerar que esa guía NO cumple los mínimos de su categoría.
7. THE VIP_Content SHALL producir guías cuya cantidad de secciones y conteo de palabras sea igual o mayor a la del TURBO_Benchmark de su misma categoría.
8. THE VIP_Content SHALL producir guías con un conteo mínimo de palabras de 800 para categorías `masterclass` y `protocolo`, y de 500 para categoría `mini-guia`.

### Requirement 4: Tono, claridad y respaldo del contenido

**User Story:** Como usuaria sin formación técnica, quiero leer las guías en un lenguaje cercano y simple con ejemplos concretos, para entender y aplicar lo que dicen sin confundirme.

#### Acceptance Criteria

1. THE VIP_Content SHALL redactar el contenido de las guías dirigiéndose a la lectora en segunda persona singular con tratamiento de "vos" (rioplatense/neutro) de forma consistente en el 100% de las apelaciones directas a la lectora, sin alternar con "tú" ni "usted".
2. THE VIP_Content SHALL incluir al menos un (1) emoji en cada título de sección de cada guía.
3. WHERE el contenido de una guía introduce un término técnico (por ejemplo cortisol, nervio vago, piperina o glucemia), THE VIP_Content SHALL incluir, junto a su primera aparición, una explicación del término en lenguaje simple de entre una (1) y dos (2) oraciones que no reutilice el propio término técnico para definirse.
4. THE VIP_Content SHALL incluir en cada sección al menos un (1) elemento concreto y accionable, entendiendo por concreto un ejemplo, una cantidad, un horario o un paso.
5. WHERE el contenido de una guía afirma un beneficio o efecto de salud (entendido como todo enunciado que atribuye un efecto fisiológico, terapéutico, preventivo o de bienestar a una sustancia, alimento, hábito o práctica), THE VIP_Content SHALL respaldar esa afirmación con al menos una (1) entrada en el arreglo `sources` parafraseada, sin reproducir más de quince (15) palabras consecutivas idénticas al texto de la fuente.
6. WHERE una guía ofrece únicamente orientación práctica sin afirmaciones de beneficio o efecto de salud, THE VIP_Content SHALL permitir su publicación sin requerir el arreglo `sources`.
7. IF una guía contiene al menos una afirmación de beneficio o efecto de salud que no está respaldada por una entrada correspondiente en el arreglo `sources`, THEN THE VIP_Content SHALL impedir la publicación de la guía y señalar cuál es la afirmación sin respaldo, conservando el contenido ya redactado sin descartarlo.

### Requirement 5: Integridad de datos y navegación de las guías

**User Story:** Como mantenedor del sistema, quiero que los datos de las guías sean consistentes y navegables, para evitar enlaces rotos y datos inválidos.

#### Acceptance Criteria

1. THE VIP_Content SHALL garantizar que el campo `slug` de cada elemento de `VIP_GUIDES` sea único entre todos los elementos, comparando los slugs de forma sensible a mayúsculas y minúsculas.
2. IF dos o más elementos de `VIP_GUIDES` comparten el mismo `slug`, THEN THE VIP_Content SHALL rechazar el conjunto de datos sin exponer ninguna guía e indicar un error que identifique el `slug` duplicado.
3. THE VIP_Content SHALL asignar a cada guía una `category` perteneciente exactamente al conjunto {`masterclass`, `mini-guia`, `protocolo`}.
4. IF una guía define un valor de `category` fuera del conjunto {`masterclass`, `mini-guia`, `protocolo`}, THEN THE VIP_Content SHALL rechazar esa guía e indicar un error que señale el valor de `category` inválido.
5. WHEN el VIP_Hub referencia el slug de una guía, THE VIP_Content SHALL resolver ese slug a una guía válida mediante `getVipGuide(slug)`.
6. WHERE una guía define el arreglo `sources`, THE VIP_Content SHALL asegurar que cada fuente tenga un `label` con al menos 1 carácter distinto de espacio en blanco y una `url` que comience con `http://` o `https://`.
7. IF una fuente dentro del arreglo `sources` tiene un `label` vacío o compuesto solo por espacios en blanco, o una `url` que no comienza con `http://` o `https://`, THEN THE VIP_Content SHALL rechazar esa guía e indicar un error que identifique la fuente inválida.
8. IF el VIP_Renderer recibe un slug que no resuelve a ninguna guía mediante `getVipGuide(slug)`, THEN THE VIP_Renderer SHALL mostrar el estado "Contenido no encontrado" junto con un enlace de regreso a `/pwa/vip`.

### Requirement 6: Edición de celdas del planner

**User Story:** Como usuario VIP, quiero escribir en cada celda del planner semanal dentro de la app, para armar mi plan de comidas y hábitos de la semana.

#### Acceptance Criteria

1. THE Planner_Grid SHALL renderizar una tabla de exactamente 8 filas definidas por `PLANNER_ROWS` y 7 columnas definidas por `PLANNER_DAYS`, resultando en 56 celdas de datos editables.
2. THE Planner_Grid SHALL presentar cada celda de datos como un input de texto controlado y editable por el usuario, que acepta entre 0 y 500 caracteres.
3. WHEN el usuario escribe un valor de hasta 500 caracteres en una celda, THE Planner_Page SHALL actualizar el estado de esa celda a través del helper `setCell` y reflejar el valor ingresado en el input correspondiente, sin modificar las otras 55 celdas.
4. THE Planner_State SHALL implementar `setCell` de forma inmutable, devolviendo un nuevo PlannerData en el que solo la celda objetivo cambia a su nuevo valor y todas las demás celdas conservan su valor previo.
5. THE Planner_Page SHALL actualizar el estado de una celda únicamente en respuesta a la escritura activa del usuario, y no como efecto de la inicialización ni de la hidratación.
6. IF el usuario intenta ingresar más de 500 caracteres en una celda, THEN THE Planner_Grid SHALL impedir el ingreso de caracteres adicionales y conservar el valor limitado a 500 caracteres.
7. WHEN el usuario borra todo el contenido de una celda, THE Planner_Page SHALL actualizar el estado de esa celda a una cadena vacía mediante `setCell`, sin modificar las demás celdas.

### Requirement 7: Autoguardado en localStorage mientras se escribe

**User Story:** Como usuario VIP, quiero que lo que escribo en el planner se guarde solo mientras escribo, para no perder mi trabajo ni tener que pulsar un botón de guardar.

#### Acceptance Criteria

1. WHEN el estado del planner cambia tras la hidratación, THE Planner_Page SHALL persistir el estado en localStorage transcurrido el Debounce_Interval, definido como 400 milisegundos, desde la última pulsación de tecla.
2. WHILE el usuario realiza pulsaciones de tecla sucesivas separadas por menos del Debounce_Interval, THE Planner_Page SHALL reiniciar el temporizador en cada pulsación y persistir el estado una sola vez tras la última pulsación.
3. THE Planner_State SHALL persistir el estado como PlannerStored con `version` igual a 1, el `data` actual y un `updatedAt` con timestamp en formato ISO 8601, bajo la clave Planner_Storage_Key.
4. WHILE el componente aún no completó la hidratación desde localStorage, THE Planner_Page SHALL abstenerse de persistir el estado para no sobrescribir datos previos con un planner vacío.
5. THE Planner_State SHALL definir Planner_Storage_Key como `STORAGE_KEYS.vipPlanner` con valor `'pwa_vip_planner'` en `lib/constants.ts`.
6. IF la escritura en localStorage falla (por ejemplo, cuota de almacenamiento excedida o localStorage no disponible), THEN THE Planner_Page SHALL conservar el estado actual en memoria sin pérdida de datos y mostrar una indicación de que el autoguardado no pudo completarse.

### Requirement 8: Persistencia y rehidratación al recargar o reentrar

**User Story:** Como usuario VIP, quiero que mi planner siga ahí cuando recargo la página o vuelvo a entrar, para continuar donde lo dejé.

#### Acceptance Criteria

1. WHEN el Planner_Page se monta en el cliente, THE Planner_Page SHALL hidratar el estado del planner invocando `loadPlannerFromStorage`.
2. IF existe bajo Planner_Storage_Key un PlannerStored válido (entendiendo por válido que puede deserializarse correctamente y contiene la estructura esperada de un PlannerData), THEN THE Planner_State SHALL devolver un PlannerData equivalente al que fue persistido por última vez.
3. THE Planner_State SHALL garantizar que `loadPlannerFromStorage`, tras un `savePlannerToStorage(data)`, devuelva un PlannerData con las mismas celdas que `data`.
4. WHEN el Planner_State carga un PlannerData persistido, THE Planner_State SHALL normalizarlo de modo que toda `PlannerRowKey` esté presente, descartando las entradas con índice mayor o igual a 7 y rellenando los índices 0 a 6 faltantes con strings vacíos, dejando cada fila con exactamente 7 entradas.
5. IF no existe ningún PlannerStored bajo Planner_Storage_Key, THEN THE Planner_State SHALL devolver el resultado de `createEmptyPlanner` (un PlannerData con 7 strings vacíos por fila).
6. IF el valor persistido no puede deserializarse o no contiene la estructura esperada de un PlannerData, THEN THE Planner_State SHALL devolver el resultado de `createEmptyPlanner` sin propagar excepciones y sin sobrescribir el valor en storage.

### Requirement 9: Descarga directa de PDF en blanco

**User Story:** Como usuario VIP, quiero descargar de un toque un PDF en blanco del planner, para imprimirlo y completarlo a mano sin pasar por el diálogo de impresión del navegador.

#### Acceptance Criteria

1. WHEN el usuario pulsa el botón de descarga de PDF, THE PDF_Generator SHALL generar y descargar directamente un archivo `.pdf` mediante una librería client-side, en un máximo de 5 segundos desde la pulsación, sin abrir el diálogo de impresión del navegador.
2. THE PDF_Generator SHALL producir un Blank_PDF que contenga un encabezado con los 7 días de `PLANNER_DAYS`, una primera columna con los labels de `PLANNER_ROWS`, y todas las celdas de datos restantes vacías (sin texto ni valores).
3. THE PDF_Generator SHALL generar el Blank_PDF independientemente del estado del usuario, sin leer PlannerData ni localStorage; la estructura del documento (días y labels de filas) SHALL estar definida directamente en el PDF_Generator a partir de las constantes `PLANNER_DAYS` y `PLANNER_ROWS`, de modo que la salida sea idéntica para cualquier contenido del planner.
4. THE PDF_Generator SHALL nombrar el archivo descargado `planner-semanal-chau-hinchazon.pdf` y disponer el documento en orientación apaisada (landscape).
5. THE PDF_Generator SHALL importar la librería de PDF de forma dinámica dentro del handler de descarga, de modo que la librería no afecte el SSR ni el bundle inicial.
6. WHILE el PDF_Generator está generando o descargando el Blank_PDF, THE PDF_Generator SHALL deshabilitar el botón de descarga para impedir solicitudes de descarga simultáneas o duplicadas.
7. IF la generación o la descarga del Blank_PDF falla, THEN THE PDF_Generator SHALL mostrar un mensaje de error que indique que la descarga no se completó, SHALL evitar la descarga de un archivo parcial o corrupto, y SHALL rehabilitar el botón de descarga para permitir un nuevo intento.

### Requirement 10: Robustez SSR y tolerancia a fallos de almacenamiento

**User Story:** Como mantenedor del sistema, quiero que los helpers de almacenamiento del planner sean seguros en servidor y ante fallos de localStorage, para que la página nunca se rompa.

#### Acceptance Criteria

1. WHILE `window` es indefinido (contexto SSR), THE Planner_State SHALL devolver el resultado de `createEmptyPlanner` en cada operación de lectura y, en cada operación de escritura, retornar sin modificar ningún estado persistido y sin lanzar excepciones.
2. THE Planner_State SHALL implementar `createEmptyPlanner` como función pura que devuelve un PlannerData que contiene exactamente todas las `PlannerRowKey` definidas, donde cada fila es un arreglo nuevo e independiente de exactamente 7 strings vacíos (`""`).
3. IF el valor persistido bajo Planner_Storage_Key no puede parsearse como JSON, no es un objeto, omite alguna `PlannerRowKey`, contiene claves que no son `PlannerRowKey`, o incluye alguna fila que no sea un arreglo de exactamente 7 strings, THEN THE Planner_State SHALL descartar el valor y devolver el resultado de `createEmptyPlanner` sin lanzar excepciones.
4. IF localStorage lanza una excepción durante una operación de escritura (por ejemplo modo privado o cuota excedida), THEN THE Planner_State SHALL capturar la excepción sin propagarla, conservar sin cambios la edición en memoria, y permitir que las operaciones de lectura y escritura posteriores sigan ejecutándose.
5. IF la carga dinámica de la librería de PDF es rechazada, THEN THE Planner_Page SHALL mostrar un mensaje de error legible que indique que la generación del PDF no pudo completarse, sin recargar la página ni navegar fuera de ella.
6. WHILE el mensaje de error de generación de PDF está visible, THE Planner_Page SHALL mantener disponibles y operativas las funciones de edición y de guardado del planner.

### Requirement 11: Hidratación determinista sin desajustes de render

**User Story:** Como usuario VIP, quiero que la página del planner cargue sin parpadeos ni errores de hidratación, para tener una experiencia fluida.

#### Acceptance Criteria

1. THE Planner_Page SHALL inicializar su estado con el resultado de `createEmptyPlanner`, de modo que el marcado renderizado en SSR sea idéntico al del primer render del cliente, sin advertencias ni errores de hidratación en la consola.
2. WHILE se ejecuta el SSR, THE Planner_Page SHALL abstenerse de acceder a `window` o `localStorage`.
3. WHEN el montaje del componente en el cliente se completa, THE Planner_Page SHALL leer localStorage únicamente dentro de un efecto posterior al montaje.
4. WHEN el Planner_Page restaura el estado desde localStorage, THE Planner_Page SHALL aplicar el estado restaurado en una única actualización dentro de los 100 milisegundos posteriores al montaje, sin renders intermedios visibles.
5. IF la lectura desde localStorage falla o devuelve datos inválidos, THEN THE Planner_Page SHALL conservar el estado de `createEmptyPlanner`, continuar el render y descartar el dato inválido.
