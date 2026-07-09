import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor'
            if (id.includes('@supabase')) return 'supabase-vendor'
            if (id.includes('framer-motion')) return 'framer-vendor'
            return 'vendor'
          }
        },
      },
    },
  },
})
