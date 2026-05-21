import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig(() => {
  const port = Number(process.env.PORT) || 3000;
  const hmrPort = Number(process.env.VITE_HMR_PORT) || 24678;
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port,
      hmr: { port: hmrPort },
    },
  };
});
