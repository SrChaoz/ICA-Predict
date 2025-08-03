// =====================================================
// COMPONENTE PARA DATOS DE SENSORES EN TIEMPO REAL
// =====================================================
// Visualización de datos IoT del ESP8266
// =====================================================

import { useState, useEffect } from 'react';
import { getLatestSensorData } from '../services/sensorService';

const SensorDataView = ({ sensorId = 'ESP32_PRINCIPAL' }) => {
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getLatestSensorData(sensorId, 5);
            if (result.success) {
                setSensorData(result.data);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Error fetching sensor data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchDataWrapper = async () => {
            setLoading(true);
            await fetchData();
        };

        fetchDataWrapper();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sensorId]);

    // Auto-refresh cada 30 segundos (mismo intervalo que ESP8266)
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(fetchData, 30000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh]);

    const formatValue = (value, unit = '') => {
        if (typeof value === 'number') {
            return `${value.toFixed(2)} ${unit}`.trim();
        }
        return value || 'N/A';
    };

    const getStatusColor = (param, value) => {
        // Rangos óptimos para calidad del agua
        const ranges = {
            ph: { min: 6.5, max: 8.5, unit: '' },
            turbidez: { min: 0, max: 25, unit: 'NTU' },
            conductividad: { min: 200, max: 800, unit: 'µS/cm' },
            tds: { min: 100, max: 500, unit: 'ppm' },
            dureza: { min: 60, max: 300, unit: 'mg/L' },
            color: { min: 0, max: 15, unit: 'Pt-Co' },
            temperatura: { min: 18, max: 30, unit: '°C' },
            oxigeno_disuelto: { min: 5, max: 12, unit: 'mg/L' }
        };

        const range = ranges[param];
        if (!range || value === null || value === undefined) {
            return 'bg-gray-100 text-gray-700';
        }

        if (value >= range.min && value <= range.max) {
            return 'bg-green-100 text-green-700 border-green-200';
        } else {
            return 'bg-red-100 text-red-700 border-red-200';
        }
    };

    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    📡 Sensor: {sensorId}
                </h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-3 py-1 rounded text-sm ${
                            autoRefresh 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
                    </button>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
                    >
                        {loading ? '⏳' : '🔄'} Actualizar
                    </button>
                </div>
            </div>

            {lastUpdate && (
                <div className="text-xs text-gray-500 mb-4">
                    Última actualización: {lastUpdate.toLocaleTimeString()}
                </div>
            )}

            {sensorData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📡</div>
                    <p>No hay datos de sensores disponibles</p>
                    <p className="text-sm mt-2">Verificar conexión ESP8266</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sensorData.map((reading, index) => (
                        <div key={reading.id || index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-gray-600">
                                    Lectura #{reading.id || index + 1}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(reading.timestamp || reading.created_at).toLocaleString()}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className={`p-3 rounded border ${getStatusColor('ph', reading.ph)}`}>
                                    <div className="text-xs font-medium">pH</div>
                                    <div className="text-lg font-semibold">{formatValue(reading.ph)}</div>
                                </div>
                                
                                <div className={`p-3 rounded border ${getStatusColor('turbidez', reading.turbidez)}`}>
                                    <div className="text-xs font-medium">Turbidez</div>
                                    <div className="text-lg font-semibold">{formatValue(reading.turbidez, 'NTU')}</div>
                                </div>
                                
                                <div className={`p-3 rounded border ${getStatusColor('conductividad', reading.conductividad)}`}>
                                    <div className="text-xs font-medium">Conductividad</div>
                                    <div className="text-lg font-semibold">{formatValue(reading.conductividad, 'µS/cm')}</div>
                                </div>
                                
                                <div className={`p-3 rounded border ${getStatusColor('tds', reading.tds)}`}>
                                    <div className="text-xs font-medium">TDS</div>
                                    <div className="text-lg font-semibold">{formatValue(reading.tds, 'ppm')}</div>
                                </div>
                                
                                <div className={`p-3 rounded border ${getStatusColor('dureza', reading.dureza)}`}>
                                    <div className="text-xs font-medium">Dureza</div>
                                    <div className="text-lg font-semibold">{formatValue(reading.dureza, 'mg/L')}</div>
                                </div>
                                
                                <div className={`p-3 rounded border ${getStatusColor('color', reading.color)}`}>
                                    <div className="text-xs font-medium">Color</div>
                                    <div className="text-lg font-semibold">{formatValue(reading.color, 'Pt-Co')}</div>
                                </div>
                                
                                <div className={`p-3 rounded border ${getStatusColor('temperatura', reading.temperatura)}`}>
                                    <div className="text-xs font-medium">Temperatura</div>
                                    <div className="text-lg font-semibold">{formatValue(reading.temperatura, '°C')}</div>
                                </div>
                                
                                <div className={`p-3 rounded border ${getStatusColor('oxigeno_disuelto', reading.oxigeno_disuelto)}`}>
                                    <div className="text-xs font-medium">Oxígeno Disuelto</div>
                                    <div className="text-lg font-semibold">{formatValue(reading.oxigeno_disuelto, 'mg/L')}</div>
                                </div>
                            </div>
                            
                            {reading.ubicacion && (
                                <div className="mt-3 text-sm text-gray-600">
                                    📍 {reading.ubicacion}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SensorDataView;
