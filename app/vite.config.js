import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false,
    // Security: Disable host exposure by default
    host: 'localhost',
    // Security: HTTPS in production
    https: false,
    // Security: Configure headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },
  build: {
    // Security: Minimize output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true // Remove debugger statements
      }
    },
    // Generate source maps for debugging (disable in production)
    sourcemap: false,
    // Set output directory
    outDir: 'dist',
    // Asset inline limit
    assetsInlineLimit: 4096
  },
  // Security: Environment variable prefix
  envPrefix: 'VITE_',
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: 'localhost'
  }
})
