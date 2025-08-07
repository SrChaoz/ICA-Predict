const express = require('express');
const router = express.Router();
const db = require('../services/databaseService');
const { protegerRuta } = require('../services/authService');

// Ruta para recibir datos de sensores IoT (ESP32) - pública para sensores
router.post('/api/sensor/data', async (req, res) => {
    try {
        const {
            sensor_id, ph, turbidez, conductividad, tds, dureza, color,
            temperatura, oxigeno_disuelto, ubicacion
        } = req.body;

        // Validar que al menos sensor_id esté presente
        if (!sensor_id) {
            return res.status(400).json({
                error: 'sensor_id es requerido',
                database: db.DATABASE_TYPE
            });
        }

        const resultado = await db.insertarDatosSensor({
            sensor_id, ph, turbidez, conductividad, tds, dureza, color,
            temperatura, oxigeno_disuelto, ubicacion
        });

        console.log(`✅ Datos de sensor guardados (${db.DATABASE_TYPE}):`, resultado);
        res.status(201).json({
            mensaje: '✅ Datos de sensor insertados correctamente',
            resultado,
            database: db.DATABASE_TYPE
        });
    } catch (error) {
        console.error('Error al guardar datos de sensor:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            database: db.DATABASE_TYPE
        });
    }
});

// Ruta para obtener datos de un sensor específico - protegida
router.get('/api/sensor/:sensorId/latest', protegerRuta(['operador', 'control_calidad']), async (req, res) => {
    try {
        const { sensorId } = req.params;
        const { limite = 10 } = req.query;

        const result = await db.obtenerUltimosDatosSensor(sensorId, parseInt(limite));

        console.log(`✅ Últimos datos de sensor obtenidos (${db.DATABASE_TYPE}): ${result.length} registros`);
        res.json({
            sensor_id: sensorId,
            data: result,
            database: db.DATABASE_TYPE
        });
    } catch (error) {
        console.error('Error al obtener datos del sensor:', error);
        res.status(500).json({
            error: 'Error al obtener datos del sensor',
            database: db.DATABASE_TYPE
        });
    }
});

// Ruta para insertar datos procesados en calidad_agua (desde frontend) - protegida
router.post('/api/data', protegerRuta(['operador']), async (req, res) => {
    try {
        const {
            fecha, ph, turbidez, conductividad, tds, dureza, color, ica, sensor_id = 'MANUAL'
        } = req.body;

        const resultado = await db.insertarDatosCalidadAgua({
            fecha, ph, turbidez, conductividad, tds, dureza, color, ica, sensor_id
        });

        console.log(`✅ Datos de calidad guardados (${db.DATABASE_TYPE}):`, resultado);
        res.status(201).json({
            mensaje: '✅ Datos de calidad insertados correctamente',
            resultado,
            database: db.DATABASE_TYPE
        });
    } catch (error) {
        console.error('Error al guardar datos de calidad:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            database: db.DATABASE_TYPE
        });
    }
});

module.exports = router;
