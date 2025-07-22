const express = require('express');
const router = express.Router();
const { guardarDatosPredic, obtenerDatosPredic, obtenerDatosPredicPorRango  } = require('../controllers/datosPredicController');

router.post('/datos-predic', guardarDatosPredic);
router.get('/datos-predic', obtenerDatosPredic);
router.get('/datos-predic/rango', obtenerDatosPredicPorRango);


module.exports = router;
