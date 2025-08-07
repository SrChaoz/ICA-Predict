# 🤖 Modelo de Machine Learning - ICA-Predict

## 🎯 Objetivos

El módulo de Machine Learning de ICA-Predict implementa modelos avanzados de predicción para evaluar la calidad del agua, proporcionando:

- **Predicción Precisa**: Modelos entrenados para predecir parámetros físico-químicos del agua
- **API REST**: Servicio Flask para integración con el sistema principal
- **Múltiples Algoritmos**: Random Forest y XGBoost para máxima precisión
- **Escalabilidad**: Arquitectura preparada para nuevos modelos y parámetros
- **Monitoreo**: Sistema de métricas y evaluación continua del modelo

## 🛠️ Tecnologías Utilizadas

### Core Machine Learning
- **Python 3.8+** - Lenguaje de programación principal
- **scikit-learn 1.3+** - Biblioteca principal de ML
- **XGBoost** - Algoritmo de gradient boosting
- **NumPy** - Computación numérica eficiente
- **Pandas** - Manipulación y análisis de datos

### API y Servidor
- **Flask 2.3+** - Framework web ligero para API
- **Flask-CORS** - Manejo de peticiones cross-origin
- **Gunicorn** - Servidor WSGI para producción

### Persistencia y Datos
- **Joblib** - Serialización eficiente de modelos
- **psycopg2** - Conector PostgreSQL (opcional)
- **python-dotenv** - Manejo de variables de entorno

### Análisis y Visualización
- **Matplotlib** - Gráficos y visualizaciones
- **Seaborn** - Visualizaciones estadísticas
- **Plotly** - Gráficos interactivos (opcional)

## ✨ Características Principales

### 🧠 Modelos de Machine Learning
- **Random Forest**: Modelo principal para predicciones robustas
- **XGBoost**: Modelo alternativo para casos específicos
- **Ensemble Methods**: Combinación de modelos para mayor precisión
- **Validación Cruzada**: Evaluación rigurosa del rendimiento

### 📊 Parámetros Predichos
El modelo predice los siguientes parámetros de calidad del agua:
- **pH** - Nivel de acidez/alcalinidad (6.5-8.5 óptimo)
- **Turbidez** - Claridad del agua (NTU)
- **Conductividad** - Contenido de minerales (µS/cm)
- **TDS** - Sólidos Disueltos Totales (ppm)
- **Dureza** - Concentración de calcio y magnesio (mg/L)
- **Color** - Color aparente del agua (Pt-Co)

### 🎯 Variables de Entrada
El modelo utiliza características temporales para las predicciones:
- **Días Transcurridos** - Tiempo desde fecha base
- **Mes** - Estacionalidad mensual (1-12)
- **Día del Mes** - Patrón diario (1-31)
- **Día de la Semana** - Patrón semanal (0-6)

### 🚀 API REST
- Endpoint principal `/predict` para predicciones
- Validación automática de datos de entrada
- Respuestas estructuradas en JSON
- Manejo robusto de errores

## 🚀 Instalación y Configuración

### Prerrequisitos
```bash
# Python 3.8 o superior
python --version  # Python 3.8.0+
pip --version     # pip 21.0+

# (Opcional) Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
```

### Instalación de Dependencias
```bash
# Navegar al directorio del modelo
cd model

# Instalación desde requirements.txt (recomendado)
pip install -r requirements.txt

# O instalación manual de paquetes principales
pip install pandas scikit-learn numpy flask psycopg2 xgboost python-dotenv flask-cors joblib matplotlib seaborn
```

### Configuración de Variables de Entorno
Crear archivo `.env` en la carpeta `model`:

```env
# Configuración del Servidor Flask
FLASK_PORT=5000
FLASK_HOST=0.0.0.0
FLASK_ENV=development

# Configuración de Base de Datos (para reentrenamiento)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=canal_mesias_db
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

# Configuración de Modelos
MODEL_PATH=./model/
DEFAULT_MODEL=best_rf_model.pkl
SCALER_PATH=./model/scaler.pkl

# Configuración de Logging
LOG_LEVEL=INFO
LOG_FILE=model.log
```

### Ejecución

#### Desarrollo
```bash
# Ejecutar servidor Flask en modo desarrollo
python app.py

# El servidor estará disponible en http://localhost:5000
```

#### Producción
```bash
# Usar Gunicorn para producción
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```

## 📊 Uso de la API

### Endpoint Principal
```
POST /predict
Content-Type: application/json
```

### Formato de Petición
```json
{
    "fecha": "2024-08-07"
}
```

### Formato de Respuesta Exitosa
```json
{
    "success": true,
    "predicciones": {
        "ph": 7.2,
        "turbidez": 15.3,
        "conductividad": 420.5,
        "tds": 280.2,
        "dureza": 180.7,
        "color": 25.1
    },
    "fecha": "2024-08-07",
    "modelo_utilizado": "Random Forest",
    "confianza": 0.92,
    "timestamp": "2024-08-07T10:30:00Z"
}
```

### Formato de Respuesta de Error
```json
{
    "success": false,
    "error": "Formato de fecha inválido",
    "codigo": "INVALID_DATE_FORMAT",
    "timestamp": "2024-08-07T10:30:00Z"
}
```

