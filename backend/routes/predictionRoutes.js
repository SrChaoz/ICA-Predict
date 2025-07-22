const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

// Ruta para obtener predicciones
router.post('/', predictionController.getPrediction);

module.exports = router;
