import axios from 'axios';

const API_BASE_LOCAL = 'http://localhost:3000/api/datos-predic';
const API_BASE = `${import.meta.env.VITE_API_URL}/api/datos-predic`;

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

export const fetchAllData = async () => {
  try {
    const url = import.meta.env.PROD ? API_BASE : API_BASE_LOCAL;
    const config = await createAuthenticatedRequest({});
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.error("Error al obtener todos los datos predichos:", error);
    throw error;
  }
};

export const fetchDataByDate = async (fecha) => {
  try {
    const url = import.meta.env.PROD ? API_BASE : API_BASE_LOCAL;
    const config = await createAuthenticatedRequest({});
    const response = await axios.get(`${url}?fecha=${fecha}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener datos por fecha (${fecha}):`, error);
    throw error;
  }
};

export const fetchDataByRange = async (desde, hasta) => {
  try {
    const url = import.meta.env.PROD ? API_BASE : API_BASE_LOCAL;
    const config = await createAuthenticatedRequest({});
    const response = await axios.get(`${url}/rango?desde=${desde}&hasta=${hasta}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener datos por rango (${desde} - ${hasta}):`, error);
    throw error;
  }
};

//no used
export const deleteData = async (id) => {
  try {
    const url = import.meta.env.PROD ? API_BASE : API_BASE_LOCAL;
    const config = await createAuthenticatedRequest({});
    const response = await axios.delete(`${url}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el dato con ID ${id}:`, error);
    throw error;
  }
}
export const updateData = async (id, updatedData) => {
  try {
    const url = import.meta.env.PROD ? API_BASE : API_BASE_LOCAL;
    const config = await createAuthenticatedRequest({});
    const response = await axios.put(`${url}/${id}`, updatedData, config);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el dato con ID ${id}:`, error);
    throw error;
  }
};
///////