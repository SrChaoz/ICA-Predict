// =====================================================
// RUTAS DE AUTENTICACIÓN Y GESTIÓN DE USUARIOS
// =====================================================

const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { supabase } = require('../config/dbConfig');

// =====================================================
// RUTA: LOGIN
// =====================================================
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validar datos requeridos
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username y password son requeridos'
            });
        }

        // Autenticar usuario
        const resultado = await authService.autenticarUsuario(username, password);

        if (!resultado.success) {
            return res.status(401).json(resultado);
        }

        res.json({
            success: true,
            message: 'Login exitoso',
            user: resultado.user,
            token: resultado.token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// =====================================================
// RUTA: VERIFICAR TOKEN
// =====================================================
router.get('/verify', authService.protegerRuta(), (req, res) => {
    res.json({
        success: true,
        user: req.user,
        message: 'Token válido'
    });
});

// =====================================================
// RUTA: LOGOUT (opcional - cliente maneja el token)
// =====================================================
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout exitoso. Elimina el token del cliente.'
    });
});

// =====================================================
// RUTA: PERFIL DEL USUARIO
// =====================================================
router.get('/profile', authService.protegerRuta(), (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            username: req.user.username,
            rol: req.user.rol,
            nombre: req.user.nombre
        }
    });
});

// =====================================================
// RUTA: CREAR USUARIO (solo para administradores)
// =====================================================
router.post('/register', authService.protegerRuta(['admin']), async (req, res) => {
    try {
        const { username, password, rol, nombre, email } = req.body;

        // Validar datos requeridos
        if (!username || !password || !rol || !nombre) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, rol y nombre son requeridos'
            });
        }

        // Validar rol - admin puede crear cualquier rol
        if (!['operador', 'control_calidad', 'admin'].includes(rol)) {
            return res.status(400).json({
                success: false,
                message: 'Rol debe ser "operador", "control_calidad" o "admin"'
            });
        }

        const resultado = await authService.crearUsuario({
            username, password, rol, nombre, email
        });

        if (!resultado.success) {
            return res.status(400).json(resultado);
        }

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: resultado.user
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// =====================================================
// RUTA: OBTENER LISTA DE USUARIOS (Solo Admin)
// =====================================================
router.get('/users', authService.protegerRuta(['admin']), async (req, res) => {
    try {
        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('id, username, nombre, email, rol, activo, fecha_creacion')
            .order('id');

        if (error) throw error;

        res.json({
            success: true,
            users: usuarios
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
});

// =====================================================
// RUTA: ACTIVAR/DESACTIVAR USUARIO (Solo Admin)
// =====================================================
router.patch('/users/:id/toggle', authService.protegerRuta(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        const { data: usuario, error } = await supabase
            .from('usuarios')
            .update({ activo })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
            user: usuario
        });

    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado del usuario'
        });
    }
});

// =====================================================
// RUTA: CAMBIAR CONTRASEÑA
// =====================================================
router.patch('/change-password', authService.protegerRuta(), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva son requeridas'
            });
        }

        // Verificar contraseña actual
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('password_hash')
            .eq('id', userId)
            .single();

        if (error) throw error;

        const bcrypt = require('bcryptjs');
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, usuario.password_hash);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        // Hashear nueva contraseña
        const newPasswordHash = await authService.hashearPassword(newPassword);

        // Actualizar contraseña
        const { error: updateError } = await supabase
            .from('usuarios')
            .update({ password_hash: newPasswordHash })
            .eq('id', userId);

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña'
        });
    }
});

module.exports = router;
