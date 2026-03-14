import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
            return 'react-vendor';
          }

          if (id.includes('/node_modules/@tanstack/')) {
            return 'query-vendor';
          }

          if (
            id.includes('/node_modules/wagmi/') ||
            id.includes('/node_modules/viem/') ||
            id.includes('/node_modules/@walletconnect/') ||
            id.includes('/node_modules/@coinbase/') ||
            id.includes('/node_modules/@safe-global/') ||
            id.includes('/node_modules/ox/') ||
            id.includes('/node_modules/mipd/') ||
            id.includes('/node_modules/@wagmi/')
          ) {
            return 'web3-vendor';
          }
        },
      },
    },
  },
});
