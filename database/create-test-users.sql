-- Script para crear usuarios de prueba en Supabase
-- Este script debe ejecutarse en el SQL Editor de Supabase

-- Primero, asegurémonos de que la tabla usuarios existe
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('operador', 'control_calidad', 'admin')),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_conexion TIMESTAMP
);

-- Insertar usuarios de prueba
-- Contraseña para todos: "password123"
-- Hash generado con bcrypt rounds=10

INSERT INTO usuarios (username, password_hash, nombre, email, rol) VALUES
(
    'operador1',
    '$2b$10$.nuLHu59D.E4wRZSfRn9Nef64k/.Uqx3I1YHVJqKTcI0gvW/Q6pt.',
    'Juan Pérez',
    'operador1@aquaher.com',
    'operador'
),
(
    'control1',
    '$2b$10$.nuLHu59D.E4wRZSfRn9Nef64k/.Uqx3I1YHVJqKTcI0gvW/Q6pt.',
    'María García',
    'control1@aquaher.com',
    'control_calidad'
),
(
    'admin',
    '$2b$10$.nuLHu59D.E4wRZSfRn9Nef64k/.Uqx3I1YHVJqKTcI0gvW/Q6pt.',
    'Administrador del Sistema',
    'admin@aquaher.com',
    'admin'
)
ON CONFLICT (username) DO NOTHING;

-- Verificar que los usuarios se crearon correctamente
SELECT id, username, nombre, email, rol, activo, fecha_creacion
FROM usuarios
ORDER BY id;
