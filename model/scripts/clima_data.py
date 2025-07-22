import requests
import psycopg2
from dotenv import load_dotenv
import os
from datetime import datetime
#https://open-meteo.com/

# Cargar variables de entorno
load_dotenv()

# Conexión a la base de datos
print(" Conectando a la base de datos...")
try:
    conn = psycopg2.connect(
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT')
    )
    cursor = conn.cursor()
    print(" Conexión exitosa a la base de datos.")
except Exception as e:
    print(f" Error al conectar a la base de datos: {e}")
    exit()

# Coordenadas de Rocafuerte, Ecuador
LATITUD = -0.9201
LONGITUD = -80.4492

# URL base de la API de Open-Meteo
URL_BASE = "https://archive-api.open-meteo.com/v1/archive"

# Función para obtener datos climáticos históricos
def obtener_datos_climaticos(fecha, lat, lon):
    print(f" Consultando datos climáticos para la fecha: {fecha}")
    params = {
        'latitude': lat,
        'longitude': lon,
        'start_date': fecha,
        'end_date': fecha,
        'hourly': ['temperature_2m', 'relative_humidity_2m', 'surface_pressure', 'windspeed_10m', 'precipitation'],
        'timezone': 'America/Guayaquil'
    }
    
    response = requests.get(URL_BASE, params=params)
    if response.status_code == 200:
        data = response.json()
        if 'hourly' in data:
            hourly_data = data['hourly']
            temperaturas = hourly_data['temperature_2m']
            humedades = hourly_data['relative_humidity_2m']
            presiones = hourly_data['surface_pressure']
            velocidades_viento = hourly_data['windspeed_10m']
            precipitaciones = hourly_data['precipitation']
            
            # Calcular promedios diarios
            print(f" Datos climáticos obtenidos para {fecha}")
            return {
                'temperatura': sum(temperaturas) / len(temperaturas),
                'humedad': sum(humedades) / len(humedades),
                'presion': sum(presiones) / len(presiones),
                'viento': sum(velocidades_viento) / len(velocidades_viento),
                'precipitacion': sum(precipitaciones) / len(precipitaciones)
            }
    else:
        print(f" Error en la consulta climática para la fecha {fecha}: Código {response.status_code}")
        return None

# Obtener fechas de la base de datos y actualizar los registros
print(" Obteniendo registros de la base de datos...")
cursor.execute("SELECT id, fecha FROM calidad_agua")
registros = cursor.fetchall()
print(f"Se encontraron {len(registros)} registros en la base de datos.")

procesados = 0
errores = 0

for id_registro, fecha in registros:
    fecha_str = fecha.strftime('%Y-%m-%d')
    print(f" Procesando registro ID: {id_registro}, Fecha: {fecha_str}")

    datos_clima = obtener_datos_climaticos(fecha_str, LATITUD, LONGITUD)
    if datos_clima:
        try:
            cursor.execute("""
                UPDATE calidad_agua
                SET precipitacion = %s,
                    temperatura = %s,
                    viento = %s,
                    humedad = %s,
                    presion = %s
                WHERE id = %s
            """, (
                datos_clima['precipitacion'],
                datos_clima['temperatura'],
                datos_clima['viento'],
                datos_clima['humedad'],
                datos_clima['presion'],
                id_registro
            ))
            print(f" Registro ID {id_registro} actualizado correctamente.")
            procesados += 1
        except Exception as e:
            print(f" Error al actualizar el registro ID {id_registro}: {e}")
            errores += 1
    else:
        print(f" No se encontraron datos climáticos para el registro ID {id_registro}")
        errores += 1

# Confirmar cambios
conn.commit()

print(f" Proceso finalizado: {procesados} registros actualizados correctamente, {errores} errores.")

# Cerrar conexión
cursor.close()
conn.close()
print(" Conexión a la base de datos cerrada.")
