import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'logo.png'],
      manifest: {
        name: 'Hishab AI - Personal Finance & Expense Tracker',
        short_name: 'Hishab AI',
        description: 'Google-grade ultra-fast Personal Finance Tracker for Bangladesh with Voice, Gemini Vision & Dhar-Dena Khata',
        theme_color: '#131314',
        background_color: '#131314',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 5173,
    host: true
  }
});
