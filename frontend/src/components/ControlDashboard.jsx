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
  ChevronDown,
  LogOut,
  User
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
import { subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PageContainer } from './ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ToastContainer } from './ui/toast-container';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { fetchAllData } from '../services/dataService';
import { calcularICA } from '../utils/icaCalculator';
import { getLatestSensorData } from '../services/sensorService';
import LogoAquaher from "../assets/icons/IconAquaher.png";

const ControlDashboard = () => {
  const { user, logout } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const { toast, toasts, removeToast } = useToast();
  
  // Estados para datos en tiempo real (sensores)
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
  const [chartPeriod, setChartPeriod] = useState('all');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('sensores');
  const [dataFallbackMessage, setDataFallbackMessage] = useState('');

  // Función para filtrar datos por período
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
          filteredData = [...data]; // Crear una copia
        }
        break;
      }
        
      case 'week': {
        const weekAgo = subDays(now, 7);
        filteredData = data.filter(item => {
          const itemDate = new Date(item.fullDate);
          return itemDate >= weekAgo;
        });
        break;
      }
        
      case 'month': {
        const monthAgo = subDays(now, 30);
        filteredData = data.filter(item => {
          const itemDate = new Date(item.fullDate);
          return itemDate >= monthAgo;
        });
        break;
      }
        
      case 'quarter': {
        const quarterAgo = subDays(now, 90);
        filteredData = data.filter(item => {
          const itemDate = new Date(item.fullDate);
          return itemDate >= quarterAgo;
        });
        break;
      }
        
      default:
        filteredData = [...data]; // Crear una copia explícita para el caso default también
    }
    
    // Si no hay datos en el período específico, mostrar los últimos 20 registros
    if (filteredData.length === 0 && period !== 'all') {
      console.log(`⚠️ No hay datos en el período ${period}, mostrando últimos 20 registros`);
      filteredData = data.slice(-20);
    }
    
    // Para gráficos con muchos datos, reducir la densidad de puntos para mejor rendimiento
    if (filteredData.length > 50 && period !== 'week') {
      const step = Math.ceil(filteredData.length / 50);
      filteredData = filteredData.filter((_, index) => index % step === 0);
    }

    // Crear una nueva copia antes de ordenar para evitar mutación
    return [...filteredData].sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
  };

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
          // Procesar datos para gráficos - crear una copia completamente nueva
          const processedData = [...data]
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
          
          console.log('📊 Datos procesados:', processedData.slice(0, 3));
          
          // Filtrar según el período seleccionado
          const filteredData = filterDataByPeriod(processedData, chartPeriod);
          console.log('📊 Datos filtrados:', filteredData.length);
          
          // Verificar si necesitamos mostrar mensaje de fallback
          let originalFilteredData = [];
          const now = new Date();
          
          switch (chartPeriod) {
            case 'week': {
              const weekAgo = subDays(now, 7);
              originalFilteredData = processedData.filter(item => {
                const itemDate = new Date(item.fullDate);
                return itemDate >= weekAgo;
              });
              break;
            }
            case 'month': {
              const monthAgo = subDays(now, 30);
              originalFilteredData = processedData.filter(item => {
                const itemDate = new Date(item.fullDate);
                return itemDate >= monthAgo;
              });
              break;
            }
            case 'quarter': {
              const quarterAgo = subDays(now, 90);
              originalFilteredData = processedData.filter(item => {
                const itemDate = new Date(item.fullDate);
                return itemDate >= quarterAgo;
              });
              break;
            }
            default:
              originalFilteredData = processedData;
          }
          
          // Configurar mensaje de fallback si es necesario
          if (originalFilteredData.length === 0 && chartPeriod !== 'all') {
            const periodLabels = {
              'week': '7 días',
              'month': '30 días', 
              'quarter': '90 días'
            };
            setDataFallbackMessage(`No hay datos en los últimos ${periodLabels[chartPeriod] || chartPeriod}. Mostrando los últimos ${filteredData.length} registros disponibles.`);
          } else {
            setDataFallbackMessage(''); // Limpiar mensaje si hay datos del período
          }
          
          setHistoricalData([...filteredData]); // Asegurar que es una nueva referencia
          
          // Actualizar sensores con el dato más reciente
          if (processedData.length > 0) {
            const latestData = processedData[processedData.length - 1];
            setSensorData(prev => ({
              ph: { ...prev.ph, value: latestData.ph, lastUpdate: new Date(latestData.fullDate) },
              turbidez: { ...prev.turbidez, value: latestData.turbidez, lastUpdate: new Date(latestData.fullDate) },
              conductividad: { ...prev.conductividad, value: latestData.conductividad, lastUpdate: new Date(latestData.fullDate) },
              tds: { ...prev.tds, value: latestData.tds, lastUpdate: new Date(latestData.fullDate) },
              dureza: { ...prev.dureza, value: latestData.dureza, lastUpdate: new Date(latestData.fullDate) },
              color: { ...prev.color, value: latestData.color, lastUpdate: new Date(latestData.fullDate) },
              ica: { ...prev.ica, value: latestData.ica, lastUpdate: new Date(latestData.fullDate) }
            }));
          }
          
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
  }, [chartPeriod]);

  // Función para cargar datos reales de sensores IoT
  const loadSensorData = async () => {
    try {
      // Intentar obtener datos del sensor principal
      const sensorResponse = await getLatestSensorData('ESP32_PRINCIPAL', 1);
      
      if (sensorResponse.success && sensorResponse.data.length > 0) {
        const latestData = sensorResponse.data[0];
        
        setSensorData(prev => {
          const newData = {
            ph: {
              ...prev.ph,
              value: parseFloat(latestData.ph) || prev.ph.value,
              lastUpdate: new Date(latestData.timestamp || latestData.created_at)
            },
            turbidez: {
              ...prev.turbidez,
              value: parseFloat(latestData.turbidez) || prev.turbidez.value,
              lastUpdate: new Date(latestData.timestamp || latestData.created_at)
            },
            conductividad: {
              ...prev.conductividad,
              value: parseFloat(latestData.conductividad) || prev.conductividad.value,
              lastUpdate: new Date(latestData.timestamp || latestData.created_at)
            },
            tds: {
              ...prev.tds,
              value: parseFloat(latestData.tds) || prev.tds.value,
              lastUpdate: new Date(latestData.timestamp || latestData.created_at)
            },
            dureza: {
              ...prev.dureza,
              value: parseFloat(latestData.dureza) || prev.dureza.value,
              lastUpdate: new Date(latestData.timestamp || latestData.created_at)
            },
            color: {
              ...prev.color,
              value: parseFloat(latestData.color) || prev.color.value,
              lastUpdate: new Date(latestData.timestamp || latestData.created_at)
            }
          };

          // Calcular ICA automáticamente basado en los datos del sensor
          const parametrosParaICA = {
            ph: newData.ph.value,
            turbidez: newData.turbidez.value,
            conductividad: newData.conductividad.value,
            tds: newData.tds.value,
            dureza: newData.dureza.value,
            color: newData.color.value
          };

          const icaCalculado = calcularICA(parametrosParaICA);
          
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
            lastUpdate: new Date(latestData.timestamp || latestData.created_at)
          };

          return newData;
        });

        setIsOnline(true);
      } else {
        // Si no hay datos del sensor, mantener los últimos valores conocidos
        setIsOnline(false);
      }
    } catch (error) {
      console.error('❌ Error al cargar datos del sensor:', error);
      setIsOnline(false);
    }
  };

  // Cargar datos del sensor cada 10 segundos
  useEffect(() => {
    loadSensorData(); // Carga inicial
    const interval = setInterval(loadSensorData, 10000); // Cada 10 segundos

    return () => clearInterval(interval);
  }, []);  // Funciones auxiliares
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getParameterStatus = (parameter, value) => {
    const ranges = {
      ph: { excellent: [6.8, 7.2], good: [6.5, 7.5], warning: [6.0, 8.0] },
      turbidez: { excellent: [0, 10], good: [0, 20], warning: [0, 50] },
      conductividad: { excellent: [200, 600], good: [100, 800], warning: [50, 1200] },
      tds: { excellent: [100, 400], good: [50, 500], warning: [0, 800] },
      dureza: { excellent: [100, 200], good: [50, 300], warning: [0, 500] },
      color: { excellent: [0, 5], good: [0, 10], warning: [0, 20] }
    };

    const range = ranges[parameter];
    if (!range) return 'good';

    if (value >= range.excellent[0] && value <= range.excellent[1]) return 'excellent';
    if (value >= range.good[0] && value <= range.good[1]) return 'good';
    if (value >= range.warning[0] && value <= range.warning[1]) return 'warning';
    return 'danger';
  };

  const chartData = [...filterDataByPeriod(historicalData, chartPeriod)];

  // Actualizar estado de los sensores
  useEffect(() => {
    Object.keys(sensorData).forEach(key => {
      if (key !== 'ica') {
        const status = getParameterStatus(key, sensorData[key].value);
        setSensorData(prev => ({
          ...prev,
          [key]: { ...prev[key], status }
        }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorData.ph.value, sensorData.turbidez.value, sensorData.conductividad.value, sensorData.tds.value, sensorData.dureza.value, sensorData.color.value]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col min-h-screen"
      >
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center space-x-4"
              >
                <div className="p-2 bg-[#4c8cb4]/10 rounded-lg">
                  <img src={LogoAquaher} alt="AquaHer" className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Dashboard Control de Calidad
                  </h1>
                  <p className="text-sm text-gray-600">
                    Monitoreo de calidad del agua en tiempo real
                  </p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex items-center space-x-4"
              >
                <Badge 
                  variant="outline" 
                  className={isOnline 
                    ? 'text-green-600 bg-green-50 border-green-200' 
                    : 'text-orange-600 bg-orange-50 border-orange-200'
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
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.nombre}</span>
                  <Badge variant="secondary">{user?.rol}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm border border-gray-200/50">
                  <TabsTrigger 
                    value="sensores" 
                    className="flex items-center space-x-2 data-[state=active]:bg-[#4c8cb4] data-[state=active]:text-white"
                  >
                    <Activity className="h-4 w-4" />
                    <span>Sensores en Tiempo Real</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="graficas" 
                    className="flex items-center space-x-2 data-[state=active]:bg-[#4c8cb4] data-[state=active]:text-white"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Gráficas Históricas</span>
                  </TabsTrigger>
                </TabsList>
              </motion.div>

          {/* Pestaña de Sensores */}
          <TabsContent value="sensores" className="space-y-6">
            {/* Tarjetas de sensores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { key: 'ph', title: 'pH', icon: Droplets, unit: '', color: '#3b82f6', description: 'Acidez del agua' },
                { key: 'turbidez', title: 'Turbidez', icon: Eye, unit: 'NTU', color: '#eab308', description: 'Claridad del agua' },
                { key: 'conductividad', title: 'Conductividad', icon: Zap, unit: 'µS/cm', color: '#8b5cf6', description: 'Minerales disueltos' },
                { key: 'tds', title: 'TDS', icon: Layers, unit: 'mg/L', color: '#10b981', description: 'Sólidos disueltos' },
                { key: 'dureza', title: 'Dureza', icon: Beaker, unit: 'mg/L', color: '#6366f1', description: 'Dureza total' },
                { key: 'color', title: 'Color', icon: Palette, unit: 'UPC', color: '#f97316', description: 'Color aparente' }
              ].map((config, index) => {
                const data = sensorData[config.key];
                const IconComponent = config.icon;
                
                return (
                  <motion.div
                    key={config.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden h-full hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-sm border-gray-200/50">
                      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                        <IconComponent className="h-full w-full" style={{ color: config.color }} />
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" style={{ color: config.color }} />
                            <span>{config.title}</span>
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
                              {data.value.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {config.unit}
                            </span>
                          </div>
                          
                          <Badge variant="outline" className={getStatusColor(data.status)}>
                            {data.status === 'excellent' ? 'Excelente' : 
                             data.status === 'good' ? 'Bueno' : 
                             data.status === 'warning' ? 'Alerta' : 'Crítico'}
                          </Badge>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{config.description}</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(data.lastUpdate, 'HH:mm:ss', { locale: es })}
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

            {/* Tarjeta especial del ICA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-l-4 border-l-[#4c8cb4] bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-[#4c8cb4]" />
                    <span>Índice de Calidad del Agua (ICA)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-[#4c8cb4]">
                          {sensorData.ica.value.toFixed(1)}
                        </div>
                        <p className="text-lg text-gray-700">
                          {sensorData.ica.classification}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(sensorData.ica.trend)}
                        <Badge variant="outline" className={getStatusColor(sensorData.ica.status)}>
                          {sensorData.ica.value >= 85 ? 'Excelente' : 
                           sensorData.ica.value >= 70 ? 'Bueno' : 
                           sensorData.ica.value >= 50 ? 'Regular' : 'Deficiente'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Calculado en tiempo real basado en todos los parámetros
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Pestaña de Gráficas */}
          <TabsContent value="graficas" className="space-y-6">
            {/* Mensaje de fallback si no hay datos en el período */}
            {dataFallbackMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Database className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">{dataFallbackMessage}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Controles de filtrado */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <LineChart className="h-5 w-5 text-[#4c8cb4]" />
                      <span>Análisis Histórico</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {chartData.length} registros mostrados
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <label className="text-sm font-medium text-gray-700">
                      Período de visualización:
                    </label>
                    <div className="w-full sm:w-48">
                      <div className="relative">
                        <select
                          value={chartPeriod}
                          onChange={(e) => setChartPeriod(e.target.value)}
                          className="w-full bg-white/80 backdrop-blur-sm border border-gray-300 hover:border-[#4c8cb4] focus:border-[#4c8cb4] focus:ring-2 focus:ring-[#4c8cb4]/20 rounded-md px-3 py-2 text-sm appearance-none cursor-pointer transition-colors duration-200"
                        >
                          <option value="all">📊 Todos los datos</option>
                          <option value="quarter">📅 Últimos 90 días</option>
                          <option value="month">🗓️ Últimos 30 días</option>
                          <option value="week">📈 Últimos 7 días</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {isLoadingData ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#4c8cb4]" />
                    <p className="text-gray-600">Cargando datos históricos...</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {[
                  { key: 'ph', title: 'pH en el tiempo', icon: Droplets, color: '#3b82f6', type: 'line', domain: [6, 8] },
                  { key: 'turbidez', title: 'Turbidez en el tiempo', icon: Eye, color: '#eab308', type: 'area' },
                  { key: 'conductividad', title: 'Conductividad en el tiempo', icon: Zap, color: '#8b5cf6', type: 'line' },
                  { key: 'tds', title: 'TDS en el tiempo', icon: Layers, color: '#10b981', type: 'line' },
                  { key: 'dureza', title: 'Dureza en el tiempo', icon: Beaker, color: '#6366f1', type: 'area' },
                  { key: 'color', title: 'Color en el tiempo', icon: Palette, color: '#f97316', type: 'line' },
                  { key: 'ica', title: 'Índice de Calidad del Agua (ICA)', icon: BarChart3, color: '#3b82f6', type: 'area', domain: [0, 100] }
                ].map((config, index) => {
                  const IconComponent = config.icon;
                  
                  return (
                    <motion.div
                      key={config.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <IconComponent className="h-5 w-5" style={{ color: config.color }} />
                            <span>{config.title}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            {config.type === 'area' ? (
                              <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                  dataKey="fecha" 
                                  tick={{ fontSize: 12 }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                />
                                <YAxis domain={config.domain} />
                                <Tooltip 
                                  labelFormatter={(value) => `Fecha: ${value}`}
                                  formatter={(value) => [value.toFixed(config.key === 'ica' ? 1 : 2), config.key.toUpperCase()]}
                                />
                                {config.key === 'turbidez' && <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="5 5" label="Límite" />}
                                {config.key === 'dureza' && (
                                  <>
                                    <ReferenceLine y={300} stroke="#ef4444" strokeDasharray="5 5" label="Límite máx" />
                                    <ReferenceLine y={200} stroke="#f59e0b" strokeDasharray="5 5" label="Óptimo máx" />
                                  </>
                                )}
                                {config.key === 'ica' && (
                                  <>
                                    <ReferenceLine y={85} stroke="#10b981" strokeDasharray="5 5" label="No contaminado" />
                                    <ReferenceLine y={70} stroke="#3b82f6" strokeDasharray="5 5" label="Aceptable" />
                                    <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" label="Poco contaminado" />
                                    <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="5 5" label="Contaminado" />
                                  </>
                                )}
                                <Area 
                                  type="monotone" 
                                  dataKey={config.key} 
                                  stroke={config.color} 
                                  fill={config.color} 
                                  fillOpacity={0.3}
                                />
                              </AreaChart>
                            ) : (
                              <RechartsLineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                  dataKey="fecha" 
                                  tick={{ fontSize: 12 }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                />
                                <YAxis domain={config.domain} />
                                <Tooltip 
                                  labelFormatter={(value) => `Fecha: ${value}`}
                                  formatter={(value) => [value.toFixed(config.key === 'conductividad' ? 0 : config.key === 'ph' ? 2 : 1), config.key.toUpperCase()]}
                                />
                                {config.key === 'ph' && (
                                  <>
                                    <ReferenceLine y={6.5} stroke="#ef4444" strokeDasharray="5 5" label="Mín" />
                                    <ReferenceLine y={7.5} stroke="#ef4444" strokeDasharray="5 5" label="Máx" />
                                  </>
                                )}
                                {config.key === 'tds' && (
                                  <>
                                    <ReferenceLine y={500} stroke="#ef4444" strokeDasharray="5 5" label="Límite máx" />
                                    <ReferenceLine y={400} stroke="#f59e0b" strokeDasharray="5 5" label="Óptimo máx" />
                                  </>
                                )}
                                {config.key === 'color' && (
                                  <>
                                    <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="5 5" label="Límite máx" />
                                    <ReferenceLine y={10} stroke="#f59e0b" strokeDasharray="5 5" label="Bueno máx" />
                                    <ReferenceLine y={5} stroke="#10b981" strokeDasharray="5 5" label="Excelente máx" />
                                  </>
                                )}
                                <Line type="monotone" dataKey={config.key} stroke={config.color} strokeWidth={2} />
                              </RechartsLineChart>
                            )}
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </PageContainer>
    
    <ToastContainer toasts={toasts} removeToast={removeToast} />
  </motion.div>
</div>
);
};

export default ControlDashboard;
