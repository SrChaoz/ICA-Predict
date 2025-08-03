// =====================================================
// SCRIPT DE MIGRACIÓN: PostgreSQL Local → Supabase
// =====================================================
// Migra todos los datos históricos de la base local a Supabase
// =====================================================

const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración PostgreSQL Local
const localPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Configuración Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================================================
// FUNCIONES DE MIGRACIÓN
// =====================================================

/**
 * Migrar datos de calidad_agua
 */
async function migrarCalidadAgua() {
    console.log('🔄 Iniciando migración de calidad_agua...');
    
    try {
        // Obtener datos de PostgreSQL local con límites de valores
        const localData = await localPool.query(`
            SELECT fecha, 
                   CASE WHEN ph > 9999.9999 THEN 9999.9999 ELSE ph END as ph,
                   CASE WHEN turbidez > 9999.9999 THEN 9999.9999 ELSE turbidez END as turbidez,
                   CASE WHEN conductividad > 9999.9999 THEN 9999.9999 ELSE conductividad END as conductividad,
                   CASE WHEN tds > 9999.9999 THEN 9999.9999 ELSE tds END as tds,
                   CASE WHEN dureza > 9999.9999 THEN 9999.9999 ELSE dureza END as dureza,
                   CASE WHEN color > 9999.9999 THEN 9999.9999 ELSE color END as color,
                   CASE WHEN ica > 9999.9999 THEN 9999.9999 ELSE ica END as ica
            FROM calidad_agua 
            ORDER BY fecha ASC
        `);

        console.log(`📊 Datos encontrados en local: ${localData.rows.length} registros`);

        if (localData.rows.length === 0) {
            console.log('⚠️  No hay datos para migrar en calidad_agua');
            return { success: true, migrated: 0 };
        }

        // Verificar y reportar valores limitados
        const originalData = await localPool.query(`
            SELECT COUNT(*) as total_limitados
            FROM calidad_agua 
            WHERE ph > 9999.9999 OR turbidez > 9999.9999 OR conductividad > 9999.9999 
               OR tds > 9999.9999 OR dureza > 9999.9999 OR color > 9999.9999 OR ica > 9999.9999
        `);

        if (parseInt(originalData.rows[0].total_limitados) > 0) {
            console.log(`⚠️  ${originalData.rows[0].total_limitados} registros tenían valores > 9999.9999 y fueron limitados`);
        }

        // Preparar datos para Supabase (agregar sensor_id)
        const dataForSupabase = localData.rows.map(row => ({
            ...row,
            sensor_id: 'MIGRATED_LOCAL' // Identificar datos migrados
        }));

        // Insertar en lotes de 100 registros
        const batchSize = 100;
        let totalMigrated = 0;

        for (let i = 0; i < dataForSupabase.length; i += batchSize) {
            const batch = dataForSupabase.slice(i, i + batchSize);
            
            console.log(`📤 Migrando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(dataForSupabase.length/batchSize)} (${batch.length} registros)...`);

            const { data, error } = await supabase
                .from('calidad_agua')
                .insert(batch)
                .select('id');

            if (error) {
                console.error('❌ Error en lote:', error);
                throw error;
            }

            totalMigrated += batch.length;
            console.log(`✅ Lote completado. Total migrado: ${totalMigrated}/${dataForSupabase.length}`);
        }

        console.log(`✅ calidad_agua migrada: ${totalMigrated} registros`);
        return { success: true, migrated: totalMigrated };

    } catch (error) {
        console.error('❌ Error migrando calidad_agua:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Migrar datos de datos_predic
 */
async function migrarDatosPredic() {
    console.log('🔄 Iniciando migración de datos_predic...');
    
    try {
        // Verificar si existe la tabla en local
        const tableExists = await localPool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'datos_predic'
            );
        `);

        if (!tableExists.rows[0].exists) {
            console.log('⚠️  Tabla datos_predic no existe en local');
            return { success: true, migrated: 0 };
        }

        // Obtener datos de PostgreSQL local
        const localData = await localPool.query(`
            SELECT fecha, ph, turbidez, conductividad, tds, dureza, color, ica 
            FROM datos_predic 
            ORDER BY fecha ASC
        `);

        console.log(`📊 Predicciones encontradas en local: ${localData.rows.length} registros`);

        if (localData.rows.length === 0) {
            console.log('⚠️  No hay predicciones para migrar');
            return { success: true, migrated: 0 };
        }

        // Preparar datos para Supabase
        const dataForSupabase = localData.rows.map(row => ({
            ...row,
            modelo_version: 'MIGRATED_v1.0',
            confianza: null
        }));

        // Insertar en Supabase
        const { data, error } = await supabase
            .from('datos_predic')
            .insert(dataForSupabase)
            .select('id');

        if (error) throw error;

        console.log(`✅ datos_predic migrada: ${dataForSupabase.length} registros`);
        return { success: true, migrated: dataForSupabase.length };

    } catch (error) {
        console.error('❌ Error migrando datos_predic:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Limpiar datos existentes en Supabase (opcional)
 */
async function limpiarDatosExistentes() {
    console.log('🧹 ¿Limpiar datos existentes en Supabase? (y/N)');
    
    // Para automatizar, asumimos que queremos limpiar datos de prueba
    const { data: existingData, error } = await supabase
        .from('calidad_agua')
        .select('id, sensor_id')
        .or('sensor_id.eq.TEST_SUPABASE,sensor_id.eq.MIGRATED_LOCAL');

    if (error) {
        console.log('⚠️  No se pudieron verificar datos existentes');
        return;
    }

    if (existingData.length > 0) {
        console.log(`🗑️  Eliminando ${existingData.length} registros de prueba/migración anterior...`);
        
        const { error: deleteError } = await supabase
            .from('calidad_agua')
            .delete()
            .or('sensor_id.eq.TEST_SUPABASE,sensor_id.eq.MIGRATED_LOCAL');

        if (deleteError) {
            console.error('❌ Error limpiando datos:', deleteError);
        } else {
            console.log('✅ Datos anteriores eliminados');
        }
    } else {
        console.log('✅ No hay datos de prueba para limpiar');
    }
}
async function verificarEstado() {
    console.log('🔍 Verificando estado actual...');
    
    try {
        // Verificar conexión local
        const localResult = await localPool.query('SELECT current_database()');
        console.log(`✅ Conectado a PostgreSQL local: ${localResult.rows[0].current_database}`);

        // Contar registros locales
        const localCount = await localPool.query('SELECT COUNT(*) as total FROM calidad_agua');
        console.log(`📊 Registros locales en calidad_agua: ${localCount.rows[0].total}`);

        // Verificar conexión Supabase
        const { count: supabaseCount, error } = await supabase
            .from('calidad_agua')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;

        console.log(`📊 Registros actuales en Supabase: ${supabaseCount}`);

        return {
            local: parseInt(localCount.rows[0].total),
            supabase: supabaseCount
        };

    } catch (error) {
        console.error('❌ Error verificando estado:', error);
        throw error;
    }
}

/**
 * Función principal de migración
 */
async function ejecutarMigracion() {
    const startTime = Date.now();
    console.log('🚀 INICIANDO MIGRACIÓN COMPLETA');
    console.log('='.repeat(50));

    try {
        // 0. Limpiar datos existentes si es necesario
        console.log('\n📋 PASO 0: Verificando datos existentes');
        console.log('-'.repeat(30));
        await limpiarDatosExistentes();

        // 1. Verificar estado inicial
        const estadoInicial = await verificarEstado();
        
        if (estadoInicial.local === 0) {
            console.log('⚠️  No hay datos para migrar. Finalizando...');
            return;
        }

        // 2. Migrar calidad_agua
        console.log('\n📋 PASO 1: Migrando calidad_agua');
        console.log('-'.repeat(30));
        const resultadoCalidad = await migrarCalidadAgua();

        if (!resultadoCalidad.success) {
            throw new Error(`Error en calidad_agua: ${resultadoCalidad.error}`);
        }

        // 3. Migrar datos_predic
        console.log('\n📋 PASO 2: Migrando datos_predic');
        console.log('-'.repeat(30));
        const resultadoPredic = await migrarDatosPredic();

        if (!resultadoPredic.success) {
            throw new Error(`Error en datos_predic: ${resultadoPredic.error}`);
        }

        // 4. Verificar estado final
        console.log('\n📋 PASO 3: Verificando migración');
        console.log('-'.repeat(30));
        const estadoFinal = await verificarEstado();

        // 5. Resumen
        const duracion = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('\n🎉 MIGRACIÓN COMPLETADA');
        console.log('='.repeat(50));
        console.log(`⏱️  Duración: ${duracion} segundos`);
        console.log(`📊 calidad_agua migrada: ${resultadoCalidad.migrated} registros`);
        console.log(`📊 datos_predic migrada: ${resultadoPredic.migrated} registros`);
        console.log(`📈 Total registros en Supabase: ${estadoFinal.supabase}`);
        console.log('\n✅ ¡Migración exitosa! Ahora puedes usar Supabase.');

    } catch (error) {
        console.error('\n❌ ERROR EN MIGRACIÓN:', error.message);
        process.exit(1);
    } finally {
        // Cerrar conexiones
        await localPool.end();
        console.log('\n🔌 Conexiones cerradas');
    }
}

// =====================================================
// EJECUTAR MIGRACIÓN
// =====================================================

if (require.main === module) {
    ejecutarMigracion();
}

module.exports = {
    ejecutarMigracion,
    migrarCalidadAgua,
    migrarDatosPredic,
    verificarEstado
};
