import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, CalendarRange, Loader2, AlertCircle, FileX, Filter, Info, Database, RefreshCw, Eye } from 'lucide-react';
import { fetchAllData, fetchDataByDate, fetchDataByRange } from '../services/dataService';
import { PageContainer } from './ui/layout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DatePicker, DateRangePicker } from './ui/datepicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Pagination } from './ui/pagination';
import { ToastContainer } from './ui/toast-container';
import { useToast } from '../hooks/useToast';

const DataView = () => {
  const { toast, toasts, removeToast } = useToast();
  const [fecha, setFecha] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [searchMode, setSearchMode] = useState('single'); // 'single' o 'range'
  // eslint-disable-next-line no-unused-vars
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showIcaLegend, setShowIcaLegend] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchModeOpen, setSearchModeOpen] = useState(false);

  // Configuración de paginación
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAllData();
        if (response && response.length > 0) {
          setAllData(response);
          setFilteredData(response);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        // Mostrar error se maneja en un useEffect separado
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Efecto separado para mostrar toast de error en la carga inicial
  useEffect(() => {
    if (!isLoading && filteredData.length === 0 && !searchPerformed) {
      // Si no hay datos y no se ha realizado búsqueda, podría ser un error de carga
      // pero no mostramos toast aquí para evitar spam de notificaciones
    }
  }, [isLoading, filteredData.length, searchPerformed]);

  // Función para obtener el color del ICA
  const getIcaColor = (ica) => {
    if (ica <= 50) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (ica <= 100) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (ica <= 150) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (ica <= 200) return 'text-red-600 bg-red-50 border-red-200';
    if (ica <= 300) return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-red-900 bg-red-100 border-red-300';
  };

  // Función para obtener la clasificación del ICA
  const getIcaClassification = (ica) => {
    if (ica <= 50) return 'Buena';
    if (ica <= 100) return 'Moderada';
    if (ica <= 150) return 'Dañina para grupos sensibles';
    if (ica <= 200) return 'Dañina';
    if (ica <= 300) return 'Muy dañina';
    return 'Peligrosa';
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Función para buscar por fecha única
  const handleSingleDateSearch = async () => {
    if (!fecha) {
      toast.error('Por favor, selecciona una fecha');
      return;
    }

    try {
      setIsLoading(true);
      setSearchPerformed(true);
      const response = await fetchDataByDate(fecha);
      
      if (response && response.length > 0) {
        setFilteredData(response);
        setCurrentPage(1);
        toast.success(`Se encontraron ${response.length} registros`);
      } else {
        setFilteredData([]);
        toast.info('No se encontraron datos para la fecha seleccionada');
      }
    } catch (error) {
      console.error('Error en búsqueda por fecha:', error);
      toast.error('Error al buscar datos por fecha');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para buscar por rango de fechas
  const handleRangeSearch = async () => {
    if (!fechaDesde || !fechaHasta) {
      toast.error('Por favor, selecciona ambas fechas del rango');
      return;
    }

    if (new Date(fechaDesde) > new Date(fechaHasta)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    try {
      setIsLoading(true);
      setSearchPerformed(true);
      const response = await fetchDataByRange(fechaDesde, fechaHasta);
      
      if (response && response.length > 0) {
        setFilteredData(response);
        setCurrentPage(1);
        toast.success(`Se encontraron ${response.length} registros`);
      } else {
        setFilteredData([]);
        toast.info('No se encontraron datos en el rango seleccionado');
      }
    } catch (error) {
      console.error('Error en búsqueda por rango:', error);
      toast.error('Error al buscar datos por rango de fechas');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para mostrar todos los datos
  const handleShowAll = async () => {
    try {
      setIsLoading(true);
      setSearchPerformed(false);
      const response = await fetchAllData();
      
      if (response && response.length > 0) {
        setAllData(response);
        setFilteredData(response);
        setCurrentPage(1);
        // Limpiar filtros
        setFecha('');
        setFechaDesde('');
        setFechaHasta('');
        toast.success(`Se cargaron ${response.length} registros`);
      }
    } catch (error) {
      console.error('Error al cargar todos los datos:', error);
      toast.error('Error al cargar todos los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cambiar página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedRow(null);
  };

  // Función para cambiar modo de búsqueda
  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    setSearchModeOpen(false);
    // Limpiar filtros al cambiar modo
    setFecha('');
    setFechaDesde('');
    setFechaHasta('');
  };

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
              <Database className="h-6 w-6 text-[#4c8cb4]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Visualización de Datos
              </h1>
              <p className="text-gray-600">
                Consulta y analiza los datos históricos de calidad del agua
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowIcaLegend(!showIcaLegend)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Info className="h-4 w-4" />
            <span>Leyenda ICA</span>
          </Button>
        </div>

        {/* Leyenda ICA */}
        <AnimatePresence>
          {showIcaLegend && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Leyenda del Índice de Calidad del Agua (ICA)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { range: '0-50', label: 'Buena', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                      { range: '51-100', label: 'Moderada', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
                      { range: '101-150', label: 'Dañina para grupos sensibles', color: 'text-orange-600 bg-orange-50 border-orange-200' },
                      { range: '151-200', label: 'Dañina', color: 'text-red-600 bg-red-50 border-red-200' },
                      { range: '201-300', label: 'Muy dañina', color: 'text-purple-600 bg-purple-50 border-purple-200' },
                      { range: '300+', label: 'Peligrosa', color: 'text-red-900 bg-red-100 border-red-300' }
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <Badge variant="outline" className={`${item.color} mb-2 w-full justify-center`}>
                          {item.range}
                        </Badge>
                        <p className="text-xs text-gray-600">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros de Búsqueda</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selector de modo de búsqueda */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Modo de búsqueda
              </label>
              <Select>
                <SelectTrigger
                  open={searchModeOpen}
                  onToggle={() => setSearchModeOpen(!searchModeOpen)}
                  className="w-full md:w-64"
                >
                  <SelectValue>
                    {searchMode === 'single' ? (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Fecha específica</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CalendarRange className="h-4 w-4" />
                        <span>Rango de fechas</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent open={searchModeOpen}>
                  <SelectItem
                    selected={searchMode === 'single'}
                    onSelect={() => handleSearchModeChange('single')}
                  >
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha específica</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    selected={searchMode === 'range'}
                    onSelect={() => handleSearchModeChange('range')}
                  >
                    <div className="flex items-center space-x-2">
                      <CalendarRange className="h-4 w-4" />
                      <span>Rango de fechas</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos de fecha según el modo */}
            <div className="flex flex-col md:flex-row gap-4">
              {searchMode === 'single' ? (
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Fecha específica
                  </label>
                  <DatePicker
                    value={fecha}
                    onChange={setFecha}
                    placeholder="Seleccionar fecha"
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Rango de fechas
                  </label>
                  <DateRangePicker
                    startDate={fechaDesde}
                    endDate={fechaHasta}
                    onStartDateChange={setFechaDesde}
                    onEndDateChange={setFechaHasta}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={searchMode === 'single' ? handleSingleDateSearch : handleRangeSearch}
                disabled={isLoading}
                variant="aqua"
                className="bg-[#4c8cb4] hover:bg-[#3e7296] text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Buscar
              </Button>
              
              <Button
                onClick={handleShowAll}
                variant="outline"
                disabled={isLoading}
                className="border-[#4c8cb4] text-[#4c8cb4] hover:bg-[#4c8cb4] hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Mostrar todos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de datos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Datos de Calidad del Agua</span>
              </CardTitle>
              {filteredData.length > 0 && (
                <Badge variant="outline">
                  {filteredData.length} registro{filteredData.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#4c8cb4]" />
                  <p className="text-gray-600">Cargando datos...</p>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <FileX className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchPerformed ? 'No se encontraron datos' : 'Sin datos disponibles'}
                    </h3>
                    <p className="text-gray-600">
                      {searchPerformed
                        ? 'Intenta modificar los criterios de búsqueda'
                        : 'No hay datos disponibles en este momento'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tabla */}
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Fecha</TableHead>
                        <TableHead className="font-semibold">pH</TableHead>
                        <TableHead className="font-semibold">Turbidez</TableHead>
                        <TableHead className="font-semibold">Conductividad</TableHead>
                        <TableHead className="font-semibold">TDS</TableHead>
                        <TableHead className="font-semibold">Dureza</TableHead>
                        <TableHead className="font-semibold">Color</TableHead>
                        <TableHead className="font-semibold text-center">ICA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {currentItems.map((item, index) => (
                          <motion.tr
                            key={item.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                              selectedRow === index ? 'bg-[#4c8cb4]/5 border-l-4 border-[#4c8cb4]' : ''
                            }`}
                            onClick={() => setSelectedRow(selectedRow === index ? null : index)}
                          >
                            <TableCell className="font-medium">
                              {formatDate(item.fecha)}
                            </TableCell>
                            <TableCell>{item.ph?.toFixed(2) || 'N/A'}</TableCell>
                            <TableCell>{item.turbidez?.toFixed(1) || 'N/A'}</TableCell>
                            <TableCell>{item.conductividad?.toFixed(2) || 'N/A'}</TableCell>
                            <TableCell>{item.tds?.toFixed(0) || 'N/A'}</TableCell>
                            <TableCell>{item.dureza?.toFixed(1) || 'N/A'}</TableCell>
                            <TableCell>{item.color?.toFixed(0) || 'N/A'}</TableCell>
                            <TableCell className="text-center">
                              {item.ica ? (
                                <div className="space-y-1">
                                  <Badge
                                    variant="outline"
                                    className={getIcaColor(item.ica)}
                                  >
                                    {item.ica.toFixed(0)}
                                  </Badge>
                                  <div className="text-xs text-gray-500">
                                    {getIcaClassification(item.ica)}
                                  </div>
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredData.length)} de {filteredData.length} registros
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </PageContainer>
  );
};

export default DataView;