### Ejemplo de Uso con cURL
```bash
# Realizar predicción
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"fecha": "2024-08-07"}'
```

### Ejemplo de Uso con Python
```python
import requests
import json

# Configurar URL y datos
url = "http://localhost:5000/predict"
data = {"fecha": "2024-08-07"}

# Realizar petición
response = requests.post(url, json=data)
result = response.json()

if result["success"]:
    print("Predicciones:", result["predicciones"])
else:
    print("Error:", result["error"])
```

## 🧠 Entrenamiento del Modelo

### Script de Entrenamiento
```bash
# Ejecutar entrenamiento completo
python scripts/train_model.py

# Con parámetros específicos
python scripts/train_model.py --algorithm rf --test_size 0.2 --cv_folds 5
```

### Evaluación del Modelo
```bash
# Generar métricas de evaluación
python scripts/evaluate_model.py

# Análisis detallado de datos
python scripts/inspection_of_data.py
```

### Parámetros de Entrenamiento
```python
# Configuración de Random Forest
{
    "n_estimators": 100,
    "max_depth": 10,
    "min_samples_split": 5,
    "min_samples_leaf": 2,
    "random_state": 42
}

# Configuración de XGBoost
{
    "n_estimators": 100,
    "max_depth": 6,
    "learning_rate": 0.1,
    "subsample": 0.8,
    "random_state": 42
}
```

## 📁 Estructura del Proyecto

```
model/
├── 📁 model/                    # Modelos entrenados
│   ├── best_rf_model.pkl        # Modelo Random Forest principal
│   ├── best_xgb_model.pkl       # Modelo XGBoost alternativo
│   ├── scaler.pkl               # Escalador de características
│   └── ALLbest_rf_model.pkl     # Modelo combinado
├── 📁 scripts/                  # Scripts de entrenamiento y análisis
│   ├── train_model.py           # Script principal de entrenamiento
│   ├── inspection_of_data.py    # Análisis exploratorio de datos
│   ├── clima_data.py            # Procesamiento de datos climáticos
│   └── evaluate_model.py        # Evaluación de modelos
├── 📄 app.py                    # Servidor Flask principal
├── 📄 requirements.txt          # Dependencias Python
├── 📄 .env.example              # Ejemplo de variables de entorno
├── 📄 README.md                 # Documentación (este archivo)
└── 📄 model.log                 # Logs del sistema (generado)
```

## 🔧 Scripts Disponibles

```bash
# Entrenamiento del modelo
python scripts/train_model.py

# Análisis de datos
python scripts/inspection_of_data.py

# Evaluación del modelo
python scripts/evaluate_model.py

# Procesamiento de datos climáticos
python scripts/clima_data.py

# Ejecutar servidor Flask
python app.py

# Tests del modelo (si están configurados)
python -m pytest tests/
```

## 📈 Métricas y Rendimiento

### Métricas de Evaluación
- **R² Score**: Coeficiente de determinación
- **RMSE**: Error cuadrático medio
- **MAE**: Error absoluto medio
- **MAPE**: Error porcentual absoluto medio

### Rendimiento Típico
```
Parámetro      | R² Score | RMSE  | MAE
---------------|----------|-------|------
pH             | 0.92     | 0.15  | 0.12
Turbidez       | 0.88     | 2.1   | 1.8
Conductividad  | 0.85     | 25.3  | 20.1
TDS            | 0.89     | 18.7  | 15.2
Dureza         | 0.83     | 22.4  | 18.9
Color          | 0.79     | 5.2   | 4.1
```

## 🔒 Consideraciones de Seguridad

### Validación de Datos
- Validación estricta de formato de fecha
- Límites de rango para predicciones
- Sanitización de entradas
- Manejo seguro de errores

### Monitoreo
- Logs detallados de predicciones
- Métricas de rendimiento en tiempo real
- Alertas por predicciones anómalas

## 🐳 Despliegue

### Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

### Variables de Producción
```env
FLASK_ENV=production
FLASK_PORT=5000
LOG_LEVEL=WARNING
```

## 🔬 Investigación y Desarrollo

### Mejoras Futuras
- Implementación de Deep Learning (LSTM, GRU)
- Modelos específicos por estación del año
- Incorporación de datos climáticos externos
- AutoML para optimización automática

### Datos Adicionales
- Integración con APIs meteorológicas
- Datos de precipitación y temperatura
- Información de caudales de ríos
- Datos de contaminación urbana

## 🔗 Enlaces

- **🌐 Repositorio GitHub**: [https://github.com/SrChaoz/ICA-Predict](https://github.com/SrChaoz/ICA-Predict)
- **📊 Notebooks de Análisis**: [Próximamente]
- **📚 Paper Científico**: [En desarrollo]
- **🐛 Reportar Issues**: [GitHub Issues](https://github.com/SrChaoz/ICA-Predict/issues)

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nuevo-modelo`
3. Implementa tus cambios
4. Añade tests para nuevas funcionalidades
5. Ejecuta validación: `python scripts/evaluate_model.py`
6. Envía un Pull Request con descripción detallada

### Convenciones de Código
- Seguir PEP 8 para estilo de código Python
- Documentar funciones con docstrings
- Usar type hints cuando sea posible
- Mantener scripts modulares y reutilizables

---

*Desarrollado con ❤️ por SrChaoz*


