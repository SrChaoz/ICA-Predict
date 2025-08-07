// =====================================================
// DEMOSTRACIÓN DEL PROCESO DE HASHEO DE CONTRASEÑAS
// =====================================================

const bcrypt = require('bcryptjs');

/**
 * PASO 1: Generar hash de una contraseña
 */
async function demonstrateHashing() {
    const password = 'password123';
    
    console.log('🔐 DEMOSTRACIÓN DE HASHEO DE CONTRASEÑAS');
    console.log('=' * 50);
    
    // 1. Contraseña original
    console.log('1. Contraseña original:', password);
    
    // 2. Generar salt (sal aleatoria)
    const saltRounds = 10; // 2^10 = 1024 iteraciones
    const salt = await bcrypt.genSalt(saltRounds);
    console.log('2. Salt generada:', salt);
    
    // 3. Crear hash con salt
    const hash = await bcrypt.hash(password, salt);
    console.log('3. Hash final:', hash);
    
    // 4. Verificar contraseña
    const isValid = await bcrypt.compare(password, hash);
    console.log('4. Verificación correcta:', isValid);
    
    const wrongPassword = 'wrongpassword';
    const isWrong = await bcrypt.compare(wrongPassword, hash);
    console.log('5. Verificación incorrecta:', isWrong);
    
    console.log('\n💡 EXPLICACIÓN DEL HASH:');
    console.log('- Algoritmo: bcrypt');
    console.log('- Rounds: 10 (significa 2^10 = 1024 iteraciones)');
    console.log('- Salt: Previene ataques de rainbow table');
    console.log('- Irreversible: No se puede obtener la contraseña original');
    
    return hash;
}

/**
 * PASO 2: Función para hashear contraseñas en la aplicación
 */
async function hashPassword(plainPassword) {
    try {
        const saltRounds = 10;
        const hash = await bcrypt.hash(plainPassword, saltRounds);
        return hash;
    } catch (error) {
        throw new Error('Error al hashear contraseña');
    }
}

/**
 * PASO 3: Función para verificar contraseñas
 */
async function verifyPassword(plainPassword, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        throw new Error('Error al verificar contraseña');
    }
}

/**
 * PASO 4: Generar múltiples hashes de la misma contraseña
 */
async function demonstrateUniqueness() {
    const password = 'password123';
    
    console.log('\n🔄 DEMOSTRACIÓN DE UNICIDAD:');
    console.log('Cada hash es único aunque la contraseña sea igual:');
    
    for (let i = 1; i <= 3; i++) {
        const hash = await hashPassword(password);
        console.log(`Hash ${i}:`, hash);
    }
}

/**
 * EJECUTAR DEMOSTRACIONES
 */
if (require.main === module) {
    (async () => {
        await demonstrateHashing();
        await demonstrateUniqueness();
    })();
}

module.exports = {
    hashPassword,
    verifyPassword,
    demonstrateHashing
};
