import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('recharts')) {
            return 'recharts'
          }

          if (id.includes('victory-vendor') || id.includes('d3-')) {
            return 'chart-vendor'
          }

          if (id.includes('@react-google-maps') || id.includes('@vis.gl/react-google-maps')) {
            return 'maps'
          }

          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui'
          }

          return 'vendor'
        },
      },
    },
  },
})
