# Prompt único para Claude Opus — Codear la app "AUGC Pipeline" de una sola vez

Pegá TODO el bloque de abajo en Claude Opus (o Claude Code). Está pensado para que genere la
aplicación completa en una sola pasada. La app: (1) recibe un **texto largo** con escenas y
explicaciones (tal como lo escribís vos), (2) lo **interpreta con IA (Gemini)** y lo convierte
en un plan estructurado, (3) corre el **pipeline en orden**: imagen base → imagen "después"
(usando la base como referencia) → video de cada clip (usando su imagen como input) → clips
ordenados listos para editar.

> AUTENTICACIÓN: NO se usan API keys. Se usa **ADC (Application Default Credentials)** de Google
> Cloud. Toda la generación va por **Vertex AI**. (Si en el futuro cambiás a credenciales con
> clave, solo se ajusta el cliente de auth; el resto queda igual.)
>
> ALMACENAMIENTO: la app corre **en tu PC** y guarda imágenes y videos **en la carpeta del
> proyecto** (`./output/...`). **No usa Supabase** ni storage externo.

---

## PROMPT (copiar y pegar tal cual en Claude Opus)

```
Construí, en una sola entrega y completa, una aplicación web "AUGC Pipeline" que automatice la
producción de anuncios UGC para un funnel de quiz. Quiero NO tener que generar cada imagen y
cada video a mano: yo pego un texto largo describiendo las escenas y la app hace todo en orden.

================================================================
OBJETIVO FUNCIONAL (de punta a punta)
================================================================
1) INPUT EN LENGUAJE NATURAL: una pantalla con un textarea grande donde pego un brief largo con
   varias escenas y explicaciones de cómo tiene que ser cada una (formato libre, como un guion
   con marcas [visual] y [audio], o prosa). Ejemplo realista de lo que voy a pegar:
   - Avatares (ej. "Avatar 1: mujer argentina ~40, con sobrepeso, cocina humilde, sostiene un
     vaso de agua de arroz; después: la misma cara pero más desinflada, vestido bordó, espejo").
   - Clips en orden (hook, reveal, escepticismo, mecanismo, warning, CTA) con el diálogo exacto
     en español rioplatense (vos), duración, y si es b-roll.
2) INTERPRETACIÓN CON IA: un paso que manda ese texto a Gemini (Vertex AI) con un prompt de
   sistema que devuelve JSON ESTRUCTURADO y validado (esquema abajo): detecta avatares, qué
   imágenes generar (text2image vs image2image con su referencia), los clips, el orden, el
   diálogo, la duración y si cada clip es IA o FILMAR_REAL. Mostrame ese JSON para revisarlo y
   editarlo antes de generar.
3) PIPELINE EN CADENA (lo central): al apretar "Generar todo", la app:
   a. Genera primero las imágenes text2image (Vertex AI Imagen).
   b. Genera las imágenes image2image usando como referencia la imagen ya generada que indique
      ref_image_id, instruyendo mantener la identidad/cara idéntica (consistencia del avatar).
   c. Por cada clip marcado IA, espera a que su imagen (image_id) esté lista y genera el video
      con Veo (Vertex AI) en modo imagen→video, pasando el diálogo y la duración.
   d. Los clips FILMAR_REAL quedan como placeholders para que yo suba el archivo a mano.
   e. GUARDA TODO EN EL DISCO LOCAL, dentro de la carpeta del proyecto (NO en Supabase ni en
      ningún servicio externo). Estructura: ./output/<project_id>/images/ para las imágenes y
      ./output/<project_id>/clips/ para los videos, con los clips nombrados por orden
      (01_hook.mp4, 02_reveal.mp4, ...). Escribí también ./output/<project_id>/manifest.json
      con todo el plan + las rutas de cada archivo generado. La app corre en mi PC, así que el
      resultado tiene que quedar listo en esa carpeta para abrirla directo. (Opcional avanzado:
      unir con ffmpeg en un solo final.mp4 dentro de esa misma carpeta; paso aparte y opcional.)
4) TODO asíncrono, con estado en vivo por cada job (pending -> generating -> done | failed),
   reintentos con backoff, y posibilidad de regenerar UNA imagen o UN clip sin rehacer el resto.

================================================================
AUTENTICACIÓN — IMPORTANTE
================================================================
- NO uso API keys. Usá Application Default Credentials (ADC) de Google Cloud.
- En Node, autenticá con la librería google-auth-library (GoogleAuth) obteniendo el token desde
  ADC, o usando los SDK de Google Cloud que toman ADC automáticamente. Toda llamada a modelos
  sale del BACKEND (Route Handlers), nunca del cliente.
- Variables de entorno requeridas: GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION (ej. us-central1).
  En local se usa `gcloud auth application-default login` (ADC). Documentá esto en el README.
  NO escribas ninguna API key ni service account en el código. La app está pensada para correr
  LOCALMENTE en mi PC, donde ADC ya quedó configurado con gcloud.

================================================================
PROVEEDORES DE IA (Vertex AI) — detrás de una interfaz adaptador
================================================================
Definí interfaces y adaptadores intercambiables (para poder cambiar de modelo sin tocar la app):
- LlmProvider.parseBrief(text) -> PlanJSON     // Gemini en Vertex AI (ej. gemini-2.5-pro/flash)
- ImageProvider.generate({ prompt, refImageBytes?, negativePrompt, aspectRatio }) -> { bytes }
    // text2image e image2image. Usá Vertex AI Imagen (ej. imagen-4.0-generate-001) y/o el
    // modelo de imagen de Gemini para edición con imagen de referencia. Verificá el nombre de
    // modelo vigente desde la doc oficial de Vertex AI y dejalo configurable por env var.
- VideoProvider.generate({ imageBytes, prompt, durationSec, aspectRatio }) -> { bytes | gcsUri }
    // imagen->video con Veo en Vertex AI (operación de larga duración: hacé polling del LRO).
    // El nombre de modelo de Veo dejalo configurable por env var.
- Incluí SIEMPRE un MOCK provider (devuelve imágenes/videos placeholder) seleccionable por env
  (PROVIDER_MODE=mock|vertex) para probar el pipeline COMPLETO sin gastar cuota ni credenciales.
- Verificá contra la documentación oficial de Vertex AI los IDs de modelo y los shapes de
  request/response actuales (Imagen, Veo, Gemini) y centralizá esos nombres en un archivo de
  config. No hardcodees endpoints repetidos por todo el código.

================================================================
ESQUEMA DEL PLAN (salida del parser, validar con Zod)
================================================================
Project {
  global: { idioma_dialogo: string, formato: string (default "9:16"),
            reglas_realismo: string, negative_prompt: string }
  assets: Asset[]
  clips: Clip[]
}
Asset {
  id: string, tipo: "avatar" | "broll",
  images: Image[]
}
Image {
  id: string, modo: "text2image" | "image2image",
  ref_image_id?: string,   // requerido si modo=image2image; apunta a otra Image.id del proyecto
  prompt: string           // en inglés
}
Clip {
  id: string, orden: number, asset_id: string, image_id: string,
  video_prompt: string,    // en inglés
  dialogo: string,         // en idioma_dialogo; "" si b-roll mudo
  duracion_seg: number,
  etiqueta: "IA" | "FILMAR_REAL",
  on_screen_text?: string
}
Reglas de consistencia que el parser DEBE respetar:
- La primera imagen de un avatar es text2image. Estados posteriores del MISMO avatar son
  image2image con ref_image_id apuntando a una imagen previa y el prompt debe pedir "keep
  identity 100% consistent with the reference".
- Los prompts visuales se generan en inglés; los diálogos quedan en el idioma_dialogo (es-AR vos)
  sin traducir.
- Si falta info para completar el esquema, el parser rellena con defaults razonables y agrega un
  campo "warnings" listando los supuestos, en vez de fallar.

================================================================
STACK
================================================================
- Next.js 14 (App Router) + TypeScript + Tailwind CSS. Zustand (estado). Zod (validación).
- ESTA APP CORRE LOCALMENTE EN MI PC (no se despliega en la nube). Por lo tanto:
  * ALMACENAMIENTO LOCAL EN ARCHIVOS: NO uses Supabase ni storage externo. Guardá todo en el
    filesystem, dentro de ./output/<project_id>/ (subcarpetas images/ y clips/), más un
    manifest.json por proyecto. Para los metadatos/estado de jobs y proyectos, usá SQLite local
    (mejor) o simples archivos JSON en ./data/. Nada de servicios externos de base de datos.
  * Las imágenes y videos generados se escriben como archivos reales en esa carpeta y la UI los
    sirve desde ahí (ruta estática local) para previsualizarlos.
- Cola de jobs en backend con reintentos/backoff. Sin procesos "watch" en dev.
- ffmpeg para el stitch opcional (detectá si está instalado; si no, saltá ese paso).

================================================================
UI (mínima, funcional, en español)
================================================================
- "Nuevo proyecto": textarea del brief + botón "Interpretar con IA" -> muestra el PlanJSON
  editable (con un editor JSON y validación en vivo). Botón "Generar todo" y estimación de
  cantidad de llamadas/costo antes de confirmar.
- "Pipeline": lista/grafo de jobs con estado en vivo (imagen -> imagen -> video), botones
  "reintentar" y "regenerar este clip", y previews de imágenes y videos a medida que salen.
- "Resultado": timeline ordenada, textos en pantalla sugeridos por clip, subida manual para
  clips FILMAR_REAL, y un botón "Abrir carpeta de salida" que muestre la ruta local
  (./output/<project_id>/) donde quedaron los archivos (imágenes, clips y manifest.json), más el
  final.mp4 si se hizo stitch. Previsualizá imágenes y videos directamente desde esos archivos
  locales.

================================================================
NO FUNCIONALES
================================================================
- Idempotencia (regenerar 1 ítem sin rehacer todo). Manejo de rate limits y LRO polling de Veo.
- Errores claros y accionables. Tipado estricto en TypeScript.
- Seguridad: credenciales/identidad solo en backend; nada sensible en el cliente.

================================================================
ENTREGABLES (todo en esta misma respuesta)
================================================================
1. Estructura de archivos completa del proyecto.
2. Código completo de: route handlers (parse, generar imagen, generar video, jobs, descarga),
   adaptadores (vertex + mock), store Zustand, esquemas Zod, y las 3 pantallas.
3. Capa de almacenamiento LOCAL: módulo que escribe/lee archivos en ./output/<project_id>/ y el
   manifest.json, + SQLite (o JSON en ./data/) para estado de proyectos y jobs. SIN Supabase.
4. .env.example con GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, PROVIDER_MODE, IMAGE_MODEL,
   VIDEO_MODEL, LLM_MODEL y OUTPUT_DIR (default ./output). NADA de variables de Supabase.
5. README: requisitos, cómo correr `gcloud auth application-default login`, cómo levantar con
   `npm run dev`, formato del brief de entrada, dónde quedan los archivos generados, y cómo
   cambiar de modelo/proveedor.
6. Un brief de ejemplo (sample-brief.txt) y el PlanJSON que debería producir (sample-plan.json),
   para poder probar con PROVIDER_MODE=mock de punta a punta.

Empezá ahora. Si algo es ambiguo, asumí el default más razonable y dejá un comentario "// TODO:
confirmar", pero entregá el proyecto completo y ejecutable en una sola pasada.
```

