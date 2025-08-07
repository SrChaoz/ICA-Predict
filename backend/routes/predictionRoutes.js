const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { protegerRuta } = require('../services/authService');

// Ruta para obtener predicciones (operadores y control de calidad)
router.post('/', protegerRuta(['operador', 'control_calidad']), predictionController.getPrediction);

module.exports = router;
