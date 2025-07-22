import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Droplets, 
  Zap, 
  Thermometer, 
  Eye, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  Database,
  BarChart3,
  LineChart,
  Beaker,
  Layers,
  Palette,
  ChevronDown
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageContainer } from './ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ToastContainer } from './ui/toast-container';
import { useToast } from '../hooks/useToast';
import { fetchAllData } from '../services/dataService';
import { calcularICA } from '../utils/icaCalculator';

const Dashboard = () => {
  const { toast, toasts, removeToast } = useToast();
  
  // Estados para datos en tiempo real (mock/futuro ESP32)
  const [sensorData, setSensorData] = useState({
    ph: { value: 7.2, trend: 'up', status: 'good', lastUpdate: new Date() },
    turbidez: { value: 15, trend: 'down', status: 'excellent', lastUpdate: new Date() },
    conductividad: { value: 450, trend: 'stable', status: 'good', lastUpdate: new Date() },
    tds: { value: 320, trend: 'up', status: 'good', lastUpdate: new Date() },
    dureza: { value: 180, trend: 'stable', status: 'good', lastUpdate: new Date() },
    color: { value: 5, trend: 'down', status: 'good', lastUpdate: new Date() },
    ica: { value: 0, trend: 'stable', status: 'good', lastUpdate: new Date(), classification: 'Calculando...' }
  });
  
  // Estados para gráficos basados en datos reales
  const [historicalData, setHistoricalData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('all'); // Cambiar a 'all' por defecto
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isOnline, setIsOnline] = useState(true); // Simular conexión ESP32
  
  // Inicializar ICA al cargar el componente
  useEffect(() => {
    setSensorData(prev => {
      const parametrosParaICA = {
        ph: prev.ph.value,
        turbidez: prev.turbidez.value,
        conductividad: prev.conductividad.value,
        tds: prev.tds.value,
        dureza: prev.dureza.value,
        color: prev.color.value
      };

      const icaCalculado = calcularICA(parametrosParaICA);
      
      const getIcaClassification = (ica) => {
        if (ica >= 85) return 'No contaminado';
        if (ica >= 70) return 'Aceptable';
        if (ica >= 50) return 'Poco contaminado';
        if (ica >= 30) return 'Contaminado';
        return 'Altamente contaminado';
      };

      return {
        ...prev,
        ica: {
          ...prev.ica,
          value: icaCalculado,
          classification: getIcaClassification(icaCalculado)
        }
      };
    });
  }, []);

  // Cargar datos históricos reales
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        setIsLoadingData(true);
        const data = await fetchAllData();
        
        console.log('📊 Datos recibidos:', data);
        console.log('📊 Cantidad de registros:', data?.length);
        
        if (data && Array.isArray(data) && data.length > 0) {
          // Procesar datos para gráficos
          const processedData = data
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .map(item => ({
              fecha: format(new Date(item.fecha), 'dd/MM HH:mm', { locale: es }),
              fullDate: item.fecha,
              ph: parseFloat(item.ph) || 0,
              turbidez: parseFloat(item.turbidez) || 0,
              conductividad: parseFloat(item.conductividad) || 0,
              tds: parseFloat(item.tds) || 0,
              dureza: parseFloat(item.dureza) || 0,
              color: parseFloat(item.color) || 0,
              ica: parseFloat(item.ica) || 0
            }));
          
          console.log('📊 Datos procesados:', processedData.slice(0, 3)); // Mostrar los primeros 3 para debug
          
          // Filtrar según el período seleccionado
          const filteredData = filterDataByPeriod(processedData, chartPeriod);
          console.log('📊 Datos filtrados:', filteredData.length);
          
          setHistoricalData(filteredData);
          
          // Solo mostrar toast si realmente se cargaron datos nuevos
          if (filteredData.length > 0) {
            console.log(`✅ Datos cargados exitosamente: ${filteredData.length} registros`);
          }
        } else {
          console.log('❌ No hay datos o formato incorrecto:', data);
          setHistoricalData([]);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos históricos:', error);
        setHistoricalData([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadHistoricalData();
  }, [chartPeriod]); // Remover 'toast' de las dependencias

  // Simular actualización de sensores en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => {
        const newData = {
          ph: {
            ...prev.ph,
            value: +(prev.ph.value + (Math.random() - 0.5) * 0.2).toFixed(1),
            lastUpdate: new Date()
          },
          turbidez: {
            ...prev.turbidez,
            value: +(prev.turbidez.value + (Math.random() - 0.5) * 2).toFixed(0),
            lastUpdate: new Date()
          },
          conductividad: {
            ...prev.conductividad,
            value: +(prev.conductividad.value + (Math.random() - 0.5) * 20).toFixed(0),
            lastUpdate: new Date()
          },
          tds: {
            ...prev.tds,
            value: +(prev.tds.value + (Math.random() - 0.5) * 15).toFixed(0),
            lastUpdate: new Date()
          },
          dureza: {
            ...prev.dureza,
            value: +(prev.dureza.value + (Math.random() - 0.5) * 10).toFixed(0),
            lastUpdate: new Date()
          },
          color: {
            ...prev.color,
            value: +(prev.color.value + (Math.random() - 0.5) * 1).toFixed(1),
            lastUpdate: new Date()
          }
        };

        // Calcular ICA automáticamente basado en los otros parámetros
        const parametrosParaICA = {
          ph: newData.ph.value,
          turbidez: newData.turbidez.value,
          conductividad: newData.conductividad.value,
          tds: newData.tds.value,
          dureza: newData.dureza.value,
          color: newData.color.value
        };

        const icaCalculado = calcularICA(parametrosParaICA);
        
        // Obtener clasificación del ICA
        const getIcaClassification = (ica) => {
          if (ica >= 85) return 'No contaminado';
          if (ica >= 70) return 'Aceptable';
          if (ica >= 50) return 'Poco contaminado';
          if (ica >= 30) return 'Contaminado';
          return 'Altamente contaminado';
        };

        newData.ica = {
          ...prev.ica,
          value: icaCalculado,
          classification: getIcaClassification(icaCalculado),
          lastUpdate: new Date()
        };

        return newData;
      });
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Simular conexión intermitente del ESP32
  useEffect(() => {
    const connectionInterval = setInterval(() => {
      setIsOnline(Math.random() > 0.1); // 90% uptime
    }, 60000); // Verificar cada minuto

    return () => clearInterval(connectionInterval);
  }, []);

  // Filtrar datos por período
  const filterDataByPeriod = (data, period) => {
    if (!data || data.length === 0) return [];
    
    let filteredData = [];
    const now = new Date();
    
    switch (period) {
      case 'all': {
        // Para "todos los datos", limitar a los últimos 100 registros para mejor rendimiento
        // y tomar muestras representativas si hay muchos datos
        if (data.length > 100) {
          // Tomar una muestra representativa: últimos 50 + muestras distribuidas del resto
          const recent = data.slice(-50);
          const older = data.slice(0, -50);
          const sampleSize = Math.min(50, older.length);
          const step = Math.max(1, Math.floor(older.length / sampleSize));
          const samples = [];
          
          for (let i = 0; i < older.length; i += step) {
            samples.push(older[i]);
          }
          
          filteredData = [...samples, ...recent].sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
        } else {
          filteredData = data;
        }
        break;
      }
        
      case '24h': {
        const last24h = subDays(now, 1);
        filteredData = data.filter(item => new Date(item.fullDate) >= last24h);
        break;
      }
        
      case '7d': {
        const last7d = subDays(now, 7);
        filteredData = data.filter(item => new Date(item.fullDate) >= last7d);
        break;
      }
        
      case '30d': {
        const last30d = subDays(now, 30);
        filteredData = data.filter(item => new Date(item.fullDate) >= last30d);
        break;
      }
        
      default:
        filteredData = data.slice(-50);
    }
    
    // Si no hay datos en el período específico, mostrar los últimos 20 registros
    if (filteredData.length === 0 && period !== 'all') {
      console.log(`⚠️ No hay datos en el período ${period}, mostrando últimos 20 registros`);
      filteredData = data.slice(-20);
    }
    
    // Para gráficos con muchos datos, reducir la densidad de puntos
    if (filteredData.length > 50 && period !== '24h') {
      const step = Math.ceil(filteredData.length / 50);
      filteredData = filteredData.filter((_, index) => index % step === 0);
    }
    
    return filteredData;
  };

  // Obtener estado del sensor
  const getSensorStatus = (value, type) => {
    switch (type) {
      case 'ph':
        if (value >= 6.5 && value <= 8.5) return 'excellent';
        if (value >= 6.0 && value <= 9.0) return 'good';
        return 'warning';
      case 'ica':
        if (value >= 85) return 'excellent';
        if (value >= 70) return 'good';
        if (value >= 50) return 'warning';
        return 'danger';
      default:
        return 'good';
    }
  };

  // Obtener color según estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'danger': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Obtener icono de tendencia
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Configuración de sensores
  const sensorConfigs = [
    {
      key: 'ph',
      title: 'pH',
      icon: Thermometer,
      unit: '',
      color: '#3b82f6',
      description: 'Acidez del agua'
    },
    {
      key: 'turbidez',
      title: 'Turbidez',
      icon: Eye,
      unit: 'NTU',
      color: '#06b6d4',
      description: 'Claridad del agua'
    },
    {
      key: 'conductividad',
      title: 'Conductividad',
      icon: Zap,
      unit: 'µS/cm',
      color: '#8b5cf6',
      description: 'Minerales disueltos'
    },
    {
      key: 'tds',
      title: 'TDS',
      icon: Beaker,
      unit: 'ppm',
      color: '#f59e0b',
      description: 'Sólidos disueltos'
    },
    {
      key: 'dureza',
      title: 'Dureza',
      icon: Layers,
      unit: 'mg/L',
      color: '#ef4444',
      description: 'Dureza total'
    },
    {
      key: 'color',
      title: 'Color',
      icon: Palette,
      unit: 'Pt-Co',
      color: '#84cc16',
      description: 'Color aparente'
    },
    {
      key: 'ica',
      title: 'ICA Calculado',
      icon: BarChart3,
      unit: '',
      color: '#10b981',
      description: 'Índice automático'
    }
  ];

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#4c8cb4]/10 rounded-lg">
              <Activity className="h-6 w-6 text-[#4c8cb4]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard de Monitoreo
              </h1>
              <p className="text-gray-600">
                Monitoreo en tiempo real y análisis histórico de calidad del agua
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge 
              variant="outline" 
              className={isOnline 
                ? 'text-green-600 bg-green-50 border-green-200' 
                : 'text-red-600 bg-red-50 border-red-200'
              }
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Datos actualizados')}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualizar</span>
            </Button>
          </div>
        </div>

        {/* Cards de Sensores en Tiempo Real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sensorConfigs.map((config, index) => {
            const data = sensorData[config.key];
            const IconComponent = config.icon;
            
            return (
              <motion.div
                key={config.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={config.key === 'ica' ? 'md:col-span-2 lg:col-span-1' : ''}
              >
                <Card className="relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <IconComponent className="h-full w-full" style={{ color: config.color }} />
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {config.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(data.trend)}
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {data.value}
                        </span>
                        <span className="text-sm text-gray-500">
                          {config.unit}
                        </span>
                      </div>
                      
                      {config.key === 'ica' && (
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(getSensorStatus(data.value, 'ica'))}
                        >
                          {data.classification}
                        </Badge>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{config.description}</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(data.lastUpdate, 'HH:mm:ss')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Sección de Gráficos */}
        <div className="space-y-6">
          {/* Controles de Período */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>Análisis Histórico</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {historicalData.length} registros mostrados
                  </span>
                  {isLoadingData && (
                    <div className="flex items-center space-x-1">
                      <RefreshCw className="h-3 w-3 animate-spin text-[#4c8cb4]" />
                      <span className="text-xs text-gray-500">Cargando...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Período de visualización:
                </label>
                <div className="w-full sm:w-48">
                  <div className="relative">
                    <select
                      value={chartPeriod}
                      onChange={(e) => setChartPeriod(e.target.value)}
                      className="w-full bg-white border border-gray-300 hover:border-[#4c8cb4] focus:border-[#4c8cb4] focus:ring-2 focus:ring-[#4c8cb4]/20 rounded-md px-3 py-2 text-sm appearance-none cursor-pointer"
                    >
                      <option value="all">
                        📊 Todos los datos ({historicalData.length > 100 ? 'últimos 100' : 'todos'})
                      </option>
                      <option value="30d">📅 Últimos 30 días</option>
                      <option value="7d">🗓️ Últimos 7 días</option>
                      <option value="24h">� Últimas 24 horas</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {chartPeriod === 'all' && historicalData.length > 100 && (
                    <span className="text-amber-600">
                      ⚠️ Mostrando últimos 100 registros para mejor rendimiento
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de ICA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-[#10b981]" />
                <span>Tendencia del Índice de Calidad del Agua (ICA)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#4c8cb4] mb-2" />
                    <p className="text-gray-600">Cargando datos históricos...</p>
                  </div>
                </div>
              ) : historicalData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart 
                    data={historicalData} 
                    margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
                  >
                    <defs>
                      <linearGradient id="icaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{ fontSize: 11 }}
                      tickMargin={10}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={historicalData.length > 20 ? 'preserveStartEnd' : 0}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelFormatter={(label) => `Fecha: ${label}`}
                      formatter={(value) => [`${Number(value).toFixed(2)}`, 'ICA']}
                    />
                    <ReferenceLine y={85} stroke="#10b981" strokeDasharray="5 5" label="Excelente (85+)" />
                    <ReferenceLine y={70} stroke="#fbbf24" strokeDasharray="5 5" label="Bueno (70-84)" />
                    <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" label="Regular (50-69)" />
                    <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="5 5" label="Malo (30-49)" />
                    <Area 
                      type="monotone" 
                      dataKey="ica" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fill="url(#icaGradient)"
                      dot={historicalData.length <= 20}
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No hay datos históricos disponibles</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Otros Parámetros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-[#4c8cb4]" />
                <span>Parámetros Físico-Químicos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#4c8cb4] mb-2" />
                    <p className="text-gray-600">Cargando datos históricos...</p>
                  </div>
                </div>
              ) : historicalData.length > 0 ? (
                <ResponsiveContainer width="100%" height={450}>
                  <RechartsLineChart 
                    data={historicalData} 
                    margin={{ top: 10, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{ fontSize: 11 }}
                      tickMargin={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={historicalData.length > 30 ? 'preserveStartEnd' : Math.ceil(historicalData.length / 10)}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        maxWidth: '300px'
                      }}
                      labelFormatter={(label) => `📅 ${label}`}
                      formatter={(value, name) => {
                        const units = {
                          'pH': '',
                          'Turbidez (NTU)': ' NTU',
                          'Conductividad (µS/cm)': ' µS/cm',
                          'TDS (ppm)': ' ppm',
                          'Dureza (mg/L)': ' mg/L',
                          'Color (Pt-Co)': ' Pt-Co'
                        };
                        return [`${Number(value).toFixed(2)}${units[name] || ''}`, name];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ph" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={historicalData.length <= 20 ? { r: 3 } : false}
                      activeDot={{ r: 5, fill: '#3b82f6' }}
                      name="pH"
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="turbidez" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      dot={historicalData.length <= 20 ? { r: 3 } : false}
                      activeDot={{ r: 5, fill: '#06b6d4' }}
                      name="Turbidez (NTU)"
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conductividad" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={historicalData.length <= 20 ? { r: 3 } : false}
                      activeDot={{ r: 5, fill: '#8b5cf6' }}
                      name="Conductividad (µS/cm)"
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tds" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={historicalData.length <= 20 ? { r: 3 } : false}
                      activeDot={{ r: 5, fill: '#f59e0b' }}
                      name="TDS (ppm)"
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="dureza" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={historicalData.length <= 20 ? { r: 3 } : false}
                      activeDot={{ r: 5, fill: '#ef4444' }}
                      name="Dureza (mg/L)"
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="color" 
                      stroke="#84cc16" 
                      strokeWidth={2}
                      dot={historicalData.length <= 20 ? { r: 3 } : false}
                      activeDot={{ r: 5, fill: '#84cc16' }}
                      name="Color (Pt-Co)"
                      connectNulls={false}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No hay datos históricos disponibles</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Los gráficos se mostrarán cuando haya datos disponibles
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </PageContainer>
  );
};

export default Dashboard;
