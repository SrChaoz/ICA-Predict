// =====================================================
// SERVICIO DE AUTENTICACIÓN
// =====================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/dbConfig');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura-para-jwt';
const JWT_EXPIRES_IN = '24h';

// =====================================================
// FUNCIONES DE AUTENTICACIÓN
// =====================================================

/**
 * Autenticar usuario con username y password
 */
async function autenticarUsuario(username, password) {
    try {
        // Buscar usuario por username
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('username', username)
            .eq('activo', true)
            .single();

        if (error || !usuario) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        // Verificar contraseña
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        
        if (!passwordValida) {
            return { success: false, message: 'Contraseña incorrecta' };
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: usuario.id, 
                username: usuario.username, 
                rol: usuario.rol,
                nombre: usuario.nombre 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return {
            success: true,
            user: {
                id: usuario.id,
                username: usuario.username,
                rol: usuario.rol,
                nombre: usuario.nombre,
                email: usuario.email
            },
            token
        };

    } catch (error) {
        console.error('Error en autenticación:', error);
        return { success: false, message: 'Error interno del servidor' };
    }
}

/**
 * Verificar token JWT
 */
function verificarToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { success: true, user: decoded };
    } catch (error) {
        return { success: false, message: 'Token inválido o expirado' };
    }
}

/**
 * Middleware para proteger rutas
 */
function protegerRuta(rolesPermitidos = []) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token requerido' });
        }

        const token = authHeader.substring(7);
        const verificacion = verificarToken(token);

        if (!verificacion.success) {
            return res.status(401).json({ error: verificacion.message });
        }

        // Verificar rol si se especifica
        if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(verificacion.user.rol)) {
            return res.status(403).json({ error: 'Acceso denegado. Rol insuficiente.' });
        }

        req.user = verificacion.user;
        next();
    };
}

/**
 * Hashear contraseña
 */
async function hashearPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Crear nuevo usuario (solo para administradores)
 */
async function crearUsuario(datosUsuario) {
    try {
        const { username, password, rol, nombre, email } = datosUsuario;

        // Verificar que el usuario no exista
        const { data: usuarioExistente } = await supabase
            .from('usuarios')
            .select('id')
            .eq('username', username)
            .single();

        if (usuarioExistente) {
            return { success: false, message: 'El usuario ya existe' };
        }

        // Hashear contraseña
        const passwordHash = await hashearPassword(password);

        // Crear usuario
        const { data: nuevoUsuario, error } = await supabase
            .from('usuarios')
            .insert([{
                username,
                password_hash: passwordHash,
                rol,
                nombre,
                email
            }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            success: true,
            user: {
                id: nuevoUsuario.id,
                username: nuevoUsuario.username,
                rol: nuevoUsuario.rol,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email
            }
        };

    } catch (error) {
        console.error('Error al crear usuario:', error);
        return { success: false, message: 'Error al crear usuario' };
    }
}

module.exports = {
    autenticarUsuario,
    verificarToken,
    protegerRuta,
    hashearPassword,
    crearUsuario
};
