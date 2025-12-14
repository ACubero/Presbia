import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ''); // Nota: cambié '.' por process.cwd() por seguridad
    return {
      // AÑADE ESTO: Hace que los enlaces a JS/CSS sean relativos
      base: './', 
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // OJO: Esto "quema" la clave en el código al momento de hacer BUILD.
        // Asegúrate de que la variable de entorno exista en la máquina que hace el build.
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});