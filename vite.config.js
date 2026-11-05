import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.rincondelcafe.tech',
        changeOrigin: true,
        cookieDomainRewrite: '', // la cookie queda asociada a localhost
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const cookies = proxyRes.headers['set-cookie']
            if (cookies) {
              proxyRes.headers['set-cookie'] = cookies.map((c) =>
                c.replace(/;\s*secure/i, '').replace(/;\s*samesite=\w+/i, '; SameSite=Lax')
              )
            }
          })
        },
      },
    },
  },
})
