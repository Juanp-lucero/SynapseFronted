// Genera src/environments/environment.ts en el build de Vercel
// usando la variable de entorno API_URL (URL pública del backend).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const apiUrl = (process.env.API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

if (!process.env.API_URL) {
  console.warn('[set-env] API_URL no está definida; se usará http://127.0.0.1:8000');
}

const target = fileURLToPath(new URL('../src/environments/environment.ts', import.meta.url));

writeFileSync(
  target,
  `export const environment = {\n  production: true,\n  apiUrl: '${apiUrl}',\n};\n`
);

console.log(`[set-env] apiUrl = ${apiUrl}`);