---

## Notas de uso (para vos)
- **Lo que pediste**: vos pegás el texto largo con escenas → un paso con Gemini lo interpreta y
  arma el plan → la app genera imagen, después la imagen "después" a partir de esa, después el
  video de cada una, en orden. Nada de hacerlo 1×1.
- **ADC / sin API key**: el prompt ya le dice a Opus que use ADC + Vertex AI y que las llamadas
  salgan del backend. En tu compu, antes de correr, hacés una vez:
  `gcloud auth application-default login` y seteás `GOOGLE_CLOUD_PROJECT` y
  `GOOGLE_CLOUD_LOCATION`. En la nube, alcanza con la service account del entorno.
- **Probar gratis primero**: arrancá con `PROVIDER_MODE=mock` para ver el pipeline completo sin
  gastar cuota; después cambiás a `vertex`.
- **Dónde quedan los videos**: en `./output/<project_id>/clips/` dentro de la carpeta del
  proyecto, en tu PC. No se sube nada a Supabase ni a la nube.
- Si tu Google Cloud todavía no tiene habilitada la **Vertex AI API** ni acceso a **Veo/Imagen**,
  hay que activarlos en el proyecto (el README que genere Opus debería recordarlo).

---

## Cómo conectar ADC en tu PC desde cero (nunca lo usaste — guía paso a paso)

