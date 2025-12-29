import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages - change this to your repository name
  // If your repo is "santa", use "/santa/"
  // If it's a user/organization page (username.github.io), use "/"
  base: process.env.NODE_ENV === 'production' ? '/Santa_mission_control/' : '/',
})

