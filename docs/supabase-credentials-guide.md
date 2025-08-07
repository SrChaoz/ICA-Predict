# =====================================================
# GUÍA PARA OBTENER CREDENCIALES DE SUPABASE
# =====================================================

## 1. Acceder al Dashboard
   - Ve a: https://supabase.com
   - Inicia sesión
   - Selecciona tu proyecto

## 2. Ir a Settings > API
   - Menu lateral: "Settings"
   - Submenu: "API"

## 3. Copiar credenciales

### Project URL (SUPABASE_URL)
   Se ve como: https://abcdefgh12345.supabase.co
   
### anon public (SUPABASE_ANON_KEY)
   Se ve como: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   
### service_role (SUPABASE_SERVICE_ROLE_KEY)
   Se ve como: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...

## 4. Pegar en .env
   SUPABASE_URL=https://abcdefgh12345.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =====================================================
# IMPORTANTE:
# - Project URL: NO termina en barra /
# - Las keys son muy largas (varios cientos de caracteres)
# - service_role key NUNCA va al frontend
# - anon key es segura para el frontend
# =====================================================
