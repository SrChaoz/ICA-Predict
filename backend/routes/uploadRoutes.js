const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig'); 
const uploadCSV = require('../controllers/uploadController'); // Función para subir CSV
const { protegerRuta } = require('../services/authService');

// Ruta para subir archivos - solo operadores pueden subir datos
router.post('/api/upload', protegerRuta(['operador']), upload.single('file'), uploadCSV);

module.exports = router;
