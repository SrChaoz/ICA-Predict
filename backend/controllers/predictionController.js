const predictionService = require('../services/predictionService');

exports.getPrediction = async (req, res) => {
    const { fecha } = req.body;

    if (!fecha) {
        return res.status(400).json({ error: "La fecha es obligatoria" });
    }

    try {
        const predictionResult = await predictionService.predict({ fecha });  // Enviar solo la fecha
        res.json({ prediction: predictionResult });
    } catch (error) {
        console.error('Error en el controlador:', error);
        res.status(500).json({ error: "Error en la predicción" });
    }
};
// Compare this snippet from backend/services/predictionService.js:
// const axios = require('axios');
//
// exports.predict = async (data) => {                  
//     try {
//         const response = await axios.post('http://localhost:5000/predict', data);
//         return response.data;
//     } catch (error) {
//         console.error('Error en predictionService:', error);
//         throw new Error('Error en la predicción');
//     }            
// };