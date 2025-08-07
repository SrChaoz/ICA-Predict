# 🚀 Guía de Despliegue en Google App Engine

## Prerrequisitos

1. **Cuenta de Google Cloud Platform**
   - Crear cuenta en https://cloud.google.com/
   - Activar facturación (GAE tiene nivel gratuito)

2. **Instalar Google Cloud CLI**
   ```bash
   # En Linux/macOS
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # O descargar desde: https://cloud.google.com/sdk/docs/install
   ```

3. **Crear proyecto en Google Cloud**
   ```bash
   # Autenticarse
   gcloud auth login
   
   # Crear proyecto
   gcloud projects create tu-proyecto-id --name="ICA Predict"
   
   # Seleccionar proyecto
   gcloud config set project tu-proyecto-id
   
   # Habilitar APIs necesarias
   gcloud services enable appengine.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   ```

## Pasos de Configuración

### 1. Configurar la Base de Datos

¡Ya tienes Supabase configurado! 🎉 Esto simplifica mucho el proceso.

Solo necesitas obtener tus credenciales de Supabase:

1. Ve a tu [Dashboard de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** (ej: `https://abcdefgh.supabase.co`)
   - **service_role key** (⚠️ mantén esta clave secreta)

### 2. Actualizar Variables de Entorno

Edita los archivos `app.yaml` en cada servicio:

**backend/app.yaml:**
```yaml
env_variables:
  DATABASE_TYPE: supabase
  SUPABASE_URL: "https://tu-proyecto.supabase.co"
  SUPABASE_SERVICE_ROLE_KEY: "tu-service-role-key-secreto"
  MODEL_URL: "https://model-dot-tu-proyecto-id.appspot.com/predict"
```

**model/app.yaml:**
```yaml
env_variables:
  DATABASE_TYPE: supabase
  SUPABASE_URL: "https://tu-proyecto.supabase.co"  
  SUPABASE_SERVICE_ROLE_KEY: "tu-service-role-key-secreto"
```

### 3. Verificar configuración

Ejecuta el script de verificación para asegurarte de que todo esté listo:

```bash
./check-deployment.sh
```

### 4. Construir Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

### 5. Desplegar Servicios

Puedes usar el script automatizado:

```bash
./deploy-to-gae.sh
```

O desplegar manualmente cada servicio:

```bash
# 1. Desplegar modelo
cd model
gcloud app deploy app.yaml

# 2. Desplegar backend  
cd ../backend
gcloud app deploy app.yaml

# 3. Desplegar frontend
cd ../frontend
gcloud app deploy app.yaml
```

## URLs de Acceso

Después del despliegue:

- **Frontend (principal)**: `https://tu-proyecto-id.appspot.com`
- **Backend API**: `https://backend-dot-tu-proyecto-id.appspot.com`
- **Modelo ML**: `https://model-dot-tu-proyecto-id.appspot.com`

## Monitoreo y Logs

```bash
# Ver logs del backend
gcloud app logs tail -s backend

# Ver logs del modelo
gcloud app logs tail -s model

# Ver logs del frontend
gcloud app logs tail -s default
```

## Costos Estimados (con Supabase)

- **Nivel gratuito GAE**: Hasta 28 horas de instancia por día
- **F1 instances**: ~$0.05/hora después del nivel gratuito
- **Supabase Free Tier**: 500MB DB + 2GB transferencia gratis
- **Total mensual**: ~$0-15 para desarrollo/pruebas

## Solución de Problemas

### Error de compilación en frontend
```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

### Error de conexión a base de datos
- Verificar que las credenciales en `app.yaml` sean correctas
- Revisar que la instancia Cloud SQL esté corriendo
- Comprobar reglas de firewall

### Error 500 en servicios
```bash
# Ver logs específicos
gcloud app logs tail -s nombre-del-servicio
```

## Actualizaciones Futuras

Para actualizar la aplicación:

```bash
# Rebuilding frontend si hay cambios
cd frontend && npm run build && cd ..

# Redesplegar servicios modificados
gcloud app deploy backend/app.yaml  # Solo si cambió backend
gcloud app deploy frontend/app.yaml # Solo si cambió frontend
gcloud app deploy model/app.yaml    # Solo si cambió modelo
```

## Seguridad

- Configura HTTPS (habilitado por defecto en GAE)
- Usa IAM para controlar acceso
- Considera usar Secret Manager para credenciales
- Configura CORS apropiadamente en el backend