ADC = "Application Default Credentials". Es la forma en que las librerías de Google encuentran
tu identidad automáticamente, sin que vos pegues ninguna clave en el código. Hacés esto **una
sola vez** y queda configurado en tu compu.

**1) Tené (o creá) un proyecto de Google Cloud**
- Entrá a https://console.cloud.google.com/ con tu cuenta de Google.
- Arriba, creá un proyecto (o usá uno existente). Anotá el **Project ID** (algo como
  `mi-proyecto-123456`). Ese valor va en `GOOGLE_CLOUD_PROJECT`.
- Para usar Veo/Imagen necesitás **facturación activada** en ese proyecto (Billing) — aunque
  pruebes poco, Google lo exige para Vertex AI.

**2) Activá la API de Vertex AI**
- En la consola, buscador → "Vertex AI API" → **Enable/Habilitar**.
- (Veo y algunos modelos pueden requerir solicitar acceso; si te da error de modelo, ahí está
  la causa.)

**3) Instalá la herramienta `gcloud` (Google Cloud CLI)**
- Descargala de https://cloud.google.com/sdk/docs/install y seguí el instalador para tu sistema
  (Windows / Mac / Linux). Es lo único que tenés que instalar para que ADC funcione.
- Cuando termina, abrí una terminal nueva y comprobá que anda:
  `gcloud --version`

