import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'Fuul',
      fileName: 'index',
    },
    sourcemap: true,
  },
  plugins: [
    tsconfigPaths(),
    dts({
      exclude: ['node_modules', 'src/**/*.test.ts'],
      insertTypesEntry: true,
    }),
  ],
});
