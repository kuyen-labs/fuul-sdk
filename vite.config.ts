import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Fuul',
      fileName: 'index',
    },
  },
  plugins: [
    tsconfigPaths(),
    dts({
      exclude: ['node_modules'],
      compilerOptions: {
        sourceMap: false,
      },
      copyDtsFiles: true,
    }),
  ],
});
