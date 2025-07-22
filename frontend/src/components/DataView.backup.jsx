"use client"

import { useState, useEffect } from "react"
import { fetchAllData, fetchDataByDate, fetchDataByRange } from "../services/dataService"
import { Database, Search, Calendar, ChevronLeft, ChevronRight, RefreshCw, CalendarRange, Info } from "lucide-react"

const DataView = () => {
  const [fecha, setFecha] = useState("")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [searchMode, setSearchMode] = useState("single") // "single" o "range"
  const [allData, setAllData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showIcaLegend, setShowIcaLegend] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  // Configuración de paginación
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAllData()
        setAllData(data)
        setFilteredData(data)
      } catch (err) {
        console.error("Error al cargar los datos:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Función para colorear el ICA
  const getColorICA = (valor) => {
    if (valor >= 85) return "bg-green-500 text-white"
    if (valor >= 70) return "bg-green-300 text-black"
    if (valor >= 50) return "bg-yellow-300 text-black"
    if (valor >= 30) return "bg-orange-400 text-black"
    return "bg-red-500 text-white"
  }

  // Manejar cambio de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    setSelectedRow(null) // Cerrar detalles al cambiar de página
  }

  // Cambiar modo de búsqueda
  const toggleSearchMode = (mode) => {
    setSearchMode(mode)
    // Limpiar campos al cambiar de modo
    setFecha("")
    setFechaDesde("")
    setFechaHasta("")
  }

  // Buscar por fecha o rango
  const handleSearch = async () => {
    if (searchMode === "single" && !fecha) {
      alert("Por favor ingresa una fecha válida.")
      return
    }

    if (searchMode === "range" && (!fechaDesde || !fechaHasta)) {
      alert("Por favor ingresa un rango de fechas válido.")
      return
    }

    if (searchMode === "range" && fechaDesde > fechaHasta) {
      alert("La fecha inicial no puede ser posterior a la fecha final.")
      return
    }

    setIsLoading(true)
    setSearchPerformed(true)
    setCurrentPage(1) // Resetear a la primera página al realizar una nueva búsqueda
    setSelectedRow(null) // Cerrar detalles al realizar una nueva búsqueda

    try {
      let data = []

      if (searchMode === "single") {
        data = await fetchDataByDate(fecha)
        if (data.length === 0) {
          alert("No se encontraron datos para la fecha seleccionada.")
        } else {
          setFilteredData(data)
        }
      } else {
        data = await fetchDataByRange(fechaDesde, fechaHasta)
        if (data.length === 0) {
          alert("No se encontraron datos para el rango de fechas seleccionado.")
        } else {
          setFilteredData(data)
        }
      }
    } catch (err) {
      alert("Error al obtener los datos.")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Limpiar búsqueda y mostrar todos los datos
  const handleClearSearch = () => {
    setFecha("")
    setFechaDesde("")
    setFechaHasta("")
    setFilteredData(allData)
    setSearchPerformed(false)
    setCurrentPage(1)
    setSelectedRow(null) // Cerrar detalles al limpiar búsqueda
  }

  // Obtener mensaje de resultados
  const getResultsMessage = () => {
    if (isLoading) return "Cargando datos..."
    if (!searchPerformed) return `Total de registros: ${filteredData.length}`

    if (searchMode === "single") {
      return `Resultados para ${fecha}: ${filteredData.length}`
    } else {
      return `Resultados desde ${fechaDesde} hasta ${fechaHasta}: ${filteredData.length}`
    }
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  // Formatear número
  const formatNumber = (value, decimals = 2) => {
    if (value != null && typeof value === "number") {
      return value.toFixed(decimals)
    }
    return "N/A"
  }

  // Manejar selección de fila para vista móvil
  const toggleRowDetails = (index) => {
    setSelectedRow(selectedRow === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4c8cb4]/10 via-[#74ab3c]/10 to-[#7eb53c]/10 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
              📋 Visualizar Datos
            </h2>

            {/* Selector de modo de búsqueda */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => toggleSearchMode("single")}
                  className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-l-lg border ${
                    searchMode === "single"
                      ? "bg-[#7eb53c] text-white border-[#7eb53c]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 inline-block mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Fecha</span> Específica
                </button>
                <button
                  type="button"
                  onClick={() => toggleSearchMode("range")}
                  className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-r-lg border ${
                    searchMode === "range"
                      ? "bg-[#4c8cb4] text-white border-[#4c8cb4]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <CalendarRange className="h-3 w-3 sm:h-4 sm:w-4 inline-block mr-1 sm:mr-2" />
                  Rango <span className="hidden xs:inline">de Fechas</span>
                </button>
              </div>
            </div>

            {/* Formulario de búsqueda */}
            <div className="flex flex-col md:flex-row md:items-end gap-3 sm:gap-4 mb-6 sm:mb-8">
              {searchMode === "single" ? (
                <div className="flex-1">
                  <label
                    htmlFor="date-input"
                    className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-[#7eb53c]" />
                    Filtrar por Fecha
                  </label>
                  <input
                    id="date-input"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7eb53c] focus:border-transparent text-sm"
                  />
                </div>
              ) : (
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label
                      htmlFor="date-from"
                      className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-[#4c8cb4]" />
                      Desde
                    </label>
                    <input
                      id="date-from"
                      type="date"
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4c8cb4] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="date-to"
                      className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
                    >
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-[#4c8cb4]" />
                      Hasta
                    </label>
                    <input
                      id="date-to"
                      type="date"
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4c8cb4] focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className={`${
                    searchMode === "single"
                      ? "bg-[#7eb53c] hover:bg-[#7eb53c]/90"
                      : "bg-[#4c8cb4] hover:bg-[#4c8cb4]/90"
                  } text-white py-2 sm:py-3 px-4 sm:px-6 rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-2 disabled:opacity-50 text-xs sm:text-sm`}
                  disabled={isLoading}
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  {isLoading ? "Buscando..." : "Buscar"}
                </button>
                {searchPerformed && (
                  <button
                    onClick={handleClearSearch}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden xs:inline">Mostrar Todo</span>
                    <span className="xs:hidden">Todo</span>
                  </button>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 sm:h-5 sm:w-5 text-[#7eb53c]" />
                  <span className="font-medium text-xs sm:text-sm">{getResultsMessage()}</span>
                </div>
                <button
                  onClick={() => setShowIcaLegend(!showIcaLegend)}
                  className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 hover:text-gray-900"
                >
                  <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Leyenda ICA</span>
                  <span className="xs:hidden">ICA</span>
                </button>
              </div>

              {/* Leyenda del ICA (colapsable) */}
              {showIcaLegend && (
                <div className="mb-4 bg-gray-50 p-3 rounded-lg border text-xs sm:text-sm">
                  <h3 className="text-sm sm:text-base font-medium mb-2">📋 Índice de Calidad del Agua (ICA)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
                      <span>No contaminado (85-100)</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-300 rounded-full"></div>
                      <span>Aceptable (70-84)</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-300 rounded-full"></div>
                      <span>Poco contaminado (50-69)</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-400 rounded-full"></div>
                      <span>Contaminado (30-49)</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
                      <span>Altamente contaminado (0-29)</span>
                    </div>
                  </div>
                </div>
              )}

              {filteredData.length > 0 ? (
                <>
                  {/* Tabla para pantallas medianas y grandes */}
                  <div className="hidden md:block rounded-md border overflow-x-auto shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            pH
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Turbidez
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Conductividad
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            TDS
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dureza
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Color
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ICA
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-4 text-center text-sm text-gray-500">
                              Cargando datos...
                            </td>
                          </tr>
                        ) : currentItems.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-4 text-center text-sm text-gray-500">
                              No hay datos disponibles
                            </td>
                          </tr>
                        ) : (
                          currentItems.map((dato, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(dato.fecha)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatNumber(dato.ph)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {dato.turbidez ?? "N/A"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {dato.conductividad ?? "N/A"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{dato.tds ?? "N/A"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {dato.dureza ?? "N/A"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {dato.color ?? "N/A"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`${getColorICA(dato.ica)} px-2 py-1 rounded-full text-xs font-medium`}>
                                  {formatNumber(dato.ica)}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista de tarjetas para móviles */}
                  <div className="md:hidden space-y-3">
                    {isLoading ? (
                      <div className="text-center py-8 text-sm text-gray-500">Cargando datos...</div>
                    ) : currentItems.length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-500">No hay datos disponibles</div>
                    ) : (
                      currentItems.map((dato, index) => (
                        <div key={index} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                          <div
                            className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                            onClick={() => toggleRowDetails(index)}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{formatDate(dato.fecha)}</span>
                              <span className={`${getColorICA(dato.ica)} px-2 py-1 rounded-full text-xs font-medium`}>
                                ICA: {formatNumber(dato.ica)}
                              </span>
                            </div>
                            <ChevronRight
                              className={`h-4 w-4 text-gray-500 transition-transform ${selectedRow === index ? "rotate-90" : ""}`}
                            />
                          </div>

                          {selectedRow === index && (
                            <div className="p-3 text-xs space-y-2 border-t">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-gray-500">pH:</span>{" "}
                                  <span className="font-medium">{formatNumber(dato.ph)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Turbidez:</span>{" "}
                                  <span className="font-medium">{dato.turbidez ?? "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Conductividad:</span>{" "}
                                  <span className="font-medium">{dato.conductividad ?? "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">TDS:</span>{" "}
                                  <span className="font-medium">{dato.tds ?? "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Dureza:</span>{" "}
                                  <span className="font-medium">{dato.dureza ?? "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Color:</span>{" "}
                                  <span className="font-medium">{dato.color ?? "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-base sm:text-lg">No hay datos disponibles</p>
                  </div>
                )
              )}

              {/* Paginación */}
              {filteredData.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4 px-1 sm:px-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Anterior</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                      // Lógica para mostrar 3 páginas en móvil, 5 en desktop
                      let pageNum
                      const visiblePages = window.innerWidth < 640 ? 3 : 5

                      if (totalPages <= visiblePages) {
                        pageNum = i + 1
                      } else if (currentPage <= Math.ceil(visiblePages / 2)) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - Math.floor(visiblePages / 2)) {
                        pageNum = totalPages - visiblePages + i + 1
                      } else {
                        pageNum = currentPage - Math.floor(visiblePages / 2) + i
                      }

                      // Solo mostrar si el número de página es válido
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs sm:text-sm font-medium ${
                              currentPage === pageNum ? "bg-[#7eb53c] text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      }
                      return null
                    })}

                    {totalPages > 3 && currentPage < totalPages - 1 && (
                      <>
                        <span className="px-1">...</span>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden xs:inline">Siguiente</span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              )}

              {filteredData.length > 0 && (
                <div className="text-xs sm:text-sm text-gray-500 text-center mt-2">
                  Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} de{" "}
                  {filteredData.length} registros
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataView

