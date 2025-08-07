# Migración a Supabase - Plan de Implementación

## 1. Configuración de Supabase

### Crear cuenta y proyecto
1. Ir a https://supabase.com
2. Crear nuevo proyecto: `ica-predict-sensors`
3. Guardar credenciales:
   - URL del proyecto
   - API Key (anon/public)
   - Service Role Key (para backend)

### Crear tablas

```sql
-- Tabla principal de datos de sensores
CREATE TABLE sensor_data (
    id BIGSERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ph DECIMAL(4,2),
    turbidez DECIMAL(8,2),
    temperatura DECIMAL(5,2),
    oxigeno_disuelto DECIMAL(5,2),
    conductividad DECIMAL(8,2),
    ubicacion VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de configuración de sensores
CREATE TABLE sensores (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de predicciones ICA
CREATE TABLE predicciones_ica (
    id BIGSERIAL PRIMARY KEY,
    sensor_data_id BIGINT REFERENCES sensor_data(id),
    ica_score DECIMAL(5,2),
    categoria VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp);
CREATE INDEX idx_sensor_data_sensor_id ON sensor_data(sensor_id);
```

## 2. Configuración de Seguridad (RLS)

```sql
-- Habilitar Row Level Security
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensores ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicciones_ica ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Permitir lectura pública" ON sensor_data FOR SELECT USING (true);
CREATE POLICY "Permitir inserción con API key" ON sensor_data FOR INSERT WITH CHECK (true);
```

## 3. Migración de Datos Existentes

### Exportar desde PostgreSQL local
```bash
pg_dump -h localhost -p 5433 -U postgres -d CanalMesiasDB --data-only --table=datos_sensores > datos_locales.sql
```

### Importar a Supabase
- Usar la interfaz web de Supabase
- O conectar con psql y ejecutar scripts

## 4. Código ESP32

### Opción A: Solo a Backend
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

