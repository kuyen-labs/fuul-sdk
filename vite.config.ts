import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, './src'),
      formats: ['es', 'cjs'],
      name: 'Fuul',
      fileName: 'index',
    },
    outDir: 'dist',
  },
  plugins: [
    tsconfigPaths(),
    dts({
      exclude: ['node_modules', 'src/**/*.test.ts'],
      compilerOptions: {
        sourceMap: false,
      },
      copyDtsFiles: true,
      outputDir: 'dist',
    }),
  ],
});
