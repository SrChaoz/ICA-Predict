# 💾 Base de Datos - ICA-Predict Database

## 🎯 Objetivos

El módulo de base de datos de ICA-Predict proporciona una infraestructura robusta y escalable para el almacenamiento y gestión de datos del sistema:

- **Almacenamiento Centralizado**: Base de datos PostgreSQL para todos los datos del sistema
- **Estructura Optimizada**: Esquemas diseñados para rendimiento y escalabilidad
- **Respaldos Automatizados**: Sistema de backup y restauración confiable
- **Migración Simplificada**: Scripts y herramientas para configuración rápida
- **Integridad de Datos**: Triggers y validaciones para mantener calidad de datos

## 🛠️ Tecnologías Utilizadas

### Base de Datos Principal
- **PostgreSQL 14+** - Sistema de gestión de base de datos relacional
- **Supabase** - PostgreSQL como servicio con características adicionales
- **Row Level Security (RLS)** - Seguridad a nivel de filas
- **pgAdmin 4** - Herramienta de administración (opcional)

### Características Avanzadas
- **Triggers Automáticos** - Para auditoría y validación
- **Funciones Almacenadas** - Lógica de negocio en SQL
- **Índices Optimizados** - Para consultas rápidas
- **Particionado** - Para tablas grandes (futuro)

### Scripts y Herramientas
- **SQL Scripts** - Para creación y configuración inicial
- **Backup/Restore** - Herramientas de respaldo
- **Migration Scripts** - Para actualizaciones de esquema

## ✨ Características Principales

### 📊 Esquema de Datos Optimizado
- **Normalización**: Estructura normalizada para evitar redundancia
- **Índices Inteligentes**: Optimización para consultas frecuentes
- **Tipos de Datos Apropiados**: Uso eficiente del almacenamiento
- **Constrains**: Validaciones a nivel de base de datos

### 🔒 Seguridad Avanzada
- **Row Level Security**: Control granular de acceso a datos
- **Roles y Permisos**: Sistema de autorización robusto
- **Encriptación**: Datos sensibles protegidos
- **Auditoría**: Registro de cambios automático

### 📈 Escalabilidad
- **Particionado**: Preparado para grandes volúmenes
- **Conexión Pooling**: Gestión eficiente de conexiones
- **Consultas Optimizadas**: Queries eficientes
- **Monitoreo**: Métricas de rendimiento

### 🔄 Respaldos y Recuperación
- **Backups Automáticos**: Respaldos programados
- **Point-in-Time Recovery**: Recuperación a momento específico
- **Scripts de Migración**: Actualizaciones automáticas
- **Validación de Datos**: Verificación de integridad

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