void enviarDatos(float ph, float turbidez, float temp) {
    HTTPClient http;
    http.begin("http://tu-backend.com/api/sensor-data");
    http.addHeader("Content-Type", "application/json");
    
    DynamicJsonDocument doc(1024);
    doc["sensor_id"] = "ESP32_001";
    doc["ph"] = ph;
    doc["turbidez"] = turbidez;
    doc["temperatura"] = temp;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    http.end();
}
```

### Opción B: Directo a Supabase (Respaldo)
```cpp
void enviarASupabase(float ph, float turbidez, float temp) {
    HTTPClient http;
    http.begin("https://tu-proyecto.supabase.co/rest/v1/sensor_data");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", "tu-anon-key");
    http.addHeader("Authorization", "Bearer tu-anon-key");
    
    DynamicJsonDocument doc(1024);
    doc["sensor_id"] = "ESP32_001";
    doc["ph"] = ph;
    doc["turbidez"] = turbidez;
    doc["temperatura"] = temp;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    http.end();
}
```

## 5. Modificaciones en Backend

### Agregar cliente de Supabase
```javascript
// config/supabaseConfig.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
```

### Endpoint híbrido
```javascript
// controllers/sensorController.js
app.post('/api/sensor-data', async (req, res) => {
    const { sensor_id, ph, turbidez, temperatura } = req.body;
    
    try {
        // Guardar en Supabase
        const { data, error } = await supabase
            .from('sensor_data')
            .insert([{
                sensor_id,
                ph,
                turbidez,
                temperatura
            }]);
            
        if (error) throw error;
        
        // Procesar con ML si es necesario
        const prediccionICA = await procesarConModelo(data);
        
        res.json({ success: true, data, prediccion: prediccionICA });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## 6. Frontend - Conectar con Supabase

```javascript
// services/supabaseService.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Obtener datos en tiempo real
export const suscribirDatosSensores = (callback) => {
    return supabase
        .channel('sensor_data')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'sensor_data' },
            callback
        )
        .subscribe();
};
```

## Estrategia de Migración: Fase por Fase

### **Fase 1: Configuración Inicial (1-2 días)**
1. Crear proyecto en Supabase
2. Migrar datos existentes
3. Configurar conexión híbrida en backend

### **Fase 2: Transición (1 semana)**
1. Nuevos datos van a ambas BDs
2. Frontend lee desde Supabase
3. Local como respaldo

### **Fase 3: Evaluación (2 semanas)**
1. Monitorear rendimiento y disponibilidad
2. Probar casos de falla
3. Decidir si mantener local o no

### **Fase 4: Decisión Final**
- Si Supabase es confiable → Solo nube
- Si necesitas redundancia → Mantener híbrida

## Paso a Paso: Empezar la Migración

### 1. Exportar Datos Locales

Primero, veamos qué tablas tienes:

**Estructura actual detectada:**
- `calidad_agua`: 223 registros (datos históricos)
- `datos_predic`: 5 registros (predicciones)

#### Exportar datos existentes:
```bash
# Crear directorio para backups
mkdir -p /tmp/migration

# Exportar tabla calidad_agua
docker exec ica-predict-db pg_dump -U postgres -d CanalMesiasDB -t calidad_agua --data-only --column-inserts > /tmp/migration/calidad_agua_data.sql

# Exportar tabla datos_predic  
docker exec ica-predict-db pg_dump -U postgres -d CanalMesiasDB -t datos_predic --data-only --column-inserts > /tmp/migration/datos_predic_data.sql

# Exportar esquema completo (opcional)
docker exec ica-predict-db pg_dump -U postgres -d CanalMesiasDB --schema-only > /tmp/migration/schema.sql
```

### 2. Crear Tablas en Supabase (Adaptadas a tu estructura)

```sql
-- Tabla equivalente a calidad_agua (datos históricos y nuevos)
CREATE TABLE calidad_agua (
    id BIGSERIAL PRIMARY KEY,
    fecha DATE,
    ph DECIMAL(8,4),
    turbidez DECIMAL(8,4),
    conductividad DECIMAL(8,4),
    tds DECIMAL(8,4),
    dureza DECIMAL(8,4),
    color DECIMAL(8,4),
    ica DECIMAL(8,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sensor_id VARCHAR(50) DEFAULT 'HISTORICO' -- Para datos históricos
);

-- Tabla equivalente a datos_predic (predicciones del modelo)
CREATE TABLE datos_predic (
    id BIGSERIAL PRIMARY KEY,
    fecha DATE,
    ph DECIMAL(8,4),
    turbidez DECIMAL(8,4),
    conductividad DECIMAL(8,4),
    tds DECIMAL(8,4),
    dureza DECIMAL(8,4),
    color DECIMAL(8,4),
    ica DECIMAL(8,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    modelo_version VARCHAR(50),
    confianza DECIMAL(5,4)
);

-- Tabla nueva para datos de sensores en tiempo real
CREATE TABLE sensor_data (
    id BIGSERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ph DECIMAL(8,4),
    turbidez DECIMAL(8,4),
    conductividad DECIMAL(8,4),
    tds DECIMAL(8,4),
    dureza DECIMAL(8,4),
    color DECIMAL(8,4),
    temperatura DECIMAL(8,4), -- Nuevo campo para sensores
    oxigeno_disuelto DECIMAL(8,4), -- Nuevo campo para sensores
    ubicacion VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_calidad_agua_fecha ON calidad_agua(fecha);
CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp);
CREATE INDEX idx_sensor_data_sensor_id ON sensor_data(sensor_id);
```

### 3. Migrar Funciones de Base de Datos

#### Funciones adaptadas para Supabase:

```sql
-- 1. Función para insertar datos de calidad del agua (mejorada)
CREATE OR REPLACE FUNCTION insertar_datos_calidad_agua(
    p_fecha DATE,
    p_ph DECIMAL(8,4),
    p_turbidez DECIMAL(8,4),
    p_conductividad DECIMAL(8,4),
    p_tds DECIMAL(8,4),
    p_dureza DECIMAL(8,4),
    p_color DECIMAL(8,4),
    p_ica DECIMAL(8,4),
    p_sensor_id VARCHAR(50) DEFAULT 'MANUAL'
) RETURNS TABLE(id BIGINT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO calidad_agua (
        fecha, ph, turbidez, conductividad, tds, dureza, color, ica, sensor_id
    ) VALUES (
        p_fecha, p_ph, p_turbidez, p_conductividad,
        p_tds, p_dureza, p_color, p_ica, p_sensor_id
    )
    RETURNING calidad_agua.id, calidad_agua.created_at;
END;
$$;

-- 2. Función para insertar predicciones (mejorada)
CREATE OR REPLACE FUNCTION insertar_datos_predic(
    p_fecha DATE,
    p_ph DECIMAL(8,4),
    p_turbidez DECIMAL(8,4),
    p_conductividad DECIMAL(8,4),
    p_tds DECIMAL(8,4),
    p_dureza DECIMAL(8,4),
    p_color DECIMAL(8,4),
    p_ica DECIMAL(8,4),
    p_modelo_version VARCHAR(50) DEFAULT 'v1.0',
    p_confianza DECIMAL(5,4) DEFAULT NULL
) RETURNS TABLE(id BIGINT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO datos_predic (
        fecha, ph, turbidez, conductividad, tds, dureza, color, ica,
        modelo_version, confianza
    ) VALUES (
        p_fecha, p_ph, p_turbidez, p_conductividad,
        p_tds, p_dureza, p_color, p_ica, p_modelo_version, p_confianza
    )
    RETURNING datos_predic.id, datos_predic.created_at;
END;
$$;

-- 3. Función para obtener datos por fecha (mejorada)
CREATE OR REPLACE FUNCTION obtener_datos_por_fecha(
    fecha_consulta DATE,
    p_sensor_id VARCHAR(50) DEFAULT NULL
) RETURNS TABLE(
    id BIGINT,
    fecha DATE,
    ph DECIMAL(8,4),
    turbidez DECIMAL(8,4),
    conductividad DECIMAL(8,4),
    tds DECIMAL(8,4),
    dureza DECIMAL(8,4),
    color DECIMAL(8,4),
    ica DECIMAL(8,4),
    sensor_id VARCHAR(50),
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT ca.id, ca.fecha, ca.ph, ca.turbidez, ca.conductividad,
           ca.tds, ca.dureza, ca.color, ca.ica, ca.sensor_id, ca.created_at
    FROM calidad_agua AS ca
    WHERE ca.fecha = fecha_consulta
    AND (p_sensor_id IS NULL OR ca.sensor_id = p_sensor_id)
    ORDER BY ca.created_at DESC;
END;
$$;

-- 4. Nueva función para insertar datos de sensores en tiempo real
CREATE OR REPLACE FUNCTION insertar_sensor_data(
    p_sensor_id VARCHAR(50),
    p_ph DECIMAL(8,4) DEFAULT NULL,
    p_turbidez DECIMAL(8,4) DEFAULT NULL,
    p_conductividad DECIMAL(8,4) DEFAULT NULL,
    p_tds DECIMAL(8,4) DEFAULT NULL,
    p_dureza DECIMAL(8,4) DEFAULT NULL,
    p_color DECIMAL(8,4) DEFAULT NULL,
    p_temperatura DECIMAL(8,4) DEFAULT NULL,
    p_oxigeno_disuelto DECIMAL(8,4) DEFAULT NULL,
    p_ubicacion VARCHAR(100) DEFAULT NULL
) RETURNS TABLE(id BIGINT, timestamp TIMESTAMPTZ, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO sensor_data (
        sensor_id, ph, turbidez, conductividad, tds, dureza, color,
        temperatura, oxigeno_disuelto, ubicacion
    ) VALUES (
        p_sensor_id, p_ph, p_turbidez, p_conductividad, p_tds,
        p_dureza, p_color, p_temperatura, p_oxigeno_disuelto, p_ubicacion
    )
    RETURNING sensor_data.id, sensor_data.timestamp, sensor_data.created_at;
END;
$$;

-- 5. Función para obtener últimos datos por sensor
CREATE OR REPLACE FUNCTION obtener_ultimos_datos_sensor(
    p_sensor_id VARCHAR(50),
    p_limite INTEGER DEFAULT 10
) RETURNS TABLE(
    id BIGINT,
    sensor_id VARCHAR(50),
    timestamp TIMESTAMPTZ,
    ph DECIMAL(8,4),
    turbidez DECIMAL(8,4),
    conductividad DECIMAL(8,4),
    tds DECIMAL(8,4),
    dureza DECIMAL(8,4),
    color DECIMAL(8,4),
    temperatura DECIMAL(8,4),
    oxigeno_disuelto DECIMAL(8,4),
    ubicacion VARCHAR(100),
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT sd.id, sd.sensor_id, sd.timestamp, sd.ph, sd.turbidez,
           sd.conductividad, sd.tds, sd.dureza, sd.color,
           sd.temperatura, sd.oxigeno_disuelto, sd.ubicacion, sd.created_at
    FROM sensor_data AS sd
    WHERE sd.sensor_id = p_sensor_id
    ORDER BY sd.timestamp DESC
    LIMIT p_limite;
END;
$$;

-- 6. Función para calcular estadísticas por período
CREATE OR REPLACE FUNCTION estadisticas_por_periodo(
    p_fecha_inicio DATE,
    p_fecha_fin DATE,
    p_sensor_id VARCHAR(50) DEFAULT NULL
) RETURNS TABLE(
    total_registros BIGINT,
    ph_promedio DECIMAL(8,4),
    ph_min DECIMAL(8,4),
    ph_max DECIMAL(8,4),
    turbidez_promedio DECIMAL(8,4),
    ica_promedio DECIMAL(8,4),
    ica_min DECIMAL(8,4),
    ica_max DECIMAL(8,4)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_registros,
        AVG(ca.ph)::DECIMAL(8,4) as ph_promedio,
        MIN(ca.ph)::DECIMAL(8,4) as ph_min,
        MAX(ca.ph)::DECIMAL(8,4) as ph_max,
        AVG(ca.turbidez)::DECIMAL(8,4) as turbidez_promedio,
        AVG(ca.ica)::DECIMAL(8,4) as ica_promedio,
        MIN(ca.ica)::DECIMAL(8,4) as ica_min,
        MAX(ca.ica)::DECIMAL(8,4) as ica_max
    FROM calidad_agua AS ca
    WHERE ca.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    AND (p_sensor_id IS NULL OR ca.sensor_id = p_sensor_id);
END;
$$;
```

### 4. Configuración de RLS (Row Level Security)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE calidad_agua ENABLE ROW LEVEL SECURITY;
ALTER TABLE datos_predic ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para lectura pública
CREATE POLICY "Permitir lectura pública calidad_agua" ON calidad_agua FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública datos_predic" ON datos_predic FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública sensor_data" ON sensor_data FOR SELECT USING (true);

-- Políticas de inserción (requieren autenticación)
CREATE POLICY "Permitir inserción con API key calidad_agua" ON calidad_agua FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserción con API key datos_predic" ON datos_predic FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserción con API key sensor_data" ON sensor_data FOR INSERT WITH CHECK (true);
```
```
