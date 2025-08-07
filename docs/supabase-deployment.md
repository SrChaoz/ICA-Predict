# 🚀 Despliegue Simplificado con Supabase

¡Excelente! Al usar Supabase como base de datos, el despliegue se simplifica mucho porque no necesitas configurar Cloud SQL.

## ✅ Ventajas de usar Supabase:

- ✨ **Sin configuración de base de datos adicional**
- 💰 **Más económico** (sin costos de Cloud SQL)
- 🔒 **Gestión de seguridad automática**
- 🌐 **Global por defecto**
- 📊 **Dashboard integrado para monitoreo**

## 📋 Pasos de despliegue:

### 1. Obtener credenciales de Supabase

Si no las tienes a mano, ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com):

1. Ve a **Settings** → **API**
2. Copia tu **Project URL** (ejemplo: `https://abcdefgh.supabase.co`)
3. Copia tu **service_role key** (⚠️ **secreta**, no la pongas en el frontend)

### 2. Configurar Google Cloud

```bash
# Instalar gcloud CLI si no lo tienes
curl https://sdk.cloud.google.com | bash

# Autenticarse
gcloud auth login

# Crear o seleccionar proyecto
gcloud projects create tu-proyecto-id --name="ICA Predict"
gcloud config set project tu-proyecto-id

# Habilitar App Engine
gcloud services enable appengine.googleapis.com
```

### 3. Actualizar credenciales en archivos app.yaml

**En `backend/app.yaml`:**
```yaml
env_variables:
  DATABASE_TYPE: supabase
  SUPABASE_URL: https://tu-proyecto.supabase.co
  SUPABASE_SERVICE_ROLE_KEY: tu-service-role-key-secreto
```

**En `model/app.yaml`:**
```yaml
env_variables:
  DATABASE_TYPE: supabase
  SUPABASE_URL: https://tu-proyecto.supabase.co
  SUPABASE_SERVICE_ROLE_KEY: tu-service-role-key-secreto
```

### 4. Desplegar

```bash
# Opción A: Script automatizado
./deploy-to-gae.sh

# Opción B: Manual
cd frontend && npm run build && cd ..
gcloud app deploy model/app.yaml --quiet
gcloud app deploy backend/app.yaml --quiet  
gcloud app deploy frontend/app.yaml --quiet
```

## 🌐 URLs finales:

- **Tu aplicación**: `https://tu-proyecto-id.appspot.com`
- **API Backend**: `https://backend-dot-tu-proyecto-id.appspot.com`
- **Modelo ML**: `https://model-dot-tu-proyecto-id.appspot.com`

## 💰 Costos estimados (muy bajo):

- **App Engine**: ~$0 en nivel gratuito (28 horas/día)
- **Supabase**: ~$0 en plan gratuito (hasta 500MB DB + 2GB transferencia)
- **Total**: Prácticamente gratis para desarrollo/pruebas

## 🔧 Verificar funcionamiento:

Después del despliegue, puedes probar:

```bash
# Test del backend
curl https://backend-dot-tu-proyecto-id.appspot.com/api/status

# Test del modelo
curl -X POST https://model-dot-tu-proyecto-id.appspot.com/predict \
  -H "Content-Type: application/json" \
  -d '{"fecha": "2025-08-15"}'
```

## 🔒 Seguridad:

- ✅ Las credenciales de Supabase están seguras en GAE
- ✅ HTTPS habilitado automáticamente
- ✅ CORS configurado en tu backend
- ✅ Supabase maneja autenticación y autorización

## 🐛 Solución de problemas:

```bash
# Ver logs del backend
gcloud app logs tail -s backend

# Ver logs del modelo
gcloud app logs tail -s model

# Verificar estado de servicios
gcloud app services list
```

---

**¡Listo para desplegar!** 🚀

Solo necesitas:
1. Configurar las credenciales de Supabase en los `app.yaml`
2. Ejecutar `./deploy-to-gae.sh`
3. ¡Disfrutar tu aplicación en la nube!
