# Usa una imagen base de Python 3.10-slim para compatibilidad con las dependencias
FROM python:3.10-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Actualiza pip a la última versión
RUN pip install --upgrade pip

# Instala las dependencias necesarias para compilar psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev gcc --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copia el archivo de dependencias al contenedor
COPY requirements.txt ./

# Instala las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código fuente al contenedor
COPY . .

# Expone el puerto en el que el modelo estará disponible
EXPOSE 5000

# Comando por defecto para ejecutar el modelo
CMD ["python", "app.py"]