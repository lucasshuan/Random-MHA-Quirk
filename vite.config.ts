import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fusionApiPlugin } from './vite/fusion-api-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), fusionApiPlugin()],
})
