import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

// Custom plugin to copy server files
const copyServerFiles = () => {
  return {
    name: 'copy-server-files',
    writeBundle() {
      const srcDir = resolve('src/main/server')
      const destDir = resolve('out/main')

      const copyRecursive = (src, dest) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
        const entries = fs.readdirSync(src, { withFileTypes: true })
        for (const entry of entries) {
          if (src === srcDir && entry.name === 'index.js') continue;

          const srcPath = resolve(src, entry.name)
          const destPath = resolve(dest, entry.name) 
          if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath)
          } else {
            fs.copyFileSync(srcPath, destPath)
          }
        }
      }
      try {
        copyRecursive(srcDir, destDir)
        console.log('Server files copied successfully')
      } catch (e) {
        console.error('Failed to copy server files:', e)
      }
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copyServerFiles()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      react(),
      tailwindcss()
    ]
  }
})