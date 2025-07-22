const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento temporal en el sistema de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(' Guardando archivo temporalmente en: ./uploads');
        cb(null, './uploads');  // Carpeta donde se guardarán temporalmente los archivos
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname); // Obtiene la extensión del archivo
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
        console.log(`Archivo recibido: ${file.originalname} → Renombrado a: ${uniqueName}`);
        cb(null, uniqueName);
    }
});

// Filtro para aceptar solo archivos CSV
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.mimetype)) {
        console.error('Archivo rechazado. Tipo no permitido:', file.mimetype);
        return cb(new Error('Tipo de archivo no permitido. Solo se aceptan archivos CSV.'));
    }
    cb(null, true); // Aceptar archivo
};

// límites de tamaño 
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10 MB
});

module.exports = upload;
