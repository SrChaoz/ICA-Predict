import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./contexts/AuthContext"
import { useAuth } from "./hooks/useAuth"
import Navbar from "./components/Navbar"
import Dashboard from "./components/Dashboard"
import PredictionForm from "./components/PredictionForm"
import DataUploadForm from "./components/DataUploadForm"
import DataView from "./components/DataView"
import DataViewAll from "./components/DataViewPredic"
import SystemStatus from "./components/SystemStatus"
import LoginForm from "./components/LoginForm"
import ControlDashboard from "./components/ControlDashboard"
import AdminPanel from "./components/AdminPanel"
import ProtectedRoute from "./components/ProtectedRoute"
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
  const { isAuthenticated, user } = useAuth()

  // Determinar la pestaña activa basada en la ruta
  const getActiveTab = () => {
    const path = location.pathname
    if (path === "/") return "dashboard"
    if (path === "/prediction") return "prediccion"
    if (path === "/upload") return "cargar"
    if (path === "/view-data") return "ver"
    if (path === "/all-data") return "historial"
    return ""
  }

  // Si no está autenticado, mostrar solo login
  if (!isAuthenticated) {
    return <LoginForm />
  }

  // Si es usuario de control de calidad, mostrar solo su dashboard
  if (user?.rol === 'control_calidad') {
    return <ControlDashboard />
  }

  // Si es administrador y está en la ruta admin, mostrar panel de admin
  if (user?.rol === 'admin' && location.pathname === '/admin') {
    return <AdminPanel />
  }

  // Para operadores y administradores, mostrar la aplicación completa
  return (
    <Layout>
      <Navbar activeTab={getActiveTab()} />
      
      {/* Barra de estado del sistema */}
      <div className="bg-gray-50 border-b px-6 py-2">
        <SystemStatus />
      </div>
      
      <main className="flex-1">
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute roles={['operador', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/prediction" 
            element={
              <ProtectedRoute roles={['operador', 'admin']}>
                <PredictionForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute roles={['operador', 'admin']}>
                <DataUploadForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/view-data" 
            element={
              <ProtectedRoute roles={['operador', 'admin']}>
                <DataView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/all-data" 
            element={
              <ProtectedRoute roles={['operador', 'admin']}>
                <DataViewAll />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </Layout>
  )
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App

