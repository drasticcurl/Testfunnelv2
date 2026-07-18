import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Configuración de Vitest para el proyecto.
 *
 * - Alias `@` → raíz del proyecto (alineado con `tsconfig.json` → paths `@/*`).
 * - Entorno `node` por defecto (la lógica testeada es mayormente pura:
 *   normalización, store en memoria, selección de slides; no necesita jsdom).
 * - Los tests de componente/integración de React (`*.test.tsx`) optan por el
 *   entorno `jsdom` de forma POR-ARCHIVO mediante el docblock
 *   `// @vitest-environment jsdom` al tope del archivo, sin alterar el entorno
 *   global `node` de los tests existentes.
 * - `esbuild.jsx: 'automatic'` habilita el runtime de JSX moderno (sin necesidad
 *   de `import React`) para los archivos `.tsx`; no afecta a los tests `.ts`
 *   existentes (no contienen JSX).
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
});
