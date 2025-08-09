"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, LogOut, User, Shield } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import LogoAquaher from "../assets/icons/IconAquaher.png"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import PropTypes from "prop-types"
import { useAuth } from "../hooks/useAuth"

const Navbar = ({ activeTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Detectar scroll para cambiar la apariencia del navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleNavigation = (path) => {
    closeMenu()
    navigate(path)
  }

  const navItems = [
    { 
      to: "/", 
      label: "Dashboard", 
      value: "dashboard", 
      icon: "📡",
      variant: "azul"
    },
    { 
      to: "/prediction", 
      label: "Predicción", 
      value: "prediccion", 
      icon: "🔍",
      variant: "aqua"
    },
    { 
      to: "/upload", 
      label: "Cargar Datos", 
      value: "cargar", 
      icon: "📂",
      variant: "verde"
    },
    { 
      to: "/view-data", 
      label: "Datos Reales", 
      value: "ver", 
      icon: "📊",
      variant: "secondary"
    },
    { 
      to: "/all-data", 
      label: "Historial", 
      value: "historial", 
      icon: "📈",
      variant: "outline"
    },
  ]

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur transition-all duration-200",
      scrolled ? "shadow-md" : "shadow-sm"
    )}>
      <div className="container mx-auto px-2 sm:px-4 py-2 lg:py-3">
        <div className="flex items-center justify-between gap-2 lg:gap-4">
          {/* Logo y título - responsivo */}
          <motion.div 
            className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <img 
                src={LogoAquaher || "/placeholder.svg"} 
                alt="Logo AquaHer" 
                className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg border border-border" 
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-2xl font-bold">
                <span className="text-primary">ICA-</span>
                <span className="text-secondary">Predict</span>
              </h1>
              <p className="text-xs text-muted-foreground hidden lg:block">
                Sistema de Predicción de Calidad del Agua
              </p>
            </div>
          </motion.div>

          {/* Navegación para pantallas medianas y grandes - más compacta */}
          <nav className="hidden md:block flex-1 max-w-2xl mx-4 lg:mx-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex space-x-1 lg:space-x-2 justify-center">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.value}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Button
                      asChild
                      variant={activeTab === item.value ? item.variant : "ghost"}
                      size="sm"
                      className="relative group px-2 lg:px-3"
                    >
                      <Link to={item.to} className="flex items-center space-x-1 lg:space-x-2">
                        <span className="text-sm">{item.icon}</span>
                        <span className="font-medium text-xs lg:text-sm hidden lg:inline">{item.label}</span>
                        <span className="font-medium text-xs lg:hidden">{item.label.split(' ')[0]}</span>
                        {activeTab === item.value && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-current"
                            layoutId="activeTab"
                            initial={false}
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </nav>

          {/* Información de usuario y logout */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Botón de Admin Panel para administradores */}
            {user?.rol === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-1 lg:space-x-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 lg:px-3"
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="hidden lg:inline">Admin</span>
              </Button>
            )}
            
            <div className="flex items-center space-x-2 px-2 lg:px-3 py-1 bg-gray-50 rounded-lg max-w-[200px] lg:max-w-none">
              <User className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate" title={user?.nombre || user?.username}>
                {user?.nombre || user?.username}
              </span>
              <span className="text-xs text-gray-500 bg-gray-200 px-1 lg:px-2 py-0.5 rounded flex-shrink-0">
                {user?.rol === 'control_calidad' ? 'QC' : user?.rol === 'operador' ? 'OP' : user?.rol === 'admin' ? 'ADM' : user?.rol}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-1 lg:space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 lg:px-3 flex-shrink-0"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="hidden lg:inline">Salir</span>
            </Button>
          </div>

          {/* Botón de menú hamburguesa - solo visible en pantallas pequeñas */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="md:hidden"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 180 }}
                  exit={{ rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 180 }}
                  animate={{ rotate: 0 }}
                  exit={{ rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-t bg-background/95 backdrop-blur"
          >
            <nav className="container mx-auto px-4 py-4">
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Button
                      variant={activeTab === item.value ? item.variant : "ghost"}
                      className="w-full justify-start space-x-3 h-12"
                      onClick={() => handleNavigation(item.to)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </motion.div>
                ))}
                
                {/* Información de usuario y logout en móvil */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * navItems.length }}
                  className="pt-4 border-t"
                >
                  {/* Botón de Admin Panel para administradores en móvil */}
                  {user?.rol === 'admin' && (
                    <Button
                      variant="outline"
                      className="w-full justify-start space-x-3 h-12 text-purple-600 hover:text-purple-700 hover:bg-purple-50 mb-2"
                      onClick={() => {
                        closeMenu();
                        navigate('/admin');
                      }}
                    >
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Panel de Administración</span>
                    </Button>
                  )}
                  
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg mb-2">
                    <User className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 truncate" title={user?.nombre || user?.username}>
                        {user?.nombre || user?.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        Rol: {user?.rol === 'control_calidad' ? 'Control de Calidad' : 
                               user?.rol === 'operador' ? 'Operador' : 
                               user?.rol === 'admin' ? 'Administrador' : user?.rol}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start space-x-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Cerrar Sesión</span>
                  </Button>
                </motion.div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/25 z-40"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </header>
  )
}

Navbar.propTypes = {
  activeTab: PropTypes.string.isRequired,
}

export default Navbar
