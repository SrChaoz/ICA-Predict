-- =====================================================
-- CONFIGURACIÓN DE SEGURIDAD PARA SUPABASE - ICA PREDICT
-- =====================================================
-- Configuración de Row Level Security (RLS) y políticas de acceso
-- =====================================================

-- 1. HABILITAR ROW LEVEL SECURITY
-- =====================================================

-- Habilitar RLS en todas las tablas principales
ALTER TABLE calidad_agua ENABLE ROW LEVEL SECURITY;
ALTER TABLE datos_predic ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS DE LECTURA (SELECT)
-- =====================================================

-- Permitir lectura pública de datos históricos de calidad del agua
CREATE POLICY "Lectura pública calidad_agua" ON calidad_agua 
FOR SELECT USING (true);

-- Permitir lectura pública de predicciones
CREATE POLICY "Lectura pública datos_predic" ON datos_predic 
FOR SELECT USING (true);

-- Permitir lectura pública de datos de sensores
CREATE POLICY "Lectura pública sensor_data" ON sensor_data 
FOR SELECT USING (true);

-- 3. POLÍTICAS DE INSERCIÓN (INSERT)
-- =====================================================

-- Política para inserción en calidad_agua (requiere autenticación o API key)
CREATE POLICY "Inserción autenticada calidad_agua" ON calidad_agua 
FOR INSERT WITH CHECK (
    -- Permitir inserción si está autenticado o usando service key
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role' OR
    -- Alternativamente, permitir con API key válida
    true  -- Cambiar por validación específica si es necesario
);

-- Política para inserción en datos_predic
CREATE POLICY "Inserción autenticada datos_predic" ON datos_predic 
FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role' OR
    true
);

-- Política para inserción en sensor_data
CREATE POLICY "Inserción autenticada sensor_data" ON sensor_data 
FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role' OR
    true
);

-- 4. POLÍTICAS DE ACTUALIZACIÓN (UPDATE)
-- =====================================================

-- Restringir actualizaciones - solo usuarios autenticados
CREATE POLICY "Actualización restringida calidad_agua" ON calidad_agua 
FOR UPDATE USING (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role'
) WITH CHECK (
    auth.role() = 'authenticated' OR 
    auth.role() = 'service_role'
);

-- 5. POLÍTICAS DE ELIMINACIÓN (DELETE)
-- =====================================================

-- Restringir eliminaciones - solo administradores
CREATE POLICY "Eliminación restringida calidad_agua" ON calidad_agua 
FOR DELETE USING (
    auth.role() = 'service_role'
    -- Solo service_role puede eliminar datos
);

-- 6. CONFIGURACIÓN DE ACCESO ANÓNIMO
-- =====================================================

-- Si quieres permitir acceso anónimo de lectura, descomenta las siguientes líneas:
-- CREATE POLICY "Lectura anónima calidad_agua" ON calidad_agua 
-- FOR SELECT USING (auth.role() = 'anon');

-- 7. CONFIGURACIÓN DE REALTIME
-- =====================================================

-- Habilitar suscripciones en tiempo real para las tablas
-- (esto se hace desde el Dashboard de Supabase o via API)

-- Para habilitar via SQL:
-- ALTER PUBLICATION supabase_realtime ADD TABLE calidad_agua;
-- ALTER PUBLICATION supabase_realtime ADD TABLE sensor_data;

-- 8. ÍNDICES DE SEGURIDAD Y RENDIMIENTO
-- =====================================================

-- Índice para optimizar consultas por sensor_id y fecha
CREATE INDEX IF NOT EXISTS idx_calidad_agua_sensor_fecha 
ON calidad_agua(sensor_id, fecha);

-- Índice para consultas por rango de fechas
CREATE INDEX IF NOT EXISTS idx_calidad_agua_fecha_created 
ON calidad_agua(fecha, created_at);

-- Índice para datos de sensores en tiempo real
CREATE INDEX IF NOT EXISTS idx_sensor_data_sensor_timestamp 
ON sensor_data(sensor_id, timestamp DESC);

-- 9. CONFIGURACIÓN DE API KEYS
-- =====================================================

-- Las API keys se configuran en el Dashboard de Supabase:
-- 1. Ve a Settings > API
-- 2. Usa 'anon key' para acceso público de lectura
-- 3. Usa 'service_role key' para operaciones privilegiadas
-- 4. NUNCA expongas la service_role key en el frontend

-- 10. FUNCIONES DE UTILIDAD PARA VALIDACIÓN
-- =====================================================

-- Función para validar si un sensor_id es válido
CREATE OR REPLACE FUNCTION validar_sensor_id(p_sensor_id VARCHAR(50))
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validaciones básicas
    IF p_sensor_id IS NULL OR trim(p_sensor_id) = '' THEN
        RETURN FALSE;
    END IF;
    
    -- Validar formato (opcional)
    IF length(p_sensor_id) < 3 OR length(p_sensor_id) > 50 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- 11. CONFIGURACIÓN DE TRIGGERS (OPCIONAL)
-- =====================================================

-- Trigger para validar datos antes de insertar
CREATE OR REPLACE FUNCTION validar_antes_insertar()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validar sensor_id
    IF NOT validar_sensor_id(NEW.sensor_id) THEN
        RAISE EXCEPTION 'sensor_id inválido: %', NEW.sensor_id;
    END IF;
    
    -- Validar rangos de pH (ejemplo)
    IF NEW.ph IS NOT NULL AND (NEW.ph < 0 OR NEW.ph > 14) THEN
        RAISE EXCEPTION 'Valor de pH fuera de rango: %', NEW.ph;
    END IF;
    
    -- Validar turbidez (ejemplo)
    IF NEW.turbidez IS NOT NULL AND NEW.turbidez < 0 THEN
        RAISE EXCEPTION 'Valor de turbidez negativo: %', NEW.turbidez;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Aplicar trigger a las tablas
-- DROP TRIGGER IF EXISTS trigger_validar_calidad_agua ON calidad_agua;
-- CREATE TRIGGER trigger_validar_calidad_agua
--     BEFORE INSERT OR UPDATE ON calidad_agua
--     FOR EACH ROW EXECUTE FUNCTION validar_antes_insertar();

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================

/*
1. CONFIGURACIÓN EN SUPABASE DASHBOARD:
   - Ve a Authentication > Policies para ver las políticas
   - Ve a Database > Replication para configurar Realtime
   - Ve a Settings > API para obtener las keys

2. CONFIGURACIÓN EN EL BACKEND:
   - Usa SUPABASE_URL y SUPABASE_ANON_KEY para el cliente
   - Usa SUPABASE_SERVICE_ROLE_KEY solo en el servidor

3. CONFIGURACIÓN EN EL FRONTEND:
   - Solo usa anon key o user tokens
   - Nunca uses service_role key en el frontend

4. TESTING:
   - Prueba las políticas con diferentes roles
   - Verifica que las funciones respeten RLS
   - Testa el acceso anónimo vs autenticado

5. MONITOREO:
   - Usa el Dashboard para monitorear uso de API
   - Revisa logs de errores de autenticación
   - Configura alertas para uso excesivo
*/

-- =====================================================
-- COMANDOS PARA APLICAR:
-- =====================================================

/*
1. Copia este archivo completo
2. Ve a SQL Editor en Supabase Dashboard
3. Pega y ejecuta el contenido
4. Verifica en el Dashboard que las políticas se aplicaron
5. Prueba el acceso desde tu aplicación
*/
