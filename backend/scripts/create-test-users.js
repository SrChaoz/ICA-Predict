const { crearUsuario } = require('../services/authService');

async function crearUsuariosPrueba() {
    console.log('🔄 Creando usuarios de prueba...');
    
    const usuarios = [
        {
            username: 'operador1',
            password: 'password123',
            nombre: 'Juan Pérez',
            email: 'operador1@aquaher.com',
            rol: 'operador'
        },
        {
            username: 'control1',
            password: 'password123',
            nombre: 'María García',
            email: 'control1@aquaher.com',
            rol: 'control_calidad'
        },
        {
            username: 'admin',
            password: 'password123',
            nombre: 'Carlos Admin',
            email: 'admin@aquaher.com',
            rol: 'admin'
        }
    ];

    for (const usuario of usuarios) {
        try {
            console.log(`📝 Creando usuario: ${usuario.username} (${usuario.rol})`);
            await crearUsuario(usuario);
            console.log(`✅ Usuario ${usuario.username} creado exitosamente`);
        } catch (error) {
            if (error.message.includes('already exists') || error.message.includes('ya existe')) {
                console.log(`⚠️  Usuario ${usuario.username} ya existe, saltando...`);
            } else {
                console.error(`❌ Error creando usuario ${usuario.username}:`, error.message);
            }
        }
    }
    
    console.log('\n🎉 Proceso completado!');
    console.log('\n👤 Usuarios creados:');
    console.log('   operador1 / password123 (Operador)');
    console.log('   control1 / password123 (Control de Calidad)');
    console.log('   admin / password123 (Administrador)');
    
    process.exit(0);
}

crearUsuariosPrueba().catch(error => {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
});
