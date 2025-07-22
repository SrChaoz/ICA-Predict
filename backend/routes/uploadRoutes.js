const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multerConfig'); 
const uploadCSV = require('../controllers/uploadController'); // Función para subir CSV

// Ruta para subir archivos
router.post('/api/upload', upload.single('file'), uploadCSV);

module.exports = router;
