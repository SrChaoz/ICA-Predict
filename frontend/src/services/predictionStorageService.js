import axios from 'axios';

const API_URL_LOCAL = 'http://localhost:3000/api/datos-predic';
const API_URL = `${import.meta.env.VITE_API_URL}/api/datos-predic`;

// Función para obtener el token del localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Configurar interceptor para incluir token de autenticación
const createAuthenticatedRequest = async (config) => {
    const token = getAuthToken();
    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
        };
    }
    return config;
};

export const guardarPrediccion = async (fecha, datos) => {
  try {
    const payload = {
      fecha,
      ...datos
    };
    
    // Usar la URL correcta según el entorno
    const url = import.meta.env.PROD ? API_URL : API_URL_LOCAL;
    
    // Configurar la petición con autenticación
    const config = await createAuthenticatedRequest({
      method: 'POST',
      url: url,
      data: payload
    });
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Error al guardar la predicción:', error);
    throw error;
  }
};
