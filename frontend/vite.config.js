import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const frontendRoot = dirname(fileURLToPath(import.meta.url))

function apiProxyTarget(value) {
  if (!value) return undefined
  try {
    return new URL(value).origin
  } catch {
    return undefined
  }
}

export default defineConfig(({ mode }) => {
  const frontendEnv = loadEnv(mode, frontendRoot, 'VITE_')
  const backendRoot = resolve(frontendRoot, '../backend')
  const backendEnv = { ...loadEnv(mode, backendRoot, ''), ...process.env }
  const proxyTarget = apiProxyTarget(
    frontendEnv.VITE_API_URL || backendEnv.API_BASE_URL || backendEnv.APP_URL,
  )
  const proxy = proxyTarget ? {
    '/api': { target: proxyTarget, changeOrigin: true },
    '/health': { target: proxyTarget, changeOrigin: true },
  } : undefined

  return {
    plugins: [react(), tailwindcss()],
    server: proxy ? { proxy } : {},
    preview: proxy ? { proxy } : {},
    build: {
      target: 'es2020',
      minify: 'esbuild',
      cssMinify: false,
      sourcemap: false,
      reportCompressedSize: false,
    },
  }
})
