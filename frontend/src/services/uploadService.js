import axios from 'axios';

// URL base para la subida de archivos
const BASE_URL_LOCAL = 'http://localhost:3000/api/upload';
const BASE_URL = `${import.meta.env.VITE_API_URL}/api/upload`;

export const uploadFile = async (archivo, setIsLoading) => {
    const formData = new FormData();
    formData.append('file', archivo);

    console.log('Enviando archivo:', archivo);

    setIsLoading(true);

    try {
        const response = await axios.post(BASE_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        alert(response.data.message);
    } catch (error) {
        alert("Error al subir el archivo.");
        console.error("Error al subir el archivo:", error);
    } finally {
        setIsLoading(false);
    }
};
