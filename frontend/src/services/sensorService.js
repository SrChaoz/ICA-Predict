// =====================================================
// SERVICIO PARA SENSORES IOT - FRONTEND
// =====================================================
// Manejo específico de datos de sensores en tiempo real
// =====================================================

import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 5000, // Timeout más corto para datos en tiempo real
});

// =====================================================
// FUNCIONES DE SENSORES IOT
// =====================================================

/**
 * Obtener últimos datos de un sensor específico
 */
export const getLatestSensorData = async (sensorId, limit = 10) => {
    try {
        const response = await api.get(`/sensor/${sensorId}/latest`, {
            params: { limite: limit }
        });
        return {
            success: true,
            data: response.data.data || [],
            sensor_id: response.data.sensor_id,
            database: response.data.database
        };
    } catch (error) {
        console.error(`Error obteniendo datos del sensor ${sensorId}:`, error);
        return {
            success: false,
            data: [],
            error: error.message
        };
    }
};

/**
 * Enviar datos desde ESP32 u otro dispositivo IoT
 */
export const sendSensorData = async (sensorData) => {
    try {
        const response = await api.post('/sensor/data', sensorData);
        return {
            success: true,
            data: response.data,
            message: response.data.mensaje
        };
    } catch (error) {
        console.error('Error enviando datos de sensor:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * Obtener lista de sensores activos
 */
export const getActiveSensors = async () => {
    try {
        // Esta funcionalidad requeriría un endpoint adicional en el backend
        const response = await api.get('/sensors/active');
        return {
            success: true,
            sensors: response.data
        };
    } catch (error) {
        console.warn('Endpoint de sensores activos no disponible:', error.message);
        return {
            success: false,
            sensors: []
        };
    }
};

// =====================================================
// SIMULADOR DE DATOS ESP32 (PARA TESTING)
// =====================================================

/**
 * Simular datos de ESP32 para testing
 */
export const simulateESP32Data = () => {
    const generateRandomValue = (min, max, decimals = 2) => {
        return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
    };

    return {
        sensor_id: 'ESP32_PRINCIPAL', // Cambiar para que coincida con el que busca el Dashboard
        ph: generateRandomValue(6.5, 8.5),
        turbidez: generateRandomValue(1, 50),
        conductividad: generateRandomValue(200, 800),
        tds: generateRandomValue(100, 500),
        dureza: generateRandomValue(80, 300),
        color: generateRandomValue(5, 100),
        temperatura: generateRandomValue(18, 30),
        oxigeno_disuelto: generateRandomValue(5, 12),
        ubicacion: 'Simulador de Pruebas - Temporal'
    };
};

/**
 * Enviar datos simulados (para testing)
 */
export const sendSimulatedData = async () => {
    const simulatedData = simulateESP32Data();
    return await sendSensorData(simulatedData);
};

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Formatear datos de sensor para mostrar
 */
export const formatSensorData = (sensorData) => {
    if (!sensorData) return null;

    return {
        ...sensorData,
        timestamp: new Date(sensorData.timestamp || sensorData.created_at).toLocaleString(),
        ph: sensorData.ph?.toFixed(2) || 'N/A',
        turbidez: sensorData.turbidez?.toFixed(2) || 'N/A',
        conductividad: sensorData.conductividad?.toFixed(0) || 'N/A',
        temperatura: sensorData.temperatura?.toFixed(1) || 'N/A',
    };
};

/**
 * Verificar si los datos del sensor están dentro de rangos normales
 */
export const validateSensorData = (data) => {
    const ranges = {
        ph: { min: 6, max: 9, unit: '' },
        turbidez: { min: 0, max: 100, unit: 'NTU' },
        conductividad: { min: 100, max: 1000, unit: 'µS/cm' },
        temperatura: { min: 15, max: 35, unit: '°C' },
        oxigeno_disuelto: { min: 4, max: 15, unit: 'mg/L' }
    };

    const alerts = [];

    Object.entries(ranges).forEach(([param, range]) => {
        const value = data[param];
        if (value !== null && value !== undefined) {
            if (value < range.min || value > range.max) {
                alerts.push({
                    parameter: param,
                    value: value,
                    range: range,
                    status: 'warning',
                    message: `${param} fuera de rango normal (${range.min}-${range.max} ${range.unit})`
                });
            }
        }
    });

    return {
        isValid: alerts.length === 0,
        alerts: alerts
    };
};
