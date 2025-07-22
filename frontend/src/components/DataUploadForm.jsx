"use client"

import React, { useState, useRef } from "react"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { uploadFile } from "../services/uploadService"
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  File,
  FileSpreadsheet,
  Calendar,
  HardDrive
} from "lucide-react"

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { ToastContainer } from "./ui/toast-container"
import { PageContainer, PageHeader } from "./ui/layout"
import { cn } from "../lib/utils"
import { useToast } from "../hooks/useToast"

const DataUploadForm = () => {
  const { toast, toasts, removeToast } = useToast()
  const [archivo, setArchivo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  // Validación de archivos
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['.csv', 'text/csv', 'application/vnd.ms-excel']
    
    if (file.size > maxSize) {
      return { valid: false, error: 'El archivo debe ser menor a 10MB' }
    }
    
    const fileExtension = file.name.toLowerCase().split('.').pop()
    if (fileExtension !== 'csv' && !allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Solo se permiten archivos CSV' }
    }
    
    return { valid: true }
  }

  const showToast = (variant, title, description = '') => {
    toast[variant] ? toast[variant](title, description) : toast.info(title, description)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!archivo) {
      showToast('error', 'Error', 'Por favor selecciona un archivo.')
      return
    }

    const validation = validateFile(archivo)
    if (!validation.valid) {
      showToast('error', 'Archivo inválido', validation.error)
      return
    }

    setIsLoading(true)
    setUploadProgress(0)

    // Simular progreso de carga
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      await uploadFile(archivo, setIsLoading)
      setUploadProgress(100)
      showToast('success', '¡Éxito!', 'Datos cargados correctamente a la base de datos.')
      setArchivo(null)
    } catch (err) {
      console.error('Upload error:', err)
      showToast('error', 'Error', 'Error al subir el archivo. Inténtalo de nuevo.')
    } finally {
      clearInterval(progressInterval)
      setIsLoading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const validation = validateFile(file)
      
      if (validation.valid) {
        setArchivo(file)
        showToast('success', 'Archivo seleccionado', `${file.name} listo para subir`)
      } else {
        showToast('error', 'Archivo inválido', validation.error)
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const validation = validateFile(file)
      
      if (validation.valid) {
        setArchivo(file)
        showToast('success', 'Archivo seleccionado', `${file.name} listo para subir`)
      } else {
        showToast('error', 'Archivo inválido', validation.error)
      }
    }
  }

  const removeFile = () => {
    setArchivo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = () => {
    return archivo?.name.endsWith('.csv') ? FileSpreadsheet : File
  }

  return (
    <PageContainer>
      <PageHeader
        title="Cargar Datos"
        description="Sube archivos CSV con datos de calidad del agua a la base de datos"
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-primary" />
              <span>Subir Archivo CSV</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Zona de Drag & Drop */}
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                  dragActive 
                    ? "border-primary bg-primary/5 scale-105" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50",
                  isLoading && "pointer-events-none opacity-50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className={cn(
                      "h-8 w-8 transition-colors",
                      dragActive ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">
                      {dragActive ? "¡Suelta el archivo aquí!" : "Arrastra tu archivo CSV aquí"}
                    </h3>
                    <p className="text-muted-foreground">
                      o haz clic para seleccionar un archivo
                    </p>
                    <div className="flex justify-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="outline">CSV</Badge>
                      <Badge variant="outline">Máx. 10MB</Badge>
                    </div>
                  </div>
                </motion.div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
              </div>

              {/* Preview del archivo seleccionado */}
              <AnimatePresence>
                {archivo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Card className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {React.createElement(getFileIcon(), { 
                              className: "h-6 w-6 text-primary" 
                            })}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate">{archivo.name}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={removeFile}
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <HardDrive className="h-4 w-4" />
                                <span>{formatFileSize(archivo.size)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(archivo.lastModified).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress bar durante la carga */}
              <AnimatePresence>
                {isLoading && uploadProgress > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span>Subiendo archivo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botón de envío */}
              <Button
                type="submit"
                disabled={!archivo || isLoading}
                className="w-full"
                variant="verde"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Subiendo Datos...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir a Base de Datos
                  </>
                )}
              </Button>

              {/* Información adicional */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1 text-sm">
                      <h4 className="font-medium">Formato requerido:</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Archivo CSV con columnas: fecha, ph, turbidez, conductividad, tds, dureza, color, ica</li>
                        <li>• Formato de fecha: DD/MM/YYYY</li>
                        <li>• Separador decimal: punto (.) o coma (,)</li>
                        <li>• Tamaño máximo: 10MB</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </PageContainer>
  )
}

export default DataUploadForm
