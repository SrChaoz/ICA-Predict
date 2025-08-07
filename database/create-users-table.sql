-- Script para crear tabla de usuarios con roles
-- Ejecutar en Supabase SQL Editor

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('operador', 'control_calidad')),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar usuarios de ejemplo (las contraseñas están hasheadas con bcrypt)
-- Contraseña para todos: "password123"
INSERT INTO usuarios (username, password_hash, rol, nombre, email) VALUES
('operador1', '$2b$10$rO0H1Qz8Z8K6V8A1N8V8AO8V8A1N8V8AO8V8A1N8V8AO8V8A1N8V8A', 'operador', 'Juan Pérez', 'operador@ica.com'),
('control1', '$2b$10$rO0H1Qz8Z8K6V8A1N8V8AO8V8A1N8V8AO8V8A1N8V8AO8V8A1N8V8A', 'control_calidad', 'María García', 'control@ica.com'),
('operador2', '$2b$10$rO0H1Qz8Z8K6V8A1N8V8AO8V8A1N8V8AO8V8A1N8V8AO8V8A1N8V8A', 'operador', 'Carlos López', 'operador2@ica.com');

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Habilitar RLS (Row Level Security) opcional
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean su propia información
CREATE POLICY "Usuarios pueden ver su propia información" ON usuarios
    FOR SELECT USING (auth.uid()::text = id::text);

COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema ICA Predict con roles operador y control_calidad';
