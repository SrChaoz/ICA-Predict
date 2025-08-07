# Configuración Híbrida: Local + Supabase

## Tu Decisión: Mantener Ambas BDs

### ✅ **Ventajas de la configuración híbrida:**

1. **Redundancia**: Si Supabase tiene problemas, tu aplicación sigue funcionando
2. **Velocidad**: Consultas locales más rápidas para operaciones críticas  
3. **Costos**: No dependes 100% de un servicio pago
4. **Desarrollo**: Puedes desarrollar sin conexión a internet
5. **Backup automático**: Datos siempre respaldados localmente

### 🎯 **Configuración Recomendada:**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     ESP32       │───▶│    Backend      │───▶│   Supabase      │
│   Sensores      │    │   (Primary)     │    │   (Cloud)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        
                              ▼                        
                       ┌─────────────────┐             
                       │  PostgreSQL     │             
                       │   (Local)       │             
                       └─────────────────┘             
```

### 📋 **Estrategia de Uso:**

1. **Escritura**: Datos van a AMBAS bases de datos
2. **Lectura**: 
   - Dashboard web → Supabase (tiempo real)
   - Aplicación principal → Local (velocidad)
   - Reportes → Supabase (acceso remoto)

### 🔧 **Implementación Backend Híbrida:**

```javascript
// config/databaseConfig.js
const localDB = require('./dbConfig'); // Tu config actual
const supabase = require('./supabaseConfig'); // Nueva config

class HybridDatabase {
    async insertSensorData(data) {
        try {
            // Insertar en ambas bases de datos
            const [localResult, supabaseResult] = await Promise.allSettled([
                this.insertToLocal(data),
                this.insertToSupabase(data)
            ]);

            // Log errores pero no fallar si una BD falla
            if (localResult.status === 'rejected') {
                console.error('Error en BD local:', localResult.reason);
            }
            if (supabaseResult.status === 'rejected') {
                console.error('Error en Supabase:', supabaseResult.reason);
            }

            return {
                local: localResult.status === 'fulfilled',
                cloud: supabaseResult.status === 'fulfilled',
                data: data
            };
        } catch (error) {
            console.error('Error en inserción híbrida:', error);
            throw error;
        }
    }

    async insertToLocal(data) {
        // Tu lógica actual para PostgreSQL local
        return localDB.query('INSERT INTO calidad_agua ...', data);
    }

    async insertToSupabase(data) {
        const { data: result, error } = await supabase
            .from('calidad_agua')
            .insert([data]);
        
        if (error) throw error;
        return result;
    }

    async getSensorData(options = {}) {
        const { source = 'local', limit = 100 } = options;
        
        if (source === 'local') {
            return this.getFromLocal(limit);
        } else {
            return this.getFromSupabase(limit);
        }
    }
}

module.exports = new HybridDatabase();
```

## Próximos Pasos:

### 1. **Crear cuenta en Supabase** (15 min)
   - Ve a https://supabase.com
   - Crea proyecto: `ica-predict-water-quality`
   
### 2. **Configurar tablas** (30 min)
   - Ejecutar el SQL que creamos
   - Configurar RLS (Row Level Security)
   
### 3. **Migrar datos históricos** (45 min)
   - Importar tus 223 registros a Supabase
   - Verificar integridad de datos
   
### 4. **Modificar backend** (2 horas)
   - Instalar cliente de Supabase
   - Implementar lógica híbrida
   - Probar ambas conexiones

¿Quieres empezar por crear la cuenta en Supabase y configurar las tablas?
