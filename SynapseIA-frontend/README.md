# Synapse IA · Frontend

Aplicación Angular de Synapse IA, una plataforma para descubrir conocimiento y conexiones entre documentos. Consume la API FastAPI del repositorio [`Juanp-lucero/SynapseBackend`](https://github.com/Juanp-lucero/SynapseBackend).

- **Aplicación:** https://synapse-frontend-alpha-khaki.vercel.app
- **API:** https://synapse-backend-eight.vercel.app ([documentación](https://synapse-backend-eight.vercel.app/docs))

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

## Despliegue (Vercel)

`vercel.json` define el build. El script `scripts/set-env.mjs` genera `environment.ts` con la variable de entorno **`API_URL`**, que es la URL pública del backend, y las rutas de la SPA se redirigen a `index.html`.

| Variable | Descripción |
|---|---|
| `API_URL` | URL del backend, por ejemplo `https://synapse-backend-eight.vercel.app` |
