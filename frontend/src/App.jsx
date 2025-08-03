import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Navbar from "./components/Navbar"
import Dashboard from "./components/Dashboard"
import PredictionForm from "./components/PredictionForm"
import DataUploadForm from "./components/DataUploadForm"
import DataView from "./components/DataView"
import DataViewAll from "./components/DataViewPredic"
import SystemStatus from "./components/SystemStatus"
import { Layout } from "./components/ui/layout"

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 10, // 10 minutos
    },
  },
})

// Componente wrapper para detectar la ruta actual
const AppContent = () => {
  const location = useLocation()

  // Determinar la pestaña activa basada en la ruta
  const getActiveTab = () => {
    const path = location.pathname
    if (path === "/dashboard") return "dashboard"
    if (path === "/") return "prediccion"
    if (path === "/upload") return "cargar"
    if (path === "/view-data") return "ver"
    if (path === "/all-data") return "historial"
    return ""
  }

  return (
    <Layout>
      <Navbar activeTab={getActiveTab()} />
      
      {/* Barra de estado del sistema */}
      <div className="bg-gray-50 border-b px-6 py-2">
        <SystemStatus />
      </div>
      
      <main className="flex-1">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<PredictionForm />} />
          <Route path="/upload" element={<DataUploadForm />} />
          <Route path="/view-data" element={<DataView />} />
          <Route path="/all-data" element={<DataViewAll />} />
        </Routes>
      </main>
    </Layout>
  )
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  )
}

export default App

