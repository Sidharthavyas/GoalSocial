import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            external: [
                '@capgo/capacitor-updater',
                '@capacitor/core',
                '@capacitor/push-notifications'
            ],
            output: {
                manualChunks: undefined,
                globals: {
                    '@capgo/capacitor-updater': 'CapacitorUpdater',
                    '@capacitor/core': 'Capacitor',
                    '@capacitor/push-notifications': 'PushNotifications'
                }
            }
        }
    }
})
