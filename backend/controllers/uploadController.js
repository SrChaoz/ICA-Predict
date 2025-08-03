const express = require('express');
const router = express.Router();
const db = require('../services/databaseService');
const upload = require('../middlewares/multerConfig');
const csv = require('csv-parser');
const fs = require('fs');
const moment = require('moment');

// Función para convertir valores a float y manejar NULL
const parseFloatValue = (value) => {
    console.log(` Valor recibido para conversión: "${value}"`);
    if (!value || value.trim() === '') return null;

    const parsedValue = value.replace(',', '.').trim();
    const result = parseFloat(parsedValue);

    console.log(`Valor convertido: ${result}`);
    return isNaN(result) ? null : result;
};

// Función para formatear la fecha
const formatDate = (value) => {
    console.log(` Fecha recibida para formateo: "${value}"`);
    if (!value || value.trim() === '') return null;

    const formattedDate = moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD');
    console.log(` Fecha formateada: ${formattedDate}`);
    return formattedDate;
};

// Ruta para la carga de datos desde CSV
router.post('/api/upload', upload.single('file'), async (req, res) => {
    console.log("Se recibió una solicitud de carga de archivo...");

    if (!req.file) {
        console.error(' No se recibió ningún archivo.');
        return res.status(400).json({ error: 'No se ha recibido ningún archivo.' });
    }

    const filePath = req.file.path;
    console.log(`Archivo recibido: ${req.file.originalname}`);
    console.log(` Ruta del archivo: ${filePath}`); 

    const rows = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            console.log(' Fila cruda del CSV:', row);

            const parsedRow = {
                fecha: formatDate(row['fecha']),
                ph: parseFloatValue(row['ph']),
                turbidez: parseFloatValue(row['turbidez']),
                conductividad: parseFloatValue(row['conductividad']),
                tds: parseFloatValue(row['tds']),
                dureza: parseFloatValue(row['dureza']),
                color: parseFloatValue(row['color']),
                ica: parseFloatValue(row['ica'])
            };

            console.log('Fila procesada:', parsedRow);
            rows.push(parsedRow);
        })
        .on('end', async () => {
            try {
                let insertedCount = 0;
                for (const row of rows) {
                    await db.insertarDatosCalidadAgua({
                        fecha: row.fecha,
                        ph: row.ph,
                        turbidez: row.turbidez,
                        conductividad: row.conductividad,
                        tds: row.tds,
                        dureza: row.dureza,
                        color: row.color,
                        ica: row.ica,
                        sensor_id: 'CSV_UPLOAD'
                    });
                    insertedCount++;
                }

                console.log(`✅ Inserción completa en ${db.DATABASE_TYPE}: ${insertedCount} registros`);
                res.json({ 
                    message: 'Datos subidos exitosamente.',
                    insertedCount,
                    database: db.DATABASE_TYPE
                });
            } catch (error) {
                console.error(`❌ Error al insertar los datos en ${db.DATABASE_TYPE}:`, error);
                res.status(500).json({ 
                    error: 'Error al subir los datos a la base de datos.',
                    database: db.DATABASE_TYPE
                });
            } finally {
                console.log(`🗑️ Eliminando el archivo temporal: ${filePath}`);
                fs.unlinkSync(filePath);
            }
        })
        .on('error', (error) => {
            console.error(' Error durante la lectura del archivo:', error);
            res.status(500).json({ error: 'Error al procesar el archivo CSV.' });
        });
});

module.exports = router;
