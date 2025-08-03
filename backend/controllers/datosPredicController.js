const db = require('../services/databaseService');

// Guardar datos predichos
const guardarDatosPredic = async (req, res) => {
    try {
        const {
            fecha, ph, turbidez, conductividad, tds, dureza, color, ica,
            modelo_version, confianza
        } = req.body;

        const resultado = await db.insertarDatosPrediccion({
            fecha, ph, turbidez, conductividad, tds, dureza, color, ica,
            modelo_version, confianza
        });

        console.log(`✅ Predicción guardada (${db.DATABASE_TYPE}):`, resultado);
        res.status(201).json({ 
            mensaje: '✅ Datos predichos insertados correctamente', 
            resultado,
            database: db.DATABASE_TYPE
        });
    } catch (error) {
        console.error('Error al guardar datos predichos:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            database: db.DATABASE_TYPE
        });
    }
};

// Obtener datos con paginación y búsqueda por fecha
const obtenerDatosPredic = async (req, res) => {
    try {
        const { fecha } = req.query;

        const result = await db.obtenerDatosPredicciones(fecha);
        
        console.log(`✅ Predicciones obtenidas (${db.DATABASE_TYPE}): ${result.length} registros`);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener datos predichos:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            database: db.DATABASE_TYPE
        });
    }
};


// Obtener datos predichos por rango de fechas
const obtenerDatosPredicPorRango = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({ error: "Se requieren ambas fechas: desde y hasta." });
    }

    const result = await pool.query(
      `SELECT * FROM datos_predic WHERE fecha BETWEEN $1 AND $2 ORDER BY fecha DESC`,
      [desde, hasta]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener datos por rango:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Exportar funciones usando CommonJS
module.exports = {
  guardarDatosPredic,
  obtenerDatosPredic,
  obtenerDatosPredicPorRango
};
