// =====================================================
// SERVICIO DE BASE DE DATOS HÍBRIDO
// =====================================================
// Permite usar PostgreSQL local o Supabase según configuración
// =====================================================

const { pool, supabase, DATABASE_TYPE } = require('../config/dbConfig');

// =====================================================
// FUNCIONES PARA DATOS DE CALIDAD DEL AGUA
// =====================================================

/**
 * Obtener todos los datos de calidad del agua
 */
async function obtenerTodosLosDatos() {
    try {
        if (DATABASE_TYPE === 'local') {
            const result = await pool.query('SELECT * FROM calidad_agua ORDER BY fecha DESC');
            return result.rows;
        } else {
            const { data, error } = await supabase
                .from('calidad_agua')
                .select('*')
                .order('fecha', { ascending: false });
            
            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error al obtener todos los datos:', error);
        throw error;
    }
}

/**
 * Obtener datos por rango de fechas
 */
async function obtenerDatosPorRango(desde, hasta) {
    try {
        if (DATABASE_TYPE === 'local') {
            const result = await pool.query(
                'SELECT * FROM calidad_agua WHERE fecha BETWEEN $1 AND $2 ORDER BY fecha DESC',
                [desde, hasta]
            );
            return result.rows;
        } else {
            const { data, error } = await supabase
                .from('calidad_agua')
                .select('*')
                .gte('fecha', desde)
                .lte('fecha', hasta)
                .order('fecha', { ascending: false });
            
            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos por rango:', error);
        throw error;
    }
}

/**
 * Obtener datos por fecha específica
 */
async function obtenerDatosPorFecha(fecha, sensorId = null) {
    try {
        if (DATABASE_TYPE === 'local') {
            const result = await pool.query('SELECT * FROM obtener_datos_por_fecha($1, $2)', [fecha, sensorId]);
            return result.rows;
        } else {
            let query = supabase
                .from('calidad_agua')
                .select('*')
                .eq('fecha', fecha)
                .order('created_at', { ascending: false });
            
            if (sensorId) {
                query = query.eq('sensor_id', sensorId);
            }
            
            const { data, error } = await query;
            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error al obtener datos por fecha:', error);
        throw error;
    }
}

/**
 * Insertar datos de calidad del agua
 */
async function insertarDatosCalidadAgua(datos) {
    try {
        const {
            fecha, ph, turbidez, conductividad, tds, dureza, color, ica, sensor_id = 'MANUAL'
        } = datos;

        if (DATABASE_TYPE === 'local') {
            const result = await pool.query(
                'SELECT * FROM insertar_datos_calidad_agua($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [fecha, ph, turbidez, conductividad, tds, dureza, color, ica, sensor_id]
            );
            return result.rows[0];
        } else {
            const { data, error } = await supabase
                .from('calidad_agua')
                .insert([{
                    fecha, ph, turbidez, conductividad, tds, dureza, color, ica, sensor_id
                }])
                .select();
            
            if (error) throw error;
            return data[0];
        }
    } catch (error) {
        console.error('Error al insertar datos de calidad:', error);
        throw error;
    }
}

// =====================================================
// FUNCIONES PARA PREDICCIONES
// =====================================================

/**
 * Obtener datos de predicciones
 */
async function obtenerDatosPredicciones(fecha = null) {
    try {
        if (DATABASE_TYPE === 'local') {
            let query = 'SELECT * FROM datos_predic';
            const params = [];

            if (fecha) {
                query += ' WHERE fecha = $1';
                params.push(fecha);
            }

            query += ' ORDER BY fecha DESC';
            const result = await pool.query(query, params);
            return result.rows;
        } else {
            let query = supabase
                .from('datos_predic')
                .select('*')
                .order('fecha', { ascending: false });
            
            if (fecha) {
                query = query.eq('fecha', fecha);
            }
            
            const { data, error } = await query;
            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error al obtener predicciones:', error);
        throw error;
    }
}

/**
 * Insertar datos de predicción
 */
async function insertarDatosPrediccion(datos) {
    try {
        const {
            fecha, ph, turbidez, conductividad, tds, dureza, color, ica,
            modelo_version = 'v1.0', confianza = null
        } = datos;

        if (DATABASE_TYPE === 'local') {
            const result = await pool.query(
                'SELECT * FROM insertar_datos_predic($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                [fecha, ph, turbidez, conductividad, tds, dureza, color, ica, modelo_version, confianza]
            );
            return result.rows[0];
        } else {
            const { data, error } = await supabase
                .from('datos_predic')
                .insert([{
                    fecha, ph, turbidez, conductividad, tds, dureza, color, ica,
                    modelo_version, confianza
                }])
                .select();
            
            if (error) throw error;
            return data[0];
        }
    } catch (error) {
        console.error('Error al insertar predicción:', error);
        throw error;
    }
}

// =====================================================
// FUNCIONES PARA DATOS DE SENSORES
// =====================================================

/**
 * Insertar datos de sensor en tiempo real
 */
async function insertarDatosSensor(datos) {
    try {
        const {
            sensor_id, ph, turbidez, conductividad, tds, dureza, color,
            temperatura, oxigeno_disuelto, ubicacion
        } = datos;

        if (DATABASE_TYPE === 'local') {
            const result = await pool.query(
                'SELECT * FROM insertar_sensor_data($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                [sensor_id, ph, turbidez, conductividad, tds, dureza, color, temperatura, oxigeno_disuelto, ubicacion]
            );
            return result.rows[0];
        } else {
            const { data, error } = await supabase
                .from('sensor_data')
                .insert([{
                    sensor_id, ph, turbidez, conductividad, tds, dureza, color,
                    temperatura, oxigeno_disuelto, ubicacion
                }])
                .select();
            
            if (error) throw error;
            return data[0];
        }
    } catch (error) {
        console.error('Error al insertar datos de sensor:', error);
        throw error;
    }
}

/**
 * Obtener últimos datos de un sensor
 */
async function obtenerUltimosDatosSensor(sensorId, limite = 10) {
    try {
        if (DATABASE_TYPE === 'local') {
            const result = await pool.query(
                'SELECT * FROM obtener_ultimos_datos_sensor($1, $2)',
                [sensorId, limite]
            );
            return result.rows;
        } else {
            const { data, error } = await supabase
                .from('sensor_data')
                .select('*')
                .eq('sensor_id', sensorId)
                .order('timestamp', { ascending: false })
                .limit(limite);
            
            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error al obtener últimos datos del sensor:', error);
        throw error;
    }
}

// =====================================================
// EXPORTAR FUNCIONES
// =====================================================

module.exports = {
    // Funciones de calidad del agua
    obtenerTodosLosDatos,
    obtenerDatosPorRango,
    obtenerDatosPorFecha,
    insertarDatosCalidadAgua,
    
    // Funciones de predicciones
    obtenerDatosPredicciones,
    insertarDatosPrediccion,
    
    // Funciones de sensores
    insertarDatosSensor,
    obtenerUltimosDatosSensor,
    
    // Variable de configuración
    DATABASE_TYPE
};
