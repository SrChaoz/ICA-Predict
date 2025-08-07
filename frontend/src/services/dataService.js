import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Función para obtener el token del localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Configurar axios con interceptors para debug y autenticación
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// Interceptor para incluir token de autenticación
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para debug en desarrollo
if (import.meta.env.VITE_ENVIRONMENT === 'development') {
    api.interceptors.response.use(
        (response) => {
            console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.data);
            return response;
        },
        (error) => {
            console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error);
            return Promise.reject(error);
        }
    );
}

// =====================================================
// FUNCIONES DE DATOS DE CALIDAD DEL AGUA
// =====================================================

// Obtener todos los datos
export const fetchAllData = async () => {
    const response = await api.get('/data');
    return response.data;
};

// Obtener datos por fecha
export const fetchDataByDate = async (fecha) => {
    const response = await api.get('/data', { params: { fecha } });
    return response.data;
};

// Obtener datos por rango de fechas
export const fetchDataByRange = async (desde, hasta) => {
    try {
        const response = await api.get('/data', { params: { desde, hasta } });
        return response.data;
    } catch (error) {
        console.error("Error al obtener datos por rango:", error);
        return [];
    }
};

// =====================================================
// NUEVAS FUNCIONES PARA SENSORES IOT
// =====================================================

// Obtener datos de un sensor específico
export const fetchSensorData = async (sensorId, limite = 10) => {
    try {
        const response = await api.get(`/sensor/${sensorId}/latest`, { params: { limite } });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener datos del sensor ${sensorId}:`, error);
        return { sensor_id: sensorId, data: [] };
    }
};

// Enviar datos de sensor IoT
export const sendSensorData = async (sensorData) => {
    try {
        const response = await api.post('/sensor/data', sensorData);
        return response.data;
    } catch (error) {
        console.error("Error enviando datos de sensor:", error);
        throw error;
    }
};

// =====================================================
// FUNCIONES DE INFORMACIÓN DEL SISTEMA
// =====================================================

// Obtener información del sistema
export const fetchSystemInfo = async () => {
    try {
        const response = await api.get('/info');
        return response.data;
    } catch (error) {
        console.error("Error obteniendo info del sistema:", error);
        return { mensaje: 'Error de conexión', database: 'unknown' };
    }
};
