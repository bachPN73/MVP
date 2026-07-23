import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
    ],
    build: {
        // Optimize chunk splitting for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    // Separate vendor chunks for better caching
                    'react-vendor': ['react', 'react-dom', 'react-router'],
                    'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
                    'ui-vendor': ['lucide-react', 'recharts', 'sonner'],
                    'radix-vendor': [
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-tooltip',
                        '@radix-ui/react-select',
                        '@radix-ui/react-tabs'
                    ],
                },
            },
        },
        // Enable source map for debugging
        sourcemap: false,
        // Optimize chunk size warnings
        chunkSizeWarningLimit: 800,
    },
    // Optimize dev server
    server: {
        warmup: {
            clientFiles: [
                './src/pages/LandingPage.tsx',
                './src/pages/LoginPage.tsx',
                './src/pages/Dashboard.tsx',
            ],
        },
    },
})
