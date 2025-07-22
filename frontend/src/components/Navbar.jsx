"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import LogoAquaher from "../assets/icons/IconAquaher.png"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import PropTypes from "prop-types"

const Navbar = ({ activeTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

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
      to: "/dashboard", 
      label: "Dashboard", 
      value: "dashboard", 
      icon: "📡",
      variant: "azul"
    },
    { 
      to: "/", 
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
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y título - visible en todas las pantallas */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <img 
                src={LogoAquaher || "/placeholder.svg"} 
                alt="Logo AquaHer" 
                className="h-10 w-10 rounded-lg border border-border" 
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold">
                <span className="text-primary">ICA-</span>
                <span className="text-secondary">Predict</span>
              </h1>
              <p className="text-xs text-muted-foreground hidden md:block">
                Sistema de Predicción de Calidad del Agua
              </p>
            </div>
          </motion.div>

          {/* Navegación para pantallas medianas y grandes */}
          <nav className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex space-x-2">
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
                      className="relative group"
                    >
                      <Link to={item.to} className="flex items-center space-x-2">
                        <span className="text-sm">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
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

