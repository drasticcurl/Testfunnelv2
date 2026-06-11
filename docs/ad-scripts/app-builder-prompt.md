# Prompt de build: App "AUGC Pipeline" (generador automático de videos UGC)

Pegá el bloque de abajo en una IA de código (v0, Lovable, Cursor, Claude Code, Bolt, etc.).
Construye una app web donde vos pegás la info de un anuncio (como la estructuro yo) y la app,
**sola y en orden**, genera: imagen base del avatar → imagen "después" (usando la base como
referencia) → video de cada clip (usando su imagen como input) → y te entrega los clips en el
orden correcto, sin tener que hacerlos uno por uno.

---

## BUILD PROMPT (copiar tal cual)

```
Construí una aplicación web llamada "AUGC Pipeline" que automatiza la producción de anuncios
UGC en cadena: a partir de un guion estructurado, genera primero las IMÁGENES de los avatares,
luego los VIDEOS usando cada imagen como input, y entrega los clips ordenados y listos para
editar. El objetivo es NO tener que disparar cada generación a mano.

### Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS.
- Estado: Zustand. Validación de entrada: Zod.
- Persistencia: Supabase (Postgres + Storage para guardar imágenes/videos generados).
- Cola de trabajos en backend (Route Handlers /app/api). Sin watchers en dev.
- Adaptadores de proveedores de IA detrás de una interfaz común (ver "Proveedores").

### Modelo de datos (entrada que pega el usuario, JSON o formulario)
Un "Project" contiene:
- global: { idioma_dialogo (ej. "es-AR rioplatense con vos"), formato ("9:16"),
  reglas_realismo (string), negative_prompt (string) }
- assets: lista de AVATARES y B-ROLLS. Cada asset:
  - id, tipo: "avatar" | "broll"
  - images: lista ordenada de imágenes a generar. Cada imagen:
      { id, modo: "text2image" | "image2image",
        ref_image_id (requerido si modo=image2image, apunta a otra image.id del mismo proyecto),
        prompt (en inglés) }
  - (para avatar) opcional: notas de identidad para reforzar consistencia.
- clips: lista ORDENADA que arma el anuncio final. Cada clip:
  { id, orden, asset_id, image_id (qué imagen usar como input del video),
    video_prompt (en inglés), dialogo (en el idioma_dialogo; "" si es b-roll mudo),
    duracion_seg, etiqueta: "IA" | "FILMAR_REAL", on_screen_text (opcional) }

### Lógica del pipeline (lo central)
1. RESOLVER DEPENDENCIAS: ordená la generación de imágenes por dependencias. Una imagen
   text2image se genera primero; una image2image espera a que su ref_image_id exista y usa
   ESA imagen generada como referencia (consistencia de identidad del avatar).
2. GENERAR IMÁGENES: por cada image, llamá al proveedor de imagen. Guardá el resultado en
   Supabase Storage y la URL en la DB. Reintentos con backoff. Marcá estado:
   pending → generating → done | failed.
3. GENERAR VIDEOS: por cada clip con etiqueta "IA", esperá a que su image_id esté "done",
   y llamá al proveedor de video pasando { image_url, video_prompt, dialogo, duracion }.
   Los clips "FILMAR_REAL" se crean como placeholders (no se generan) y se marcan para que
   el usuario suba el archivo manualmente.
4. ENSAMBLAR: ordená los clips por "orden" y mostralos como una "timeline" del anuncio.
   Generá un manifiesto descargable (JSON) y un ZIP con todos los assets en orden, con nombres
   tipo 01_hook.mp4, 02_reveal.mp4, etc. (Opcional/avanzado: stitch con ffmpeg si hay tiempo;
   si no, dejá los clips ordenados + manifiesto para editar.)
5. Todo el proceso corre como JOBS asíncronos con estado visible (no bloquear la UI).

### Proveedores (interfaz adaptador, configurables por .env)
Definí dos interfaces y al menos un adaptador real de cada una; dejá fácil cambiar de proveedor:
- ImageProvider.generate({ prompt, refImageUrl?, negativePrompt, aspectRatio }) -> { url }
  (ej. adaptadores para un modelo text2image / image2image vía API REST).
- VideoProvider.generate({ imageUrl, prompt, dialogue?, durationSec, aspectRatio }) -> { url }
  (ej. adaptadores para un modelo image-to-video con lip-sync).
Las API keys van en variables de entorno (.env.local). Incluí un MOCK provider que devuelve
imágenes/videos de placeholder para poder probar el pipeline completo sin gastar créditos.

### UI (mínima pero funcional)
- Pantalla 1 "Nuevo proyecto": un textarea para pegar el JSON de entrada + un formulario guiado
  alternativo (global, avatares con sus imágenes, clips). Validar con Zod y mostrar errores claros.
- Pantalla 2 "Pipeline": vista del grafo/lista de jobs con estado en vivo (imagen→imagen→video),
  botón "Generar todo", reintentar fallidos, y previews de imágenes y videos a medida que salen.
- Pantalla 3 "Resultado": timeline ordenada de clips, textos en pantalla sugeridos, descarga del
  ZIP + manifiesto. Subida manual para los clips "FILMAR_REAL".
- Mostrar para cada clip el diálogo exacto y la etiqueta IA/FILMAR_REAL.

### Requisitos no funcionales
- Idempotencia: re-generar un solo clip/imagen sin rehacer todo.
- Costos: estimar y mostrar cantidad de llamadas antes de "Generar todo".
- Manejo de errores y rate limits con cola + reintentos.
- Seguridad: las API keys nunca en el cliente; toda llamada a proveedores desde el backend.
- Código en TypeScript, tipado, con un archivo de ejemplo de entrada (sample-project.json).

### Entregables
- App Next.js corriendo con `npm run dev`.
- Esquema SQL de Supabase (tablas: projects, assets, images, clips, jobs).
- README con: cómo configurar .env, cómo correr, formato del JSON de entrada y cómo cambiar de
  proveedor de IA.
- sample-project.json de ejemplo (2 avatares, varios clips, 1 b-roll) listo para probar con el
  MOCK provider.
```

