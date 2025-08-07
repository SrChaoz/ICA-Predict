# 📱 Frontend - ICA-Predict Dashboard

## 🎯 Objetivos

El frontend de ICA-Predict es una aplicación web moderna desarrollada en React que proporciona una interfaz intuitiva y responsiva para:

- **Dashboard Interactivo**: Visualización en tiempo real de parámetros de calidad del agua
- **Sistema de Predicciones**: Interface para realizar predicciones de ICA usando Machine Learning
- **Gestión de Datos**: Herramientas para visualizar, filtrar y cargar datos históricos
- **Administración Multi-Usuario**: Interfaces diferenciadas por roles de usuario
- **Análisis Temporal**: Gráficos y métricas para análisis de tendencias

## 🛠️ Tecnologías Utilizadas

### Core Technologies
- **React 18** - Biblioteca de JavaScript para interfaces de usuario
- **Vite 4** - Herramienta de construcción rápida
- **JavaScript ES6+** - Lenguaje de programación moderno

### Estilos y UI
- **TailwindCSS 3** - Framework CSS utility-first
- **Framer Motion** - Biblioteca de animaciones para React
- **Lucide React** - Iconos modernos y ligeros
- **React Hot Toast** - Notificaciones elegantes

### Visualización de Datos
- **Recharts** - Biblioteca de gráficos para React
- **React Charts** - Gráficos interactivos adicionales
- **Date-fns** - Manipulación de fechas

### Estado y Peticiones
- **React Query (@tanstack/react-query)** - Manejo de estado del servidor
- **Axios** - Cliente HTTP para peticiones API
- **React Context** - Manejo de estado global

### Navegación y Rutas
- **React Router DOM 6** - Enrutamiento declarativo
- **React Hook Form** - Manejo eficiente de formularios

### Utilidades
- **clsx** - Utilidad para clases CSS condicionales
- **PropTypes** - Validación de props en tiempo de desarrollo

## ✨ Características Principales

### 🎛️ Dashboard en Tiempo Real
- Visualización de métricas de calidad del agua en vivo
- Gráficos históricos con múltiples períodos de tiempo
- Cards interactivas con estados de sensores
- Indicadores de conexión IoT

### 🔮 Sistema de Predicciones
- Formulario intuitivo para entrada de parámetros
- Predicción instantánea del ICA
- Clasificación automática de calidad del agua
- Guardado y historial de predicciones

### 📊 Visualización de Datos
- Tablas interactivas con paginación
- Filtros avanzados por fecha y rango temporal
- Búsqueda en tiempo real
- Exportación de datos

### 👤 Gestión Multi-Usuario
- **Administradores**: Panel completo de administración
- **Operadores**: Acceso a todas las funcionalidades
- **Control de Calidad**: Dashboard especializado

### 📱 Diseño Responsivo
- Optimizado para desktop, tablet y móvil
- Navegación adaptativa
- Componentes que se ajustan automáticamente

### 🎨 UX/UI Moderno
- Animaciones fluidas con Framer Motion
- Tema coherente con colores corporativos
- Loading states y feedback visual
- Componentes reutilizables

## 🚀 Instalación y Configuración

### Prerrequisitos
```bash
# Node.js 16 o superior
node --version  # v16.0.0+
npm --version   # 8.0.0+
```

### Instalación
```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Instalar dependencias de desarrollo (opcional)
npm install --dev
```

### Configuración de Variables de Entorno
Crear archivo `.env` en la carpeta `frontend`:

```env
# URL del Backend API
VITE_API_URL=http://localhost:3000

# URL del Modelo de ML
VITE_ML_API_URL=http://localhost:5000

# Configuración de la Aplicación
VITE_APP_NAME=ICA-Predict
VITE_APP_VERSION=1.0.0

# Configuración de autenticación
VITE_TOKEN_EXPIRE_TIME=24h

# URLs de producción (comentadas para desarrollo)
# VITE_API_URL=https://tu-backend-en-produccion.com
# VITE_ML_API_URL=https://tu-modelo-en-produccion.com
```

### Ejecución

#### Desarrollo
```bash
# Modo desarrollo con hot reload
npm run dev

# La aplicación estará disponible en http://localhost:5173
```

#### Build para Producción
```bash
# Construir para producción
npm run build

# Previsualizar build local
npm run preview
```

## 🏗️ Estructura del Proyecto

