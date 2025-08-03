const express = require('express');
const router = express.Router();
const db = require('../services/databaseService');

// Ruta para obtener todos los datos o por fecha
router.get('/api/data', async (req, res) => {
    const { fecha, desde, hasta } = req.query;

    try {
        let result;
        
        if (desde && hasta) {
            // Obtener datos por rango de fechas
            result = await db.obtenerDatosPorRango(desde, hasta);
        } else if (fecha) {
            // Obtener datos por fecha específica
            result = await db.obtenerDatosPorFecha(fecha);
        } else {
            // Obtener todos los datos
            result = await db.obtenerTodosLosDatos();
        }

        console.log(`✅ Datos obtenidos (${db.DATABASE_TYPE}): ${result.length} registros`);
        res.json(result);
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).json({ 
            error: 'Error al obtener los datos de la base de datos.',
            database: db.DATABASE_TYPE 
        });
    }
});

// Nueva ruta para obtener datos de sensores en tiempo real
router.get('/api/sensor/:sensorId', async (req, res) => {
    const { sensorId } = req.params;
    const { limite = 10 } = req.query;

    try {
        const result = await db.obtenerUltimosDatosSensor(sensorId, parseInt(limite));
        
        console.log(`✅ Datos de sensor obtenidos (${db.DATABASE_TYPE}): ${result.length} registros`);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener datos del sensor:', error);
        res.status(500).json({ 
            error: 'Error al obtener datos del sensor.',
            database: db.DATABASE_TYPE 
        });
    }
});

module.exports = router;
