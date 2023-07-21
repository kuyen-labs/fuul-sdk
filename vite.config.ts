import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { EsLinter, linterPlugin } from 'vite-plugin-linter'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig((configEnv) => ({
  build: {
    lib: {
      entry: resolve('src', 'index.ts'),
      name: 'FuulSdk',
      fileName: 'fuul-sdk',
    },
    rollupOptions: {
      output: {
        exports: 'default',
      },
    },
  },
  plugins: [
    tsConfigPaths(),
    linterPlugin({
      include: ['./src}/**/*.{ts,tsx}'],
      linters: [new EsLinter({ configEnv })],
    }),
    dts({
      include: ['src/'],
    }),
  ],
}))
