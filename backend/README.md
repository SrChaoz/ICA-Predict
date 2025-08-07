# 🖥️ Backend - ICA-Predict API

## 🎯 Objetivos

El backend de ICA-Predict es una API REST robusta desarrollada en Node.js que sirve como núcleo del sistema, proporcionando:

- **Gestión de Autenticación**: Sistema seguro con JWT y roles de usuario
- **API de Datos**: Endpoints para manejo de datos de calidad del agua
- **Integración ML**: Comunicación con modelos de Machine Learning
- **Gestión de Usuarios**: Sistema completo de administración de usuarios
- **Seguridad Avanzada**: Middleware de protección y validación

## 🛠️ Tecnologías Utilizadas

### Core Technologies
- **Node.js 16+** - Runtime de JavaScript
- **Express.js 4.18+** - Framework web minimalista
- **Supabase** - Base de datos PostgreSQL como servicio

### Autenticación y Seguridad
- **jsonwebtoken** - Manejo de tokens JWT
- **bcryptjs** - Encriptación de contraseñas
- **cors** - Manejo de peticiones cross-origin
- **helmet** - Cabeceras de seguridad HTTP

### Manejo de Datos
- **multer** - Carga de archivos
- **csv-parser** - Procesamiento de archivos CSV
- **express-validator** - Validación de datos

### Utilidades
- **dotenv** - Variables de entorno
- **morgan** - Logger HTTP
- **compression** - Compresión de respuestas

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- Registro y login de usuarios
- Tokens JWT con expiración configurable
- Roles diferenciados: Admin, Operador, Control de Calidad
- Middleware de protección de rutas

### 📊 Gestión de Datos
- CRUD completo para datos de calidad del agua
- Carga masiva de datos via CSV
- Filtros avanzados por fecha y parámetros
- Validación de datos en tiempo real

### 👥 Administración de Usuarios
- Creación de usuarios (solo admins)
- Activación/desactivación de usuarios
- Gestión de roles y permisos
- Cambio de contraseñas seguro

### 🌐 API para Sensores IoT
- Endpoints para recepción de datos de ESP32
- Almacenamiento automático de lecturas
- Validación de datos de sensores

## 🚀 Instalación y Configuración

### Prerrequisitos
```bash
# Node.js 16 o superior
node --version  # v16.0.0+
npm --version   # 8.0.0+
```

### Instalación
```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Instalar dependencias de desarrollo (opcional)
npm install --dev
```

### Configuración de Variables de Entorno
Crear archivo `.env` en la carpeta `backend`:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRES_IN=24h

# Configuración de Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_SERVICE_KEY=tu_clave_de_servicio_de_supabase

# Configuración de CORS
CORS_ORIGIN=http://localhost:5173

# Configuración del Modelo ML
ML_API_URL=http://localhost:5000
```

### Ejecución

#### Desarrollo
```bash
# Modo desarrollo con recarga automática
npm run dev

# El servidor estará disponible en http://localhost:3000
```

#### Producción
```bash
# Modo producción
npm start
```

## 🛣️ Rutas de la API

### 🔐 Autenticación (`/api/auth`)
```javascript
POST   /api/auth/login           # Iniciar sesión
POST   /api/auth/register        # Crear usuario (solo admin)
GET    /api/auth/verify          # Verificar token
POST   /api/auth/logout          # Cerrar sesión
GET    /api/auth/profile         # Obtener perfil
PATCH  /api/auth/change-password # Cambiar contraseña
```

### 👥 Gestión de Usuarios (`/api/auth`)
```javascript
GET    /api/auth/users           # Listar usuarios (solo admin)
PATCH  /api/auth/users/:id/toggle # Activar/desactivar usuario
```

### 📊 Datos de Calidad (`/api/data`)
```javascript
GET    /api/data                 # Obtener todos los datos
GET    /api/data/date/:fecha     # Obtener datos por fecha específica
GET    /api/data/range           # Obtener datos por rango de fechas
POST   /api/data                 # Crear nuevo registro
PUT    /api/data/:id             # Actualizar registro
DELETE /api/data/:id             # Eliminar registro
```

### 🔮 Predicciones (`/api/predictions`)
```javascript
POST   /api/predictions          # Realizar predicción
GET    /api/predictions          # Obtener todas las predicciones
GET    /api/predictions/date/:fecha # Predicciones por fecha
POST   /api/predictions/save     # Guardar predicción
```

### 📁 Carga de Archivos (`/api/upload`)
```javascript
POST   /api/upload               # Cargar archivo CSV
GET    /api/upload/template      # Descargar plantilla CSV
```

### 🌐 Sensores IoT (`/api/sensors`)
```javascript
POST   /api/sensors/data         # Recibir datos de sensores
GET    /api/sensors/latest       # Obtener última lectura
GET    /api/sensors/status       # Estado de sensores
```

## 📋 Estructura del Proyecto

```
backend/
├── 📁 config/
│   └── dbConfig.js              # Configuración de Supabase
├── 📁 controllers/
│   ├── dataController.js        # Controlador de datos
│   ├── predictionController.js  # Controlador de predicciones
│   ├── uploadController.js      # Controlador de archivos
│   └── datosPredicController.js # Controlador de datos de predicción
├── 📁 routes/
│   ├── authRoutes.js           # Rutas de autenticación
│   ├── predictionRoutes.js     # Rutas de predicciones
│   ├── sensorRoutes.js         # Rutas de sensores
│   └── uploadRoutes.js         # Rutas de carga de archivos
├── 📁 services/
│   ├── authService.js          # Servicios de autenticación
│   ├── databaseService.js      # Servicios de base de datos
│   └── predictionService.js    # Servicios de predicción
├── 📁 middlewares/
│   └── multerConfig.js         # Configuración de Multer
├── 📁 scripts/
│   ├── analyze-data.js         # Script de análisis de datos
│   └── migrate-to-supabase.js  # Script de migración
├── 📁 uploads/                 # Directorio temporal para archivos
├── 📄 index.js                 # Punto de entrada de la aplicación
├── 📄 package.json             # Dependencias y scripts
└── 📄 .env.example             # Ejemplo de variables de entorno
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo con recarga automática
npm run dev

# Producción
npm start

# Linting
npm run lint

# Tests (si están configurados)
npm test

# Análisis de datos
npm run analyze-data

# Migración de datos
npm run migrate
```

## 🔗 Enlaces

- **🌐 Repositorio GitHub**: [https://github.com/SrChaoz/ICA-Predict](https://github.com/SrChaoz/ICA-Predict)
- **📚 Documentación API**: [Próximamente]
- **🐛 Reportar Issues**: [GitHub Issues](https://github.com/SrChaoz/ICA-Predict/issues)

---

*Desarrollado con ❤️ por SrChaoz*
