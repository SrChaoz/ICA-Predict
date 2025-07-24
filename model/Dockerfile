FROM python:3.12.11-slim-bookworm

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Instala dependencias del sistema necesarias para compilar librerías científicas y PostgreSQL
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    build-essential \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Actualiza pip
RUN pip install --upgrade pip

# Copia el archivo de dependencias
COPY requirements.txt ./

# Instala primero las dependencias básicas que tienen binarios precompilados
RUN pip install --no-cache-dir \
    flask \
    pandas \
    numpy \
    psycopg2-binary \
    python-dotenv

# Instala scikit-learn (versión que tiene binarios)
RUN pip install --no-cache-dir scikit-learn==1.5.2

# Instala xgboost (versión con binarios precompilados)
RUN pip install --no-cache-dir xgboost==2.1.3

# Instala el resto de dependencias
RUN pip install --no-cache-dir \
    shap \
    seaborn

# Copia el resto del código fuente
COPY . .

# Expone el puerto (ajústalo si usas otro)
EXPOSE 5000

# Comando por defecto
CMD ["python", "app.py"]
