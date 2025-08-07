# Guía para configurar la base de datos en Google Cloud

## Opción 1: Cloud SQL (Recomendado para producción)

### 1. Crear instancia de Cloud SQL
```bash
# Crear instancia PostgreSQL
gcloud sql instances create ica-predict-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=10GB

# Crear base de datos
gcloud sql databases create CanalMesiasDB \
    --instance=ica-predict-db

# Crear usuario
gcloud sql users create your-username \
    --instance=ica-predict-db \
    --password=your-secure-password
```

### 2. Restaurar datos desde backup
```bash
# Subir el backup a Cloud Storage
gsutil cp database/backups/CanalMesiasDB_26_03_2025.backup gs://your-bucket-name/

# Importar el backup
gcloud sql import sql ica-predict-db gs://your-bucket-name/CanalMesiasDB_26_03_2025.backup \
    --database=CanalMesiasDB
```

### 3. Configurar conexión segura
```bash
# Obtener la dirección IP de la instancia
gcloud sql instances describe ica-predict-db --format="value(ipAddresses[0].ipAddress)"

# Configurar proxy de conexión (para desarrollo local)
cloud_sql_proxy -instances=YOUR_PROJECT_ID:us-central1:ica-predict-db=tcp:5432
```

## Opción 2: Base de datos externa (Supabase, Railway, etc.)

Si prefieres usar una base de datos externa como Supabase:

1. Crear proyecto en Supabase
2. Obtener las credenciales de conexión
3. Migrar los datos usando los scripts en `/database/`

## Configuración de variables de entorno

Después de configurar la base de datos, actualiza los archivos app.yaml:

### backend/app.yaml
```yaml
env_variables:
  DB_HOST: "YOUR_DB_HOST"
  DB_PORT: "5432"
  DB_NAME: "CanalMesiasDB"
  DB_USER: "YOUR_DB_USER"
  DB_PASSWORD: "YOUR_DB_PASSWORD"
```

### model/app.yaml
```yaml
env_variables:
  DB_HOST: "YOUR_DB_HOST"
  DB_PORT: "5432"
  DB_NAME: "CanalMesiasDB"
  DB_USER: "YOUR_DB_USER"
  DB_PASSWORD: "YOUR_DB_PASSWORD"
```

## Seguridad

- Nunca commits las credenciales reales en el repositorio
- Usa Google Secret Manager para credenciales sensibles
- Configura reglas de firewall apropiadas para Cloud SQL
