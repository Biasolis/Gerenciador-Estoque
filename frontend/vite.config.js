import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ======================================================
  // !! ADICIONAR ESTA SEÇÃO PARA O PROXY !!
  // ======================================================
  server: {
    proxy: {
      // Qualquer requisição para /api/* será redirecionada
      '/api': {
        // Endereço do seu backend local
        target: 'http://localhost:3001',
        // Necessário para requisições cross-origin (mudar o host)
        changeOrigin: true,
        // Não reescreve o path, mantém /api/... na requisição para o backend
        // rewrite: (path) => path.replace(/^\/api/, '') // -> Não usaremos rewrite neste caso
      }
    }
  }
  // ======================================================
})