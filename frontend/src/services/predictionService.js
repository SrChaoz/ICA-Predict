import axios from 'axios';

const BASE_URL_LOCAL = 'http://localhost:3000/api/predict';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/predict`;

// Obtener predicción enviando una fecha
export const getPrediction = async (fecha) => {
    const response = await axios.post(BASE_URL, { fecha });
    return response.data;
};
