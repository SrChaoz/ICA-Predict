import axios from 'axios';

// URL base para la subida de archivos
const BASE_URL_LOCAL = 'http://localhost:3000/api/upload';
const BASE_URL = `${import.meta.env.VITE_API_URL}/api/upload`;

// Función para obtener el token del localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

export const uploadFile = async (archivo, setIsLoading) => {
    const formData = new FormData();
    formData.append('file', archivo);

    console.log('Enviando archivo:', archivo);

    setIsLoading(true);

    try {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'multipart/form-data'
        };
        
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const url = import.meta.env.PROD ? BASE_URL : BASE_URL_LOCAL;
        const response = await axios.post(url, formData, { headers });
        alert(response.data.message);
    } catch (error) {
        alert("Error al subir el archivo.");
        console.error("Error al subir el archivo:", error);
    } finally {
        setIsLoading(false);
    }
};
