import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import eslintPlugin from '@nabla/vite-plugin-eslint'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { dependencies } from './package.json'

const renderChunks = (deps: Record<string, string>) => {
  const chunks: { [k: string]: string[] } = {}
  Object.keys(deps).forEach(key => {
    if (['preact'].includes(key)) return
    chunks[key] = [key]
  })
  return chunks
}

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.glb', '**/*.env'],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['preact'],
          ...renderChunks(dependencies)
        }
      }
    }
  },
  plugins: [
    eslintPlugin(),
    tsconfigPaths({ loose: true }),
    basicSsl(),
    preact()
  ],
  resolve: {
    alias: { react: 'preact/compat', 'react-dom': 'preact/compat' }
  },
  server: {
    https: true,
    open: true
  },
  preview: {
    https: true,
    open: true
  }
})
