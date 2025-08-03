const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración para base de datos local (PostgreSQL)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Configuración para Supabase (Nube)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Usar service_role para operaciones del servidor
);

// Determinar qué base de datos usar
const DATABASE_TYPE = process.env.DATABASE_TYPE || 'local';

// Conexión inicial y verificación
if (DATABASE_TYPE === 'local') {
    // Verificar conexión PostgreSQL local
    pool.connect()
        .then(client => {
            client.query('SELECT current_database()')
                .then(res => {
                    console.log(`✅ Conectado a PostgreSQL local: ${res.rows[0].current_database}`);
                    client.release();
                })
                .catch(err => {
                    console.error('❌ Error al conectar PostgreSQL local:', err);
                    client.release();
                });
        });
} else if (DATABASE_TYPE === 'supabase') {
    // Verificar conexión Supabase
    supabase
        .from('calidad_agua')
        .select('count', { count: 'exact' })
        .then(({ count, error }) => {
            if (error) {
                console.error('❌ Error al conectar Supabase:', error);
            } else {
                console.log(`✅ Conectado a Supabase - Registros en calidad_agua: ${count}`);
            }
        });
}

console.log(`🔄 Modo de base de datos activo: ${DATABASE_TYPE.toUpperCase()}`);

module.exports = { 
    pool,           // Para PostgreSQL local
    supabase,       // Para Supabase nube
    DATABASE_TYPE   // Para saber cuál usar
};
