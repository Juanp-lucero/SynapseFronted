# Synapse IA · Frontend

Aplicación Angular de Synapse IA, una plataforma para descubrir conocimiento y conexiones entre documentos. Consume la API FastAPI del repositorio [`Juanp-lucero/SynapseBackend`](https://github.com/Juanp-lucero/SynapseBackend).

## Despliegue

Desplegado en Vercel:

| | URL | Repositorio |
|---|---|---|
| Aplicación (frontend) | https://synapse-frontend-alpha-khaki.vercel.app | [Juanp-lucero/SynapseFronted](https://github.com/Juanp-lucero/SynapseFronted) |
| API (backend) | https://synapse-backend-eight.vercel.app | [Juanp-lucero/SynapseBackend](https://github.com/Juanp-lucero/SynapseBackend) |
| Estado de la API | https://synapse-backend-eight.vercel.app/health | |
| Documentación de la API | https://synapse-backend-eight.vercel.app/docs | |

## Cuenta de prueba

Para revisar Synapse IA sin registrarse:

| Aplicación | Correo | Contraseña |
|---|---|---|
| https://synapse-frontend-alpha-khaki.vercel.app | `profesor.demo@example.com` | `ProfeDemo2026*` |

Es una cuenta de demostración creada solo para la evaluación; no contiene datos personales.

## Cómo probarlo

1. Entra a https://synapse-frontend-alpha-khaki.vercel.app e inicia sesión con la [cuenta de prueba](#cuenta-de-prueba) (o crea una cuenta en **Crear cuenta**).
2. **Proyectos → Nuevo proyecto**: por ejemplo `Investigación Colombia`, y pulsa **Crear proyecto**.
3. **Fuentes**: elige el proyecto, selecciona el documento y pulsa **Cargar fuente**. Sirve un PDF, DOCX, TXT o CSV. Para una prueba rápida, guarda este texto como `prueba.txt`:

   ```text
   Gabriel García Márquez nació en Aracataca, Colombia, en 1927.
   Trabajó como periodista en El Espectador en Bogotá.
   La Universidad Nacional de Colombia lo homenajeó en 1982, el mismo año en que recibió el Nobel.
   ```

4. En la fuente, pulsa **Analizar**. En **Análisis** aparecen las entidades (personas, lugares, organizaciones, años), las relaciones, los patrones y las hipótesis. Lo que encontró la IA lleva la etiqueta **IA**.
5. En el panel **Interpretación con IA**: **Generar resumen** o escribe una pregunta, por ejemplo *¿Qué organizaciones aparecen?*
6. **Explorar Knowledge Graph**:
   - la leyenda filtra por tipo (los números sueltos empiezan ocultos);
   - **Buscar** centra un nodo; **Ajustar**, **Reorganizar** y **Exportar PNG** controlan la vista;
   - al hacer clic en un nodo o una relación se abre su detalle;
   - con dos o más fuentes, la línea punteada morada une los documentos que comparten entidades.

## Cómo funciona

```
Angular (Vercel) ──REST + JWT──▶ FastAPI (Vercel) ──▶ PostgreSQL (Neon)
                                       │
                                       └──▶ Groq (IA, opcional)
```

1. **Carga:** el backend extrae el texto del archivo (PDF, DOCX, TXT o CSV) y lo guarda en la base de datos junto a la fuente.
2. **Análisis por reglas:** siempre se ejecuta. Detecta nombres propios, organizaciones, años, números, métricas y categorías, y las relaciones entre ellos (por ejemplo, nombres mencionados en la misma oración).
3. **Análisis con IA:** si hay `GROQ_API_KEY`, el modelo `openai/gpt-oss-120b` devuelve entidades, relaciones e hipótesis en JSON. El backend lo valida antes de guardarlo:
   - cada entidad tiene que aparecer en el texto;
   - cada relación debe unir entidades válidas;
   - la confianza se limita entre 0 y 1.
   Si Groq falla o no está configurado, se usa solo el resultado por reglas. Si el modelo configurado deja de existir, el backend prueba otro automáticamente.
4. **Knowledge Graph:** se construye con los análisis guardados en PostgreSQL. Une las entidades repetidas y conecta los documentos que comparten entidades. Neo4j es opcional.
5. **Resumen y preguntas:** la IA responde solo con la evidencia extraída de esa fuente y del usuario autenticado. El texto de los documentos se trata como dato, nunca como instrucción.

## Funcionalidades

- **Autenticación:** registro, inicio de sesión y renovación automática del access token con el refresh token (`core/interceptors/auth.interceptor.ts`).
- **Proyectos y fuentes:** creación de proyectos y carga de documentos PDF, DOCX, TXT y CSV.
- **Análisis:** entidades, relaciones, patrones e hipótesis de cada fuente. Lo que extrae la IA se marca con la etiqueta **IA**, las relaciones muestran la frase del documento que las respalda y las hipótesis muestran su confianza y su evidencia.
- **Interpretación con IA:** resumen ejecutivo y preguntas en lenguaje natural sobre una fuente, respondidas solo con la evidencia extraída.
- **Knowledge Graph** (Cytoscape.js):
  - Grafo general, por proyecto o por fuente.
  - Colores por tipo (persona, organización, lugar, concepto, documento, patrón, hipótesis…) y leyenda que filtra los tipos.
  - Conexiones entre documentos que comparten entidades (línea punteada morada).
  - Búsqueda de nodos, ajustar y reorganizar la vista, y exportar a PNG.
  - Panel de detalle al seleccionar un nodo o una relación.

## Estructura

```
src/app/
├── core/
│   ├── guards/          # authGuard protege las rutas privadas
│   ├── interceptors/    # agrega el token y lo renueva cuando vence
│   ├── models/          # tipos de las respuestas de la API
│   └── services/        # auth, projects, sources, analysis, graph, ai, dashboard
├── features/            # páginas: dashboard, projects, sources, analysis, graph...
└── layout/              # estructura con navegación lateral
```

## Desarrollo

```bash
npm ci
npm start            # http://localhost:4200
npm test             # pruebas unitarias con Vitest
npm run build        # compilación de producción
```

En local la API se toma de `src/environments/environment.ts` (`http://127.0.0.1:8000`).

## Configuración de despliegue (Vercel)

`vercel.json` define el build. El script `scripts/set-env.mjs` genera `environment.ts` con la variable de entorno **`API_URL`**, que es la URL pública del backend, y las rutas de la SPA se redirigen a `index.html`.

| Variable | Descripción |
|---|---|
| `API_URL` | URL del backend, por ejemplo `https://synapse-backend-eight.vercel.app` |
