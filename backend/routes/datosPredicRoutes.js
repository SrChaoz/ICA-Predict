const express = require('express');
const router = express.Router();
const { guardarDatosPredic, obtenerDatosPredic, obtenerDatosPredicPorRango  } = require('../controllers/datosPredicController');
const { protegerRuta } = require('../services/authService');

// Rutas protegidas para datos de predicción
router.post('/datos-predic', protegerRuta(['operador']), guardarDatosPredic);
router.get('/datos-predic', protegerRuta(['operador', 'control_calidad']), obtenerDatosPredic);
router.get('/datos-predic/rango', protegerRuta(['operador', 'control_calidad']), obtenerDatosPredicPorRango);

module.exports = router;
