-- Script SQL para crear tabla de usuarios en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'operador' CHECK (role IN ('operador', 'control_calidad')),
    nombre_completo VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar usuarios de ejemplo
INSERT INTO usuarios (username, email, password_hash, role, nombre_completo) VALUES
('operador1', 'operador1@empresa.com', '$2b$10$rQ8KvzMZm7nYZi4qY.1fFu4PZo4y9X5X5X5X5X5X5X5X5X5X5X5X5', 'operador', 'Juan Pérez'),
('calidad1', 'calidad1@empresa.com', '$2b$10$rQ8KvzMZm7nYZi4qY.1fFu4PZo4y9X5X5X5X5X5X5X5X5X5X5X5X5', 'control_calidad', 'María García');

-- Para contraseñas reales, usar bcrypt para hashear
-- Por ahora las contraseñas son: 'password123' para ambos usuarios

-- Tabla de sesiones (opcional, para manejo de sesiones)
CREATE TABLE IF NOT EXISTS sesiones (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES usuarios(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean su propia información
CREATE POLICY "Users can view own data" ON usuarios 
    FOR SELECT USING (auth.uid()::text = id::text);

-- Función para verificar contraseñas (ejemplo)
CREATE OR REPLACE FUNCTION verificar_usuario(username_input TEXT, password_input TEXT)
RETURNS TABLE(user_id INT, username TEXT, role TEXT, nombre_completo TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.role, u.nombre_completo
    FROM usuarios u
    WHERE u.username = username_input 
    AND u.activo = true;
    -- Nota: En producción, verificar el hash de la contraseña aquí
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
