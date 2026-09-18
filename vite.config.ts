import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
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
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="25" fill="%230b57d0"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">৳</text></svg>',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="25" fill="%230b57d0"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">৳</text></svg>',
            sizes: '512x512',
            type: 'image/svg+xml'
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