#### 👥 usuarios
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'operador', 'control_calidad')),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 🌊 calidad_agua
```sql
CREATE TABLE calidad_agua (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    ph DECIMAL(4,2),
    turbidez DECIMAL(8,2),
    conductividad DECIMAL(10,2),
    tds DECIMAL(10,2),
    dureza DECIMAL(8,2),
    color DECIMAL(8,2),
    ica DECIMAL(6,2),
    observaciones TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 🔮 datos_predic
```sql
CREATE TABLE datos_predic (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    ph DECIMAL(4,2),
    turbidez DECIMAL(8,2),
    conductividad DECIMAL(10,2),
    tds DECIMAL(10,2),
    dureza DECIMAL(8,2),
    color DECIMAL(8,2),
    ica DECIMAL(6,2),
    modelo_usado VARCHAR(50),
    confianza DECIMAL(4,2),
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 📡 sensor_data
```sql
CREATE TABLE sensor_data (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    ph DECIMAL(4,2),
    turbidez DECIMAL(8,2),
    conductividad DECIMAL(10,2),
    tds DECIMAL(10,2),
    temperatura DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT false
);
```

### Índices Optimizados
```sql
-- Índices para consultas frecuentes
CREATE INDEX idx_calidad_agua_fecha ON calidad_agua(fecha);
CREATE INDEX idx_datos_predic_fecha ON datos_predic(fecha);
CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp);
CREATE INDEX idx_sensor_data_device ON sensor_data(device_id);
CREATE INDEX idx_usuarios_username ON usuarios(username);
```

### Triggers y Funciones
```sql
-- Trigger para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validación de ICA
CREATE OR REPLACE FUNCTION validate_ica()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ica < 0 OR NEW.ica > 100 THEN
        RAISE EXCEPTION 'ICA debe estar entre 0 y 100';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 📁 Estructura del Directorio

```
database/
├── 📁 backups/                  # Respaldos de la base de datos
│   ├── CanalMesias2024.backup   # Backup principal actual
│   ├── CanalMesiasDB_26_03_2025.backup # Backup específico por fecha
│   ├── RespaldoCanalMesiasDB.backup     # Backup histórico
│   └── RespaldoCanalMesiasDBClima.backup # Backup con datos climáticos
├── 📁 scripts/                  # Scripts SQL de configuración
│   ├── CanalMesiasDB.sql        # Script principal de la BD
│   └── ClimaCanalMesiasDB.sql   # Script con datos climáticos
├── 📄 supabase-functions.sql    # Funciones específicas de Supabase
├── 📄 supabase-security.sql     # Configuración de seguridad RLS
├── 📄 supabase-simple.sql       # Configuración básica
├── 📄 test-supabase-functions.sql # Tests de funciones
├── 📄 init-restore.sh           # Script de inicialización automática
└── 📄 README.md                 # Documentación (este archivo)
```

## 🚀 Instalación y Configuración

### Opción 1: Usando Supabase (Recomendado)

#### Prerrequisitos
- Cuenta en [Supabase](https://supabase.com)
- Node.js para herramientas CLI (opcional)

#### Configuración
```bash
# 1. Crear proyecto en Supabase Dashboard
# 2. Obtener URL y claves del proyecto
# 3. Ejecutar scripts de configuración

# Ejecutar script de configuración básica
psql -h your-supabase-url.supabase.co -U postgres -f supabase-simple.sql

# Configurar seguridad RLS
psql -h your-supabase-url.supabase.co -U postgres -f supabase-security.sql

# Cargar funciones
psql -h your-supabase-url.supabase.co -U postgres -f supabase-functions.sql
```

### Opción 2: PostgreSQL Local

#### Prerrequisitos
```bash
# Instalar PostgreSQL 14+
sudo apt update
sudo apt install postgresql postgresql-contrib

# Crear usuario y base de datos
sudo -u postgres createuser --interactive
sudo -u postgres createdb canal_mesias_db
```

#### Configuración Automática
```bash
# Ejecutar script de inicialización
chmod +x init-restore.sh
./init-restore.sh

# O manualmente con pgAdmin siguiendo los pasos detallados más abajo
```

## 🔧 Restauración Paso a Paso

### Método 1: Usando pgAdmin (Interfaz Gráfica)

#### Paso 1: Crear Base de Datos
1. Abrir pgAdmin 4
2. Conectar al servidor PostgreSQL
3. Click derecho en "Databases" → "Create" → "Database"
4. Nombre: `CanalMesiasDB`
5. Click "Save"

#### Paso 2: Restaurar desde Backup
1. Click derecho en la base de datos creada
2. Seleccionar "Restore..."
3. Configurar opciones:
   ```
   Format: Custom
   Filename: ./backups/CanalMesias2024.backup
   Clean before restore: ✓
   ```
4. Click "Restore"

#### Paso 3: Verificar Datos
```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar datos
SELECT COUNT(*) FROM calidad_agua;
SELECT COUNT(*) FROM usuarios;
```

### Método 2: Línea de Comandos

#### Restauración Directa
```bash
# Restaurar backup principal
pg_restore -h localhost -U postgres -d canal_mesias_db \
  --clean --verbose ./backups/CanalMesias2024.backup

# Verificar restauración
psql -h localhost -U postgres -d canal_mesias_db \
  -c "SELECT COUNT(*) FROM calidad_agua;"
```

#### Usando Scripts SQL
```bash
# Ejecutar script principal
psql -h localhost -U postgres -d canal_mesias_db \
  -f ./scripts/CanalMesiasDB.sql

# Script con datos climáticos (opcional)
psql -h localhost -U postgres -d canal_mesias_db \
  -f ./scripts/ClimaCanalMesiasDB.sql
```

## 🔒 Configuración de Seguridad

### Row Level Security (RLS)
```sql
-- Habilitar RLS en tablas sensibles
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE calidad_agua ENABLE ROW LEVEL SECURITY;
ALTER TABLE datos_predic ENABLE ROW LEVEL SECURITY;

-- Política para usuarios
CREATE POLICY usuario_policy ON usuarios
    FOR ALL USING (auth.uid() = id OR auth.role() = 'admin');

-- Política para datos según rol
CREATE POLICY datos_policy ON calidad_agua
    FOR ALL USING (
        auth.role() IN ('admin', 'operador') OR 
        (auth.role() = 'control_calidad' AND usuario_id = auth.uid())
    );
```

### Roles y Permisos
```sql
-- Crear roles
CREATE ROLE app_admin;
CREATE ROLE app_operador;
CREATE ROLE app_control_calidad;

-- Asignar permisos
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT SELECT, INSERT, UPDATE ON calidad_agua TO app_operador;
GRANT SELECT ON calidad_agua TO app_control_calidad;
```

## 📊 Consultas Útiles

### Estadísticas Generales
```sql
-- Resumen de datos por mes
SELECT 
    EXTRACT(YEAR FROM fecha) as año,
    EXTRACT(MONTH FROM fecha) as mes,
    COUNT(*) as registros,
    AVG(ica) as ica_promedio,
    MIN(ica) as ica_minimo,
    MAX(ica) as ica_maximo
FROM calidad_agua 
GROUP BY año, mes 
ORDER BY año DESC, mes DESC;

-- Usuarios activos
SELECT 
    rol,
    COUNT(*) as total,
    COUNT(CASE WHEN activo THEN 1 END) as activos
FROM usuarios 
GROUP BY rol;
```

### Análisis de Calidad
```sql
-- Distribución de calidad del agua
SELECT 
    CASE 
        WHEN ica >= 85 THEN 'Excelente'
        WHEN ica >= 70 THEN 'Buena'
        WHEN ica >= 50 THEN 'Regular'
        WHEN ica >= 30 THEN 'Mala'
        ELSE 'Muy Mala'
    END as clasificacion,
    COUNT(*) as frecuencia,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM calidad_agua 
WHERE ica IS NOT NULL
GROUP BY clasificacion
ORDER BY frecuencia DESC;
```

### Monitoreo de Rendimiento
```sql
-- Consultas lentas
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Tamaño de tablas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔧 Mantenimiento

### Respaldos Automáticos
```bash
#!/bin/bash
# backup-script.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
DB_NAME="canal_mesias_db"

pg_dump -h localhost -U postgres -Fc $DB_NAME > \
  "$BACKUP_DIR/backup_$DATE.backup"

# Mantener solo últimos 30 respaldos
find $BACKUP_DIR -name "backup_*.backup" -mtime +30 -delete
```

### Optimización
```sql
-- Actualizar estadísticas
ANALYZE;

-- Reindexar tablas grandes
REINDEX TABLE calidad_agua;

-- Limpiar datos obsoletos
DELETE FROM sensor_data WHERE timestamp < NOW() - INTERVAL '90 days';
```

## 🧪 Testing

### Validar Integridad
```sql
-- Test de integridad referencial
SELECT 
    conname,
    pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE contype = 'f';

-- Test de datos
SELECT 
    'calidad_agua' as tabla,
    COUNT(*) as registros,
    COUNT(DISTINCT fecha) as fechas_unicas
FROM calidad_agua
UNION ALL
SELECT 
    'datos_predic',
    COUNT(*),
    COUNT(DISTINCT fecha)
FROM datos_predic;
```

## 🔗 Enlaces

- **🌐 Repositorio GitHub**: [https://github.com/SrChaoz/ICA-Predict](https://github.com/SrChaoz/ICA-Predict)
- **📚 Documentación Supabase**: [https://supabase.com/docs](https://supabase.com/docs)
- **🐘 PostgreSQL Docs**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- **🐛 Reportar Issues**: [GitHub Issues](https://github.com/SrChaoz/ICA-Predict/issues)

## 🤝 Contribución

1. Fork el repositorio
2. Crea scripts de migración para cambios de esquema
3. Documenta cambios en el esquema
4. Incluye tests de validación
5. Envía Pull Request con descripción detallada

### Convenciones
- Usar snake_case para nombres de tablas y columnas
- Documentar cambios de esquema con comentarios
- Incluir scripts de rollback para migraciones
- Validar integridad de datos después de cambios

---

*Desarrollado con ❤️ por SrChaoz*

