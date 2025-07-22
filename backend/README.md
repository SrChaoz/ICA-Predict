# README - Backend

## Descripción
El backend está desarrollado en Node.js con Express.js y se encarga de:
- Recibir solicitudes del frontend.
- Consultar y actualizar la base de datos SQL.

## Instalación
```bash
cd backend
npm install
```

## Configuración
1. Crear un archivo `.env` en la carpeta `backend` con el siguiente contenido:
```
DB_PORT=5432
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=nombre_base_de_datos
```

2. Para ejecutar el servidor:
```bash
npm start
```

## Rutas Principales
- **`POST /predict`**: Recibe una fecha y devuelve los parámetros de calidad del agua predichos.
- **`POST /upload-data`**: Permite cargar nuevos datos a la base de datos.
- **`GET /data`**: Obtiene los datos almacenados en la base de datos.

---
