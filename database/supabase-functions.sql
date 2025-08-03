-- =====================================================
-- FUNCIONES PARA SUPABASE - ICA PREDICT
-- =====================================================
-- Autor: Migración desde PostgreSQL local
-- Fecha: $(date +%Y-%m-%d)
-- Descripción: Funciones optimizadas para Supabase con nuevos campos
-- =====================================================

-- 1. Función para insertar datos de calidad del agua (mejorada)
-- Incluye validaciones y retorna información del registro creado
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
) RETURNS TABLE(id BIGINT, created_at TIMESTAMPTZ, mensaje TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    nuevo_id BIGINT;
    nueva_fecha TIMESTAMPTZ;
BEGIN
    -- Validaciones básicas
    IF p_fecha IS NULL OR p_ph IS NULL OR p_turbidez IS NULL THEN
        RETURN QUERY SELECT NULL::BIGINT, NULL::TIMESTAMPTZ, 'Error: Campos requeridos no pueden ser nulos'::TEXT;
        RETURN;
    END IF;

    -- Insertar datos
    INSERT INTO calidad_agua (
        fecha, ph, turbidez, conductividad, tds, dureza, color, ica, sensor_id
    ) VALUES (
        p_fecha, p_ph, p_turbidez, p_conductividad,
        p_tds, p_dureza, p_color, p_ica, p_sensor_id
    )
    RETURNING calidad_agua.id, calidad_agua.created_at INTO nuevo_id, nueva_fecha;

    RETURN QUERY SELECT nuevo_id, nueva_fecha, 'Datos insertados correctamente'::TEXT;
END;
$$;

-- 2. Función para insertar predicciones (mejorada)
-- Incluye información del modelo y confianza de la predicción
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
) RETURNS TABLE(id BIGINT, created_at TIMESTAMPTZ, mensaje TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    nuevo_id BIGINT;
    nueva_fecha TIMESTAMPTZ;
BEGIN
    -- Validaciones
    IF p_fecha IS NULL OR p_ica IS NULL THEN
        RETURN QUERY SELECT NULL::BIGINT, NULL::TIMESTAMPTZ, 'Error: Fecha e ICA son requeridos'::TEXT;
        RETURN;
    END IF;

    -- Insertar predicción
    INSERT INTO datos_predic (
        fecha, ph, turbidez, conductividad, tds, dureza, color, ica,
        modelo_version, confianza
    ) VALUES (
        p_fecha, p_ph, p_turbidez, p_conductividad,
        p_tds, p_dureza, p_color, p_ica, p_modelo_version, p_confianza
    )
    RETURNING datos_predic.id, datos_predic.created_at INTO nuevo_id, nueva_fecha;

    RETURN QUERY SELECT nuevo_id, nueva_fecha, 'Predicción almacenada correctamente'::TEXT;
END;
$$;

-- 3. Función para obtener datos por fecha (mejorada)
-- Soporte para filtrado por sensor y ordenamiento
CREATE OR REPLACE FUNCTION obtener_datos_por_fecha(
    fecha_consulta DATE,
    p_sensor_id VARCHAR(50) DEFAULT NULL,
    p_ordenar_por VARCHAR(20) DEFAULT 'created_at',
    p_orden VARCHAR(5) DEFAULT 'DESC'
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
    RETURN QUERY EXECUTE format('
        SELECT ca.id, ca.fecha, ca.ph, ca.turbidez, ca.conductividad,
               ca.tds, ca.dureza, ca.color, ca.ica, ca.sensor_id, ca.created_at
        FROM calidad_agua AS ca
        WHERE ca.fecha = $1
        AND ($2 IS NULL OR ca.sensor_id = $2)
        ORDER BY %I %s',
        CASE WHEN p_ordenar_por IN ('id', 'fecha', 'ph', 'ica', 'created_at') 
             THEN p_ordenar_por ELSE 'created_at' END,
        CASE WHEN upper(p_orden) IN ('ASC', 'DESC') 
             THEN upper(p_orden) ELSE 'DESC' END
    ) USING fecha_consulta, p_sensor_id;
END;
$$;

-- 4. Nueva función para insertar datos de sensores en tiempo real
-- Para datos directos de sensores IoT
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
) RETURNS TABLE(id BIGINT, timestamp TIMESTAMPTZ, created_at TIMESTAMPTZ, mensaje TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    nuevo_id BIGINT;
    nuevo_timestamp TIMESTAMPTZ;
    nueva_fecha TIMESTAMPTZ;
BEGIN
    -- Validar sensor_id
    IF p_sensor_id IS NULL OR trim(p_sensor_id) = '' THEN
        RETURN QUERY SELECT NULL::BIGINT, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 'Error: sensor_id es requerido'::TEXT;
        RETURN;
    END IF;

    -- Insertar datos del sensor
    INSERT INTO sensor_data (
        sensor_id, ph, turbidez, conductividad, tds, dureza, color,
        temperatura, oxigeno_disuelto, ubicacion
    ) VALUES (
        p_sensor_id, p_ph, p_turbidez, p_conductividad, p_tds,
        p_dureza, p_color, p_temperatura, p_oxigeno_disuelto, p_ubicacion
    )
    RETURNING sensor_data.id, sensor_data.timestamp, sensor_data.created_at 
    INTO nuevo_id, nuevo_timestamp, nueva_fecha;

    RETURN QUERY SELECT nuevo_id, nuevo_timestamp, nueva_fecha, 'Datos de sensor almacenados correctamente'::TEXT;
END;
$$;

-- 5. Función para obtener últimos datos por sensor
-- Útil para dashboards en tiempo real
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
    LIMIT LEAST(p_limite, 100); -- Máximo 100 registros
END;
$$;

-- 6. Función para calcular estadísticas por período
-- Para análisis y reportes
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
    turbidez_min DECIMAL(8,4),
    turbidez_max DECIMAL(8,4),
    ica_promedio DECIMAL(8,4),
    ica_min DECIMAL(8,4),
    ica_max DECIMAL(8,4),
    sensores_activos BIGINT
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
        MIN(ca.turbidez)::DECIMAL(8,4) as turbidez_min,
        MAX(ca.turbidez)::DECIMAL(8,4) as turbidez_max,
        AVG(ca.ica)::DECIMAL(8,4) as ica_promedio,
        MIN(ca.ica)::DECIMAL(8,4) as ica_min,
        MAX(ca.ica)::DECIMAL(8,4) as ica_max,
        COUNT(DISTINCT ca.sensor_id)::BIGINT as sensores_activos
    FROM calidad_agua AS ca
    WHERE ca.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    AND (p_sensor_id IS NULL OR ca.sensor_id = p_sensor_id);
END;
$$;

-- 7. Función para obtener resumen diario
-- Para dashboards y monitoreo
CREATE OR REPLACE FUNCTION resumen_diario(
    p_fecha DATE DEFAULT CURRENT_DATE,
    p_sensor_id VARCHAR(50) DEFAULT NULL
) RETURNS TABLE(
    fecha DATE,
    total_mediciones BIGINT,
    ph_promedio DECIMAL(8,4),
    ica_promedio DECIMAL(8,4),
    calidad_agua VARCHAR(20),
    ultima_medicion TIMESTAMPTZ,
    sensores_activos BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ca.fecha,
        COUNT(*)::BIGINT as total_mediciones,
        AVG(ca.ph)::DECIMAL(8,4) as ph_promedio,
        AVG(ca.ica)::DECIMAL(8,4) as ica_promedio,
        CASE 
            WHEN AVG(ca.ica) >= 80 THEN 'Excelente'
            WHEN AVG(ca.ica) >= 60 THEN 'Buena'
            WHEN AVG(ca.ica) >= 40 THEN 'Regular'
            WHEN AVG(ca.ica) >= 20 THEN 'Mala'
            ELSE 'Muy Mala'
        END::VARCHAR(20) as calidad_agua,
        MAX(ca.created_at) as ultima_medicion,
        COUNT(DISTINCT ca.sensor_id)::BIGINT as sensores_activos
    FROM calidad_agua AS ca
    WHERE ca.fecha = p_fecha
    AND (p_sensor_id IS NULL OR ca.sensor_id = p_sensor_id)
    GROUP BY ca.fecha;
END;
$$;

-- 8. Función para obtener tendencias
-- Para análisis de tendencias de calidad del agua
CREATE OR REPLACE FUNCTION obtener_tendencias(
    p_dias INTEGER DEFAULT 7,
    p_sensor_id VARCHAR(50) DEFAULT NULL
) RETURNS TABLE(
    fecha DATE,
    ica_promedio DECIMAL(8,4),
    ph_promedio DECIMAL(8,4),
    turbidez_promedio DECIMAL(8,4),
    total_mediciones BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ca.fecha,
        AVG(ca.ica)::DECIMAL(8,4) as ica_promedio,
        AVG(ca.ph)::DECIMAL(8,4) as ph_promedio,
        AVG(ca.turbidez)::DECIMAL(8,4) as turbidez_promedio,
        COUNT(*)::BIGINT as total_mediciones
    FROM calidad_agua AS ca
    WHERE ca.fecha >= CURRENT_DATE - INTERVAL '%s days' % p_dias
    AND (p_sensor_id IS NULL OR ca.sensor_id = p_sensor_id)
    GROUP BY ca.fecha
    ORDER BY ca.fecha DESC;
END;
$$;

-- =====================================================
-- COMENTARIOS SOBRE USO:
-- =====================================================
-- 1. Estas funciones incluyen validaciones básicas
-- 2. Retornan información útil para el frontend
-- 3. Están optimizadas para Supabase
-- 4. Incluyen nuevos campos sensor_id y created_at
-- 5. Permiten filtrado y ordenamiento flexible
-- 6. Incluyen funciones para análisis estadístico
-- =====================================================

-- Para aplicar estas funciones en Supabase:
-- 1. Copia el contenido de este archivo
-- 2. Ve a SQL Editor en Supabase Dashboard
-- 3. Pega el código y ejecuta
-- 4. Verifica que todas las funciones se crearon correctamente

-- Ejemplo de uso:
-- SELECT * FROM insertar_datos_calidad_agua('2024-01-15', 7.2, 5.5, 250.0, 180.0, 120.0, 15.0, 75.5, 'ESP32_001');
-- SELECT * FROM obtener_datos_por_fecha('2024-01-15', 'ESP32_001');
-- SELECT * FROM resumen_diario('2024-01-15');
