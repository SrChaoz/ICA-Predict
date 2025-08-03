-- =====================================================
-- SCRIPT DE PRUEBAS PARA FUNCIONES DE SUPABASE
-- =====================================================
-- Ejecuta estas consultas para probar las funciones migradas
-- =====================================================

-- =====================================================
-- 1. PRUEBAS DE INSERCIÓN
-- =====================================================

-- Insertar datos de calidad del agua de prueba
SELECT * FROM insertar_datos_calidad_agua(
    CURRENT_DATE,          -- fecha
    7.2,                   -- ph
    5.5,                   -- turbidez
    250.0,                 -- conductividad
    180.0,                 -- tds
    120.0,                 -- dureza
    15.0,                  -- color
    75.5,                  -- ica
    'ESP32_PRUEBA'         -- sensor_id
);

-- Insertar predicción de prueba
SELECT * FROM insertar_datos_predic(
    CURRENT_DATE,          -- fecha
    6.8,                   -- ph
    8.2,                   -- turbidez
    280.0,                 -- conductividad
    200.0,                 -- tds
    140.0,                 -- dureza
    18.0,                  -- color
    68.5,                  -- ica
    'RandomForest_v2.0',   -- modelo_version
    0.85                   -- confianza
);

-- Insertar datos de sensor en tiempo real
SELECT * FROM insertar_sensor_data(
    'ESP32_TIEMPO_REAL',   -- sensor_id
    7.0,                   -- ph
    6.0,                   -- turbidez
    240.0,                 -- conductividad
    170.0,                 -- tds
    110.0,                 -- dureza
    12.0,                  -- color
    22.5,                  -- temperatura
    8.2,                   -- oxigeno_disuelto
    'Canal Principal'      -- ubicacion
);

-- =====================================================
-- 2. PRUEBAS DE CONSULTA
-- =====================================================

-- Obtener datos por fecha
SELECT * FROM obtener_datos_por_fecha(CURRENT_DATE);

-- Obtener datos por fecha y sensor específico
SELECT * FROM obtener_datos_por_fecha(CURRENT_DATE, 'ESP32_PRUEBA');

-- Obtener últimos datos de un sensor
SELECT * FROM obtener_ultimos_datos_sensor('ESP32_TIEMPO_REAL', 5);

-- =====================================================
-- 3. PRUEBAS DE ESTADÍSTICAS
-- =====================================================

-- Estadísticas de los últimos 7 días
SELECT * FROM estadisticas_por_periodo(
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE
);

-- Estadísticas de un sensor específico
SELECT * FROM estadisticas_por_periodo(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE,
    'ESP32_PRUEBA'
);

-- Resumen del día actual
SELECT * FROM resumen_diario(CURRENT_DATE);

-- Tendencias de los últimos 7 días
SELECT * FROM obtener_tendencias(7);

-- =====================================================
-- 4. PRUEBAS DE VALIDACIÓN
-- =====================================================

-- Probar inserción con datos inválidos (debería fallar)
SELECT * FROM insertar_datos_calidad_agua(
    NULL,                  -- fecha nula (debería fallar)
    7.2,
    5.5,
    250.0,
    180.0,
    120.0,
    15.0,
    75.5,
    'TEST_ERROR'
);

-- Probar inserción sin sensor_id (debería usar 'MANUAL')
SELECT * FROM insertar_datos_calidad_agua(
    CURRENT_DATE,
    7.0,
    4.0,
    220.0,
    160.0,
    100.0,
    10.0,
    80.0
    -- sin sensor_id
);

-- =====================================================
-- 5. CONSULTAS DE VERIFICACIÓN
-- =====================================================

-- Verificar que las tablas tienen datos
SELECT 'calidad_agua' as tabla, COUNT(*) as total_registros 
FROM calidad_agua
UNION ALL
SELECT 'datos_predic' as tabla, COUNT(*) as total_registros 
FROM datos_predic
UNION ALL
SELECT 'sensor_data' as tabla, COUNT(*) as total_registros 
FROM sensor_data;

-- Verificar sensores únicos
SELECT DISTINCT sensor_id, COUNT(*) as total_mediciones
FROM calidad_agua 
GROUP BY sensor_id
ORDER BY total_mediciones DESC;

-- Verificar rango de fechas
SELECT 
    MIN(fecha) as fecha_minima,
    MAX(fecha) as fecha_maxima,
    COUNT(*) as total_registros
FROM calidad_agua;

-- =====================================================
-- 6. PRUEBAS DE RENDIMIENTO
-- =====================================================

-- Consulta con muchos registros
SELECT COUNT(*) as total_registros_historicos
FROM calidad_agua 
WHERE created_at >= CURRENT_DATE - INTERVAL '1 year';

-- Verificar índices (solo funciona si tienes permisos)
-- SELECT * FROM pg_indexes WHERE tablename IN ('calidad_agua', 'sensor_data', 'datos_predic');

-- =====================================================
-- 7. PRUEBAS DE FUNCIONES EXISTENTES
-- =====================================================

-- Verificar que las funciones se crearon correctamente
SELECT 
    routine_name as nombre_funcion,
    routine_type as tipo,
    is_deterministic as deterministica
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%datos%' OR routine_name LIKE '%sensor%'
ORDER BY routine_name;

-- =====================================================
-- 8. LIMPIEZA DE DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- ADVERTENCIA: Estos comandos eliminarán los datos de prueba
-- Descomenta solo si quieres limpiar los datos de prueba

-- DELETE FROM calidad_agua WHERE sensor_id = 'ESP32_PRUEBA';
-- DELETE FROM sensor_data WHERE sensor_id = 'ESP32_TIEMPO_REAL';
-- DELETE FROM datos_predic WHERE modelo_version = 'RandomForest_v2.0';

-- =====================================================
-- RESULTADOS ESPERADOS:
-- =====================================================

/*
1. Las inserciones deberían retornar IDs y timestamps
2. Las consultas deberían retornar datos ordenados
3. Las estadísticas deberían mostrar promedios correctos
4. Las validaciones deberían rechazar datos inválidos
5. Las funciones deberían aparecer en information_schema

Si alguna prueba falla:
- Verifica que las tablas están creadas
- Verifica que las funciones se aplicaron correctamente
- Revisa los mensajes de error para debugging
- Asegúrate de tener los permisos necesarios en Supabase
*/

-- =====================================================
-- COMANDOS PARA DEBUGGING:
-- =====================================================

-- Ver errores recientes (si están disponibles)
-- SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Ver configuración de la base de datos
-- SELECT name, setting FROM pg_settings WHERE name LIKE '%log%';

-- Verificar versión de PostgreSQL
SELECT version();
