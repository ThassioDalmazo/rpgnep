
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo atual
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Mapeamento das chaves do .env para process.env
      'process.env.FIREBASE_API_KEY': JSON.stringify(env.VITE_API_KEY),
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
      
      // Outras configs do Firebase
      'process.env.AUTH_DOMAIN': JSON.stringify(env.VITE_AUTH_DOMAIN),
      'process.env.DATABASE_URL': JSON.stringify(env.VITE_DATABASE_URL),
      'process.env.PROJECT_ID': JSON.stringify(env.VITE_PROJECT_ID),
      'process.env.STORAGE_BUCKET': JSON.stringify(env.VITE_STORAGE_BUCKET),
      'process.env.MESSAGING_SENDER_ID': JSON.stringify(env.VITE_MESSAGING_SENDER_ID),
      'process.env.APP_ID': JSON.stringify(env.VITE_APP_ID),
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    server: {
      port: 3000,
      // Liberação do domínio para o Cloudflare Tunnel
      allowedHosts: [
        'rpgnep.com.br',
        'www.rpgnep.com.br'
      ],
      // Configuração para o Google Auth
      headers: {
        "Cross-Origin-Opener-Policy": "unsafe-none",
        "Cross-Origin-Embedder-Policy": "unsafe-none"
      }
    }
  }
})
