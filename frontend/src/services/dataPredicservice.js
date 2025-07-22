import axios from 'axios';

const API_BASE_LOCAL = 'http://localhost:3000/api/datos-predic';
const API_BASE = `${import.meta.env.VITE_API_URL}/api/datos-predic`;


export const fetchAllData = async () => {
  try {
    const response = await axios.get(API_BASE);
    return response.data;
  } catch (error) {
    console.error("Error al obtener todos los datos predichos:", error);
    throw error;
  }
};

export const fetchDataByDate = async (fecha) => {
  try {
    const response = await axios.get(`${API_BASE}?fecha=${fecha}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener datos por fecha (${fecha}):`, error);
    throw error;
  }
};

export const fetchDataByRange = async (desde, hasta) => {
  try {
    const response = await axios.get(`${API_BASE}/rango?desde=${desde}&hasta=${hasta}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener datos por rango (${desde} - ${hasta}):`, error);
    throw error;
  }
};

//no used
export const deleteData = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el dato con ID ${id}:`, error);
    throw error;
  }
}
export const updateData = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el dato con ID ${id}:`, error);
    throw error;
  }
};
///////