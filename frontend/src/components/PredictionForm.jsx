"use client"

import { useState } from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { getPrediction } from "../services/predictionService"
import { guardarPrediccion } from "../services/predictionStorageService"
import { calcularICA } from "../utils/icaCalculator"
import { formatearNombreParametro } from "@/lib/utils"
import { CalendarIcon, Save, Info, Sparkles, TrendingUp } from "lucide-react"

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ParameterCard } from "@/components/ui/parameter-card"
import { PageContainer, PageHeader } from "@/components/ui/layout"

const PredictionForm = () => {
  const [fecha, setFecha] = useState("")
  const [resultado, setResultado] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [showIcaLegend, setShowIcaLegend] = useState(false)

  const unidades = {
    color: "UPt-Co",
    turbidez: "NTU",
    ph: "pH",
    dureza: "mg/L",
    conductividad: "µS/cm",
    tds: "mg/L",
    ica: "ICA",
  }

  const getICAStatus = (valor) => {
    if (valor >= 85) return { variant: "excellent", label: "Excelente", description: "Agua de excelente calidad" }
    if (valor >= 70) return { variant: "good", label: "Buena", description: "Agua de buena calidad" }
    if (valor >= 50) return { variant: "regular", label: "Regular", description: "Agua de calidad regular" }
    if (valor >= 30) return { variant: "bad", label: "Mala", description: "Agua de mala calidad" }
    return { variant: "poor", label: "Muy Mala", description: "Agua de muy mala calidad" }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fecha) {
      alert("Por favor selecciona una fecha.")
      return
    }

    setIsLoading(true)
    setGuardado(false)
    try {
      const data = await getPrediction(fecha)
      const ica = calcularICA(data.prediction)
      setResultado({ ...data.prediction, ica })
    } catch (err) {
      alert("Error al obtener la predicción.")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuardar = async () => {
    if (!resultado || !fecha) return

    try {
      await guardarPrediccion(fecha, resultado)
      setGuardado(true)
      alert("✅ Predicción guardada correctamente.")
    } catch (error) {
      alert("❌ Error al guardar la predicción.")
      console.error("Error al guardar:", error)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Predicción de Calidad del Agua"
        description="Obtén predicciones de parámetros de calidad del agua con ayuda de la IA"
      />

      <div className="grid gap-6">
        {/* Formulario de Predicción */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Nueva Predicción</span>
            </CardTitle>
            <CardDescription>
              Selecciona una fecha para obtener la predicción de parámetros del agua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fecha" className="text-sm font-medium text-foreground">
                  Fecha de Predicción
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !fecha}
                className="w-full"
                variant="aqua"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generando Predicción...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Predecir Parámetros
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultados */}
        {resultado && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* ICA Card Principal */}
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-primary" />
                    <span>Índice de Calidad del Agua (ICA)</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowIcaLegend(!showIcaLegend)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <div className="text-6xl font-bold text-primary">
                      {resultado.ica?.toFixed(1)}
                    </div>
                    <Badge variant={getICAStatus(resultado.ica).variant} className="text-lg px-4 py-2">
                      {getICAStatus(resultado.ica).label}
                    </Badge>
                    <p className="text-muted-foreground">
                      {getICAStatus(resultado.ica).description}
                    </p>
                  </div>
                </div>

                {showIcaLegend && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 bg-muted rounded-lg"
                  >
                    <h4 className="font-semibold mb-2">Escala de Calidad del Agua:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge variant="excellent">85-100</Badge>
                        <span>Excelente</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="good">70-84</Badge>
                        <span>Buena</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="regular">50-69</Badge>
                        <span>Regular</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="bad">30-49</Badge>
                        <span>Mala</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="poor">0-29</Badge>
                        <span>Muy Mala</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Parámetros Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(resultado).map(([key, value]) => {
                if (key === "ica") return null // Ya se muestra arriba
                
                return (
                  <ParameterCard
                    key={key}
                    parameter={formatearNombreParametro(key)}
                    value={value}
                    unit={unidades[key]}
                    variant="default"
                  />
                )
              })}
            </div>

            {/* Acciones */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleGuardar}
                    disabled={guardado}
                    variant="verde"
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {guardado ? "✅ Guardado" : "Guardar Predicción"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setResultado(null)}
                    className="flex-1"
                  >
                    Nueva Consulta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </PageContainer>
  )
}

export default PredictionForm
