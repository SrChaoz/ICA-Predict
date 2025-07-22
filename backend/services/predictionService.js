const axios = require('axios');
require('dotenv').config();

const MODEL_URL = process.env.MODEL_URL || 'http://localhost:5000/predict';

exports.predict = async (data) => {
    try {
        const response = await axios.post(MODEL_URL, data);

        const prediction = response.data;

        // Verificar que la respuesta es válida
        if (!prediction || typeof prediction !== 'object') {
            throw new Error('Respuesta inesperada del servidor.');
        }

        // Redondear los valores de la predicción a 2 decimales
        const resultadosRedondeados = Object.fromEntries(
            Object.entries(prediction).map(([key, value]) => [key, parseFloat(value.toFixed(2))])
        );

        return resultadosRedondeados;
    } catch (error) {
        console.error(' Error en predictionService:', error.response?.data || error.message);
        throw new Error('Error en la predicción');
    }
};
