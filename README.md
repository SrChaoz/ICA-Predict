# ICA-Predict - Sistema de Predicción de Calidad del Agua

Sistema avanzado de predicción y monitoreo de calidad del agua que utiliza Machine Learning para evaluar el Índice de Calidad del Agua (ICA) a partir de parámetros físico-químicos.

## 🎯 Objetivos

### Objetivo Principal
Desarrollar un sistema integral que permita predecir y monitorear la calidad del agua mediante el análisis de parámetros físico-químicos, proporcionando herramientas para la toma de decisiones en el manejo de recursos hídricos.

### Objetivos Específicos
- **Predicción Automatizada**: Implementar modelos de Machine Learning para predecir el ICA basado en parámetros medibles
- **Monitoreo en Tiempo Real**: Proporcionar una plataforma para visualizar datos de sensores IoT (ESP32)
- **Gestión de Datos**: Facilitar la carga, almacenamiento y análisis de datos históricos de calidad del agua
- **Interfaz Intuitiva**: Ofrecer dashboards interactivos para diferentes tipos de usuarios (operadores, control de calidad, administradores)
- **Análisis Histórico**: Permitir el análisis de tendencias y patrones en la calidad del agua a lo largo del tiempo

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con Vite para desarrollo rápido
- **TailwindCSS** para estilos responsivos
- **Framer Motion** para animaciones fluidas
- **Recharts** para visualización de datos
- **React Query** para manejo de estado del servidor

### Backend
- **Node.js** con Express.js
- **JWT** para autenticación segura
- **bcryptjs** para encriptación de contraseñas
- **Multer** para carga de archivos
- **CORS** para manejo de peticiones cruzadas

### Base de Datos
- **Supabase** (PostgreSQL) para almacenamiento principal
- **Row Level Security** para seguridad de datos
- **Triggers automáticos** para auditoría

### Machine Learning
- **Python 3.8+** con scikit-learn
- **Random Forest** como modelo principal
- **Pandas** para manipulación de datos
- **NumPy** para cálculos numéricos
- **Flask** para API del modelo

### Hardware IoT
- **ESP32** para sensores en tiempo real
- **Sensores de pH, turbidez, conductividad, TDS**

## ✨ Características Principales

### 🔮 Predicción Inteligente
- Predicción del ICA usando modelos de Random Forest entrenados
- Análisis de 6 parámetros principales: pH, turbidez, conductividad, TDS, dureza y color
- Clasificación automática de calidad del agua (Excelente, Buena, Regular, Mala, Muy Mala)

### 📊 Dashboard Interactivo
- Visualización en tiempo real de parámetros de calidad del agua
- Gráficos históricos con diferentes períodos de análisis
- Métricas y KPIs de calidad del agua
- Alertas automáticas para valores fuera de rango

### 👥 Sistema Multi-Usuario
- **Administradores**: Gestión completa de usuarios y sistema
- **Operadores**: Acceso completo a predicciones y monitoreo
- **Control de Calidad**: Dashboard especializado con métricas específicas

### 📈 Análisis de Datos
- Carga masiva de datos históricos
- Filtros avanzados por fecha y rango temporal
- Exportación de reportes
- Análisis de tendencias y patrones

### 🔒 Seguridad Robusta
- Autenticación JWT con roles diferenciados
- Encriptación de contraseñas con bcrypt
- Validación de datos en frontend y backend
- Protección de rutas por roles de usuario

### 🌐 Integración IoT
- Conexión con sensores ESP32 en tiempo real
- Almacenamiento automático de lecturas de sensores
- Visualización de estado de conexión de dispositivos

## 📁 Estructura del Proyecto
```
water-predictor-ai/
├── 📱 frontend/          # Aplicación React con interfaz de usuario
│   ├── src/
│   │   ├── components/   # Componentes React reutilizables
│   │   ├── services/     # Servicios para API calls
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utilidades y helpers
│   ├── public/           # Archivos estáticos
│   └── package.json      # Dependencias del frontend
│
├── 🖥️ backend/           # API REST en Node.js
│   ├── controllers/      # Controladores de rutas
│   ├── routes/           # Definición de rutas
│   ├── services/         # Lógica de negocio
│   ├── middlewares/      # Middlewares personalizados
│   ├── config/           # Configuración de base de datos
│   └── package.json      # Dependencias del backend
│
├── 🤖 model/             # Modelos de Machine Learning
│   ├── model/            # Modelos entrenados (.pkl)
│   ├── scripts/          # Scripts de entrenamiento
│   ├── app.py            # API Flask para predicciones
│   └── requirements.txt  # Dependencias de Python
│
├── 💾 database/          # Scripts y respaldos de BD
│   ├── backups/          # Respaldos de base de datos
│   ├── scripts/          # Scripts SQL de inicialización
│   └── README.md         # Instrucciones de BD
│
├── 🐳 esp32/             # Código para sensores IoT
│   ├── water_quality_monitor.ino
│   └── config.h
│
├── 📋 docs/              # Documentación del proyecto
└── 🐳 docker-compose.yml # Configuración Docker
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ y npm
- Python 3.8+
- Git
- Cuenta en Supabase (para base de datos)

### Configuración Rápida con Docker
```bash
# Clonar el repositorio
git clone https://github.com/SrChaoz/ICA-Predict.git
cd water-predictor-ai

# Ejecutar con Docker Compose
docker-compose up -d
```

### Instalación Manual
Para consultar las instrucciones de instalación específicas sigue los enlaces:

- 📱 [Instrucciones del Frontend](./frontend/README.md)  
- 🖥️ [Instrucciones del Backend](./backend/README.md)  
- 🤖 [Instrucciones del Modelo de ML](./model/README.md)  
- 💾 [Instrucciones de Base de Datos](./database/README.md)

## 🔗 Enlaces del Proyecto

- **🌐 Repositorio GitHub**: [https://github.com/SrChaoz/ICA-Predict](https://github.com/SrChaoz/ICA-Predict)
- **📊 Demo en Vivo**: [Próximamente]
- **📚 Documentación Completa**: [./docs/](./docs/)

---