**4) Iniciá sesión y generá las credenciales ADC**
Corré estos comandos en la terminal (te abren el navegador para loguearte con tu cuenta Google):
```
gcloud auth login
gcloud config set project TU_PROJECT_ID
gcloud auth application-default login
```
- El último comando es EL que crea las credenciales ADC. Te abre el navegador, aceptás, y
  guarda un archivo de credenciales en tu PC automáticamente (no tenés que tocarlo).
- A partir de acá, cualquier app en tu compu (incluida la que te haga Opus) detecta tu identidad
  sola. **No copiás ni pegás ninguna clave en el código.**

**5) Configurá las variables del proyecto**
En el archivo `.env.local` de la app (lo crea Opus a partir del `.env.example`):
```
GOOGLE_CLOUD_PROJECT=TU_PROJECT_ID
GOOGLE_CLOUD_LOCATION=us-central1
PROVIDER_MODE=vertex
OUTPUT_DIR=./output
```
(Para la primera prueba sin gastar, poné `PROVIDER_MODE=mock`.)

**6) Listo: corré la app**
```
npm install
npm run dev
```
Abrís http://localhost:3000, pegás tu brief, "Interpretar con IA" → "Generar todo", y los
archivos aparecen en `./output/<project_id>/`.

> Tips / problemas comunes:
> - Si ves un error tipo "Could not load the default credentials", es que falta el paso 4
>   (`gcloud auth application-default login`).
> - Si ves "PERMISSION_DENIED" o "API not enabled", revisá el paso 2 (habilitar Vertex AI) y que
>   el Project ID sea el correcto.
> - Si ves error sobre el modelo de Veo/Imagen, puede ser que falte acceso al modelo en tu
>   proyecto o que el nombre del modelo cambió: actualizá `IMAGE_MODEL`/`VIDEO_MODEL` en el
>   `.env.local` con el ID vigente de la doc de Vertex AI.

> Si en vez de ADC me confirmás otro tipo de credencial (service account JSON, Workload Identity,
> etc.), te ajusto solo la sección de AUTENTICACIÓN del prompt; el resto queda igual.
