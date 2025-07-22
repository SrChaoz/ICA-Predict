import pandas as pd
import psycopg2
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

# Conexión a la base de datos
conn = psycopg2.connect(
    dbname=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    host=os.getenv('DB_HOST'),
    port=os.getenv('DB_PORT')
)

# Cargar los datos
query = "SELECT * FROM calidad_agua"
df = pd.read_sql(query, conn)

# Filtrar solo columnas numéricas para evitar errores
numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns

# Inspeccionar el resumen estadístico general
print("\nResumen Estadístico:")
print(df.describe())

# Detectar valores negativos en columnas numéricas
print("\nValores negativos:")
print((df[numeric_cols] < 0).sum())

# Detectar valores nulos
print("\n Valores nulos:")
print(df.isnull().sum())

# Verificar si hay valores fuera de un rango lógico
print("\n Posibles valores fuera de rango:")
for col in numeric_cols:
    max_value = df[col].max()
    min_value = df[col].min()
    print(f"{col} → Min: {min_value}, Max: {max_value}")

# Mostrar las primeras 5 filas para visualizar los datos
print("\nPrimeras 5 filas del DataFrame:")
print(df.head())

# Cerrar conexión
conn.close()
