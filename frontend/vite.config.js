import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // Cambia el directorio de salida a "build"
  },
  server: {
    port: 3001,
    host: '0.0.0.0', // Exponer a la red local
    allowedHosts: ['.ngrok-free.app','all']  //  dominio de aplicación
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
// import { getPrediction } from '../services/predictionService';
//
// const PredictionForm = () => {
//     const [fecha, setFecha] = useState('');
//     const [resultado, setResultado] = useState(null);
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const data = await getPrediction(fecha);
//             setResultado(data.prediction);
//         } catch (error) {
//             alert('Error al obtener la predicción.');
//         }
//     };