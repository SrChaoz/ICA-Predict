# README - Frontend

## Descripción
El frontend está desarrollado en React (Vite) y permite:
- Enviar una fecha para obtener predicciones de los parámetros del agua.
- Visualizar datos almacenados en la base de datos con búsqueda por fecha.
- Cargar datos a la BD

## Instalación
```bash
cd frontend
npm install
```

## Configuración
1. Crear un .env en la carpeta frontend con el siguinete contenido:
```bash
VITE_API_URL=http://localhost:3000
```
2. Para ejecutar el frontend:
```bash
npm run dev
```

## Estructura de Pantallas
- **Inicio**: Formulario de predicción.
- **Visualizar Datos**: Tabla con búsqueda por fecha.
- **Historial Predicciones**: Tabla con búsqueda por fecha.
- **Cargar Datos**: Formulario para subir datos.

---

