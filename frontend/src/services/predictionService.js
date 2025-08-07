import axios from 'axios';

const BASE_URL_LOCAL = 'http://localhost:3000/api/predict';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/predict`;

// Función para obtener el token del localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Configurar interceptor para incluir token en todas las peticiones
const createAuthenticatedAxios = () => {
    const instance = axios.create();
    
    instance.interceptors.request.use(
        (config) => {
            const token = getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
    
    return instance;
};

const authenticatedAxios = createAuthenticatedAxios();

// Obtener predicción enviando una fecha
export const getPrediction = async (fecha) => {
    const url = import.meta.env.PROD ? BASE_URL : BASE_URL_LOCAL;
    const response = await authenticatedAxios.post(url, { fecha });
    return response.data;
};