---

## Ejemplo de `sample-project.json` (pegáselo a la IA como referencia del formato de entrada)

```json
{
  "global": {
    "idioma_dialogo": "es-AR rioplatense (vos)",
    "formato": "9:16",
    "reglas_realismo": "candid amateur selfie, smartphone front camera, realistic skin texture, natural daylight, slight grain, authentic UGC, everyday real woman",
    "negative_prompt": "beauty filter, airbrushed, studio lighting, professional model, extra fingers, distorted hands, watermark, text"
  },
  "assets": [
    {
      "id": "avatar1",
      "tipo": "avatar",
      "images": [
        {
          "id": "a1_antes",
          "modo": "text2image",
          "prompt": "Candid amateur selfie of an everyday Argentine woman ~40yo, overweight, dark brown shoulder-length hair, loose dark-grey t-shirt, holding a glass pitcher of cloudy rice water, modest home kitchen, natural daylight, photorealistic, 9:16"
        },
        {
          "id": "a1_despues",
          "modo": "image2image",
          "ref_image_id": "a1_antes",
          "prompt": "Same woman, identical face, 4 weeks later, slimmer and de-bloated, happy mirror selfie in a fitted burgundy dress, bedroom, natural daylight, keep identity 100% consistent, 9:16"
        }
      ]
    },
    {
      "id": "broll_agua",
      "tipo": "broll",
      "images": [
        {
          "id": "broll1_img",
          "modo": "text2image",
          "prompt": "Close-up: pouring cloudy white rice water into a clear glass on a kitchen counter, bowl of white rice beside, natural daylight, UGC style, 9:16"
        }
      ]
    }
  ],
  "clips": [
    {
      "id": "c1",
      "orden": 1,
      "asset_id": "avatar1",
      "image_id": "a1_antes",
      "video_prompt": "Animate into a realistic 8s vertical selfie video, talks to camera, warm hopeful tone, handheld, accurate lip-sync, no text, 9:16",
      "dialogo": "Hola Naty, ya hice el agua de arroz como me explicaste. Tengo mucha fe de desinflar esta panza de una vez. Gracias por la ayuda.",
      "duracion_seg": 8,
      "etiqueta": "IA",
      "on_screen_text": "Día 1"
    },
    {
      "id": "c2",
      "orden": 2,
      "asset_id": "avatar1",
      "image_id": "a1_despues",
      "video_prompt": "Animate the mirror-selfie image into a realistic 8s vertical video, turns to show body, happy and proud, handheld, accurate lip-sync, no text, 9:16",
      "dialogo": "Naty, mirá cómo me queda este jean que tenía guardado hace un montón. Desinflé la panza un montón y me siento mucho más liviana.",
      "duracion_seg": 8,
      "etiqueta": "FILMAR_REAL",
      "on_screen_text": "4 semanas después"
    },
    {
      "id": "c3",
      "orden": 3,
      "asset_id": "broll_agua",
      "image_id": "broll1_img",
      "video_prompt": "Animate: hands pouring rice water into a glass, close-up, handheld, 6s, no text, 9:16",
      "dialogo": "",
      "duracion_seg": 6,
      "etiqueta": "IA",
      "on_screen_text": ""
    }
  ]
}
```

> Con este formato, la app sabe **qué imagen genera primero**, **cuál depende de cuál**
> (`ref_image_id`), **qué imagen alimenta cada video** (`image_id`) y **en qué orden** se
> ensamblan los clips. Vos solo pegás el JSON (que es exactamente como te paso yo el contenido)
> y le das "Generar todo".
