-- =====================================================
-- SCRIPT SIMPLE PARA SUPABASE - ICA PREDICT
-- =====================================================
-- Solo tablas y funciones básicas, sin complicaciones
-- Copia todo este contenido en SQL Editor de Supabase
-- =====================================================

-- =====================================================
-- 1. CREAR TABLAS
-- =====================================================

-- Tabla principal de calidad del agua
CREATE TABLE IF NOT EXISTS calidad_agua (
    id BIGSERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    ph DECIMAL(8,4),
    turbidez DECIMAL(8,4),
    conductividad DECIMAL(8,4),
    tds DECIMAL(8,4),
    dureza DECIMAL(8,4),
    color DECIMAL(8,4),
    ica DECIMAL(8,4),
    sensor_id VARCHAR(50) DEFAULT 'MANUAL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de predicciones
CREATE TABLE IF NOT EXISTS datos_predic (
    id BIGSERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    ph DECIMAL(8,4),
    turbidez DECIMAL(8,4),
    conductividad DECIMAL(8,4),
    tds DECIMAL(8,4),
    dureza DECIMAL(8,4),
    color DECIMAL(8,4),
    ica DECIMAL(8,4),
    modelo_version VARCHAR(50) DEFAULT 'v1.0',
    confianza DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de datos de sensores en tiempo real
CREATE TABLE IF NOT EXISTS sensor_data (
    id BIGSERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ph DECIMAL(8,4),
    turbidez DECIMAL(8,4),
    conductividad DECIMAL(8,4),
    tds DECIMAL(8,4),
    dureza DECIMAL(8,4),
    color DECIMAL(8,4),
    temperatura DECIMAL(8,4),
    oxigeno_disuelto DECIMAL(8,4),
    ubicacion VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. ÍNDICES BÁSICOS
-- =====================================================

CREATE INDEX idx_calidad_agua_fecha ON calidad_agua(fecha);
CREATE INDEX idx_calidad_agua_sensor ON calidad_agua(sensor_id);
CREATE INDEX idx_sensor_data_sensor ON sensor_data(sensor_id);
CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp);

-- =====================================================
-- 3. FUNCIONES BÁSICAS
-- =====================================================

-- Función para insertar datos de calidad del agua
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

-- Función para insertar predicciones
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

-- Función para obtener datos por fecha
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

-- Función para insertar datos de sensores
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
) RETURNS TABLE(id BIGINT, fecha_hora TIMESTAMPTZ, created_at TIMESTAMPTZ)
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

-- Función para obtener últimos datos de un sensor
CREATE OR REPLACE FUNCTION obtener_ultimos_datos_sensor(
    p_sensor_id VARCHAR(50),
    p_limite INTEGER DEFAULT 10
) RETURNS TABLE(
    id BIGINT,
    sensor_id VARCHAR(50),
    fecha_hora TIMESTAMPTZ,
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

-- =====================================================
-- 4. PRUEBAS RÁPIDAS
-- =====================================================

-- Insertar un dato de prueba
SELECT * FROM insertar_datos_calidad_agua(
    CURRENT_DATE::DATE, 7.2, 5.5, 250.0, 180.0, 120.0, 15.0, 75.5, 'ESP32_001'
);

-- Consultar el dato insertado
SELECT * FROM obtener_datos_por_fecha(CURRENT_DATE::DATE);

-- Verificar que las tablas se crearon
SELECT 'calidad_agua' as tabla, COUNT(*) as registros FROM calidad_agua
UNION ALL
SELECT 'datos_predic' as tabla, COUNT(*) as registros FROM datos_predic
UNION ALL
SELECT 'sensor_data' as tabla, COUNT(*) as registros FROM sensor_data;

-- =====================================================
-- LISTO! 
-- =====================================================
-- 1. Copia todo este código
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Pega y ejecuta
-- 4. ¡Ya tienes todo funcionando!
-- =====================================================
