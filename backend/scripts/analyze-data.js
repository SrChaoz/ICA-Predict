// =====================================================
// SCRIPT DE VERIFICACIÓN DE DATOS
// =====================================================
// Analiza los datos locales para encontrar valores problemáticos
// =====================================================

const { Pool } = require('pg');
require('dotenv').config();

const localPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function analizarDatos() {
    console.log('🔍 ANALIZANDO DATOS LOCALES');
    console.log('='.repeat(50));

    try {
        // Obtener estadísticas de cada campo
        const stats = await localPool.query(`
            SELECT 
                COUNT(*) as total_registros,
                MIN(ph) as ph_min, MAX(ph) as ph_max,
                MIN(turbidez) as turbidez_min, MAX(turbidez) as turbidez_max,
                MIN(conductividad) as conductividad_min, MAX(conductividad) as conductividad_max,
                MIN(tds) as tds_min, MAX(tds) as tds_max,
                MIN(dureza) as dureza_min, MAX(dureza) as dureza_max,
                MIN(color) as color_min, MAX(color) as color_max,
                MIN(ica) as ica_min, MAX(ica) as ica_max
            FROM calidad_agua
        `);

        const data = stats.rows[0];
        console.log('📊 ESTADÍSTICAS GENERALES:');
        console.log(`Total registros: ${data.total_registros}`);
        console.log('');

        // Verificar cada campo (DECIMAL(8,4) permite valores hasta 9999.9999)
        const limite = 9999.9999;
        
        console.log('📈 RANGOS DE VALORES:');
        console.log(`pH: ${data.ph_min} - ${data.ph_max} ${data.ph_max > limite ? '❌ EXCEDE LÍMITE' : '✅'}`);
        console.log(`Turbidez: ${data.turbidez_min} - ${data.turbidez_max} ${data.turbidez_max > limite ? '❌ EXCEDE LÍMITE' : '✅'}`);
        console.log(`Conductividad: ${data.conductividad_min} - ${data.conductividad_max} ${data.conductividad_max > limite ? '❌ EXCEDE LÍMITE' : '✅'}`);
        console.log(`TDS: ${data.tds_min} - ${data.tds_max} ${data.tds_max > limite ? '❌ EXCEDE LÍMITE' : '✅'}`);
        console.log(`Dureza: ${data.dureza_min} - ${data.dureza_max} ${data.dureza_max > limite ? '❌ EXCEDE LÍMITE' : '✅'}`);
        console.log(`Color: ${data.color_min} - ${data.color_max} ${data.color_max > limite ? '❌ EXCEDE LÍMITE' : '✅'}`);
        console.log(`ICA: ${data.ica_min} - ${data.ica_max} ${data.ica_max > limite ? '❌ EXCEDE LÍMITE' : '✅'}`);

        // Buscar registros problemáticos
        console.log('\n🔍 BUSCANDO REGISTROS PROBLEMÁTICOS:');
        
        const problemRecords = await localPool.query(`
            SELECT fecha, ph, turbidez, conductividad, tds, dureza, color, ica
            FROM calidad_agua 
            WHERE ph > $1 OR turbidez > $1 OR conductividad > $1 
               OR tds > $1 OR dureza > $1 OR color > $1 OR ica > $1
            ORDER BY fecha DESC
            LIMIT 10
        `, [limite]);

        if (problemRecords.rows.length > 0) {
            console.log(`❌ Encontrados ${problemRecords.rows.length} registros problemáticos:`);
            problemRecords.rows.forEach((row, index) => {
                console.log(`${index + 1}. Fecha: ${row.fecha}`);
                if (row.ph > limite) console.log(`   - pH: ${row.ph} ❌`);
                if (row.turbidez > limite) console.log(`   - Turbidez: ${row.turbidez} ❌`);
                if (row.conductividad > limite) console.log(`   - Conductividad: ${row.conductividad} ❌`);
                if (row.tds > limite) console.log(`   - TDS: ${row.tds} ❌`);
                if (row.dureza > limite) console.log(`   - Dureza: ${row.dureza} ❌`);
                if (row.color > limite) console.log(`   - Color: ${row.color} ❌`);
                if (row.ica > limite) console.log(`   - ICA: ${row.ica} ❌`);
                console.log('');
            });
        } else {
            console.log('✅ No se encontraron registros problemáticos');
        }

        // Verificar valores NULL
        console.log('🔍 VERIFICANDO VALORES NULL:');
        const nullCheck = await localPool.query(`
            SELECT 
                COUNT(*) - COUNT(ph) as ph_nulls,
                COUNT(*) - COUNT(turbidez) as turbidez_nulls,
                COUNT(*) - COUNT(conductividad) as conductividad_nulls,
                COUNT(*) - COUNT(tds) as tds_nulls,
                COUNT(*) - COUNT(dureza) as dureza_nulls,
                COUNT(*) - COUNT(color) as color_nulls,
                COUNT(*) - COUNT(ica) as ica_nulls
            FROM calidad_agua
        `);

        const nullData = nullCheck.rows[0];
        console.log(`pH NULLs: ${nullData.ph_nulls}`);
        console.log(`Turbidez NULLs: ${nullData.turbidez_nulls}`);
        console.log(`Conductividad NULLs: ${nullData.conductividad_nulls}`);
        console.log(`TDS NULLs: ${nullData.tds_nulls}`);
        console.log(`Dureza NULLs: ${nullData.dureza_nulls}`);
        console.log(`Color NULLs: ${nullData.color_nulls}`);
        console.log(`ICA NULLs: ${nullData.ica_nulls}`);

    } catch (error) {
        console.error('❌ Error analizando datos:', error);
    } finally {
        await localPool.end();
    }
}

analizarDatos();