```
frontend/
├── 📁 public/
│   ├── vite.svg                 # Favicon
│   └── index.html               # HTML base
├── 📁 src/
│   ├── 📁 components/           # Componentes React
│   │   ├── Dashboard.jsx        # Dashboard principal
│   │   ├── PredictionForm.jsx   # Formulario de predicciones
│   │   ├── DataView.jsx         # Visualización de datos reales
│   │   ├── DataViewPredic.jsx   # Historial de predicciones
│   │   ├── AdminPanel.jsx       # Panel de administración
│   │   ├── ControlDashboard.jsx # Dashboard de control de calidad
│   │   ├── Navbar.jsx           # Barra de navegación
│   │   ├── LoginForm.jsx        # Formulario de login
│   │   └── 📁 ui/               # Componentes de UI reutilizables
│   │       ├── card.jsx         # Componente Card
│   │       ├── button.jsx       # Componente Button
│   │       ├── input.jsx        # Componente Input
│   │       ├── badge.jsx        # Componente Badge
│   │       ├── alert.jsx        # Componente Alert
│   │       └── tabs.jsx         # Componente Tabs
│   ├── 📁 hooks/
│   │   ├── useAuth.js           # Hook de autenticación
│   │   └── useToast.js          # Hook para notificaciones
│   ├── 📁 services/
│   │   ├── authService.js       # Servicios de autenticación
│   │   ├── dataService.js       # Servicios de datos
│   │   ├── predictionService.js # Servicios de predicciones
│   │   └── sensorService.js     # Servicios de sensores
│   ├── 📁 contexts/
│   │   └── AuthContext.jsx      # Contexto de autenticación
│   ├── 📁 utils/
│   │   ├── icaCalculator.js     # Calculadora de ICA
│   │   └── dateConverter.js     # Conversión de fechas
│   ├── 📁 assets/
│   │   ├── 📁 icons/            # Iconos personalizados
│   │   └── react.svg            # Logo de React
│   ├── 📄 App.jsx               # Componente principal
│   ├── 📄 main.jsx              # Punto de entrada
│   └── 📄 index.css             # Estilos globales
├── 📄 package.json              # Dependencias y scripts
├── 📄 vite.config.js            # Configuración de Vite
├── 📄 tailwind.config.js        # Configuración de Tailwind
├── 📄 postcss.config.js         # Configuración de PostCSS
└── 📄 .env.example              # Ejemplo de variables de entorno
```

## 🧩 Componentes Principales

### 🎛️ Dashboard.jsx
- Visualización en tiempo real de sensores
- Gráficos históricos interactivos
- Métricas de calidad del agua
- Control de períodos de tiempo

### 🔮 PredictionForm.jsx
- Formulario para entrada de parámetros
- Validación en tiempo real
- Resultados de predicción
- Guardado de predicciones

### 📊 DataView.jsx
- Tabla de datos reales
- Filtros por fecha y rango
- Paginación inteligente
- Búsqueda avanzada

### 👥 AdminPanel.jsx
- Gestión completa de usuarios
- Creación de nuevos usuarios
- Activación/desactivación
- Estadísticas del sistema

### 🎨 Componentes UI
- Sistema de diseño consistente
- Componentes reutilizables
- Temas y variantes
- Accesibilidad incluida

## 🔧 Scripts Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Build para producción
npm run build

# Previsualizar build
npm run preview

# Linting con ESLint
npm run lint

# Formateo de código
npm run format

# Análisis del bundle
npm run analyze
```

## 🎨 Temas y Estilos

### Paleta de Colores
```css
/* Colores principales */
--company-green: #74ab3c;     /* Verde corporativo */
--company-blue: #4c8cb4;      /* Azul corporativo */
--company-lightgreen: #7eb53c; /* Verde claro */

/* Estados de calidad */
--excellent: #10b981;         /* Excelente */
--good: #059669;              /* Buena */
--regular: #f59e0b;           /* Regular */
--bad: #ef4444;               /* Mala */
--poor: #dc2626;              /* Muy mala */
```

### Componentes Personalizados
- Botones con variantes por función
- Cards con animaciones
- Gráficos con temas consistentes
- Navegación adaptativa

## 📱 Rutas de la Aplicación

```javascript
// Rutas principales
/                    # Dashboard (página principal)
/prediction          # Formulario de predicciones
/upload              # Carga de datos
/view-data           # Datos reales
/all-data           # Historial de predicciones
/admin              # Panel de administración (solo admin)

// Rutas protegidas por rol
- Admin: Acceso a todas las rutas + /admin
- Operador: Acceso a todas las rutas excepto /admin
- Control Calidad: Solo dashboard especializado
```

## 🔒 Autenticación y Seguridad

### Sistema de Autenticación
- Login con JWT tokens
- Refresh automático de tokens
- Logout seguro
- Protección de rutas por roles

### Validación de Datos
- Validación en tiempo real de formularios
- Sanitización de inputs
- Manejo seguro de errores
- Feedback visual inmediato

## 🧪 Testing (Próximamente)

```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Tests e2e
npm run test:e2e

# Cobertura de tests
npm run test:coverage
```

## 🚀 Despliegue

### Build para Producción
```bash
# Crear build optimizado
npm run build

# Los archivos se generan en /dist
```

### Variables de Producción
```env
VITE_API_URL=https://api.ica-predict.com
VITE_ML_API_URL=https://ml.ica-predict.com
VITE_APP_NAME=ICA-Predict
```

### Servicios de Hosting Recomendados
- **Vercel** - Ideal para aplicaciones React
- **Netlify** - Excelente para SPAs
- **GitHub Pages** - Para proyectos open source
- **AWS S3 + CloudFront** - Para aplicaciones empresariales

## 🔗 Enlaces

- **🌐 Repositorio GitHub**: [https://github.com/SrChaoz/ICA-Predict](https://github.com/SrChaoz/ICA-Predict)
- **🎨 Figma Design**: [Próximamente]
- **📚 Storybook**: [Próximamente]
- **🐛 Reportar Issues**: [GitHub Issues](https://github.com/SrChaoz/ICA-Predict/issues)

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Implementa tus cambios siguiendo las convenciones de código
4. Ejecuta el linter: `npm run lint`
5. Asegúrate de que el build funcione: `npm run build`
6. Envía un Pull Request con descripción detallada

### Convenciones de Código
- Usar nombres descriptivos para componentes y funciones
- Comentar lógica compleja
- Seguir las convenciones de React Hooks
- Mantener componentes pequeños y enfocados

---

*Desarrollado con ❤️ por SrChaoz*

