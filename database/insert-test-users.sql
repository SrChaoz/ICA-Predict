-- Crear usuarios de prueba para el sistema
-- Ejecutar después de crear la tabla users

-- Usuario operador
INSERT INTO users (username, password, nombre, rol, activo) VALUES 
('operador1', '$2b$10$8UaGQRZ9nKX.qH9lPzl3wOTFd9ZJV5L8KP4YrGy.5tH2HZ6xN3V8G', 'Juan Pérez', 'operador', true);

-- Usuario control de calidad
INSERT INTO users (username, password, nombre, rol, activo) VALUES 
('controlador1', '$2b$10$8UaGQRZ9nKX.qH9lPzl3wOTFd9ZJV5L8KP4YrGy.5tH2HZ6xN3V8G', 'María González', 'control_calidad', true);

-- Nota: Ambos usuarios tienen la contraseña "123456"
-- Se recomienda cambiar estas contraseñas en producción

-- Verificar que los usuarios se crearon correctamente
SELECT username, nombre, rol, activo, created_at FROM users;
