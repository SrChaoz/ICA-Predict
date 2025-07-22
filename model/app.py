
from flask import Flask, request, jsonify
import pickle
import pandas as pd
import numpy as np
from datetime import datetime

# Cargar el modelo previamente entrenado
try:
    with open('./model/best_rf_model.pkl', 'rb') as file: #RandomForest
        modelo_rf = pickle.load(file)
except FileNotFoundError:
    modelo_rf = None

try:
    with open('./model/best_xgb_model.pkl', 'rb') as file: #XGBoost
        modelo_xgb = pickle.load(file)
except FileNotFoundError:
    modelo_xgb = None

if not modelo_rf and not modelo_xgb:
    raise ValueError(" No se encontró ningún modelo entrenado (RandomForest ni XGBoost).")

# Determinar qué modelo está disponible
modelo_actual = modelo_rf if modelo_rf else modelo_xgb
print(f" Modelo cargado: {'RandomForest' if modelo_rf else 'XGBoost'}")

app = Flask(__name__)

# Variables para calcular `Fecha_Normalizada`
FECHA_MINIMA = datetime(2023, 1, 1)  # Cambiar según el primer registro del dataset
FECHA_MAXIMA = datetime.now()         # Cambiar si se tiene una fecha máxima en el entrenamiento

#  Cargar el escalador y sus columnas
with open('./model/scaler.pkl', 'rb') as file:
    scaler_data = pickle.load(file)
scaler = scaler_data['scaler']
scaler_columns = scaler_data['columns']

# Función para convertir una fecha en los parámetros necesarios
def convertir_fecha(fecha_str):
    fecha = datetime.strptime(fecha_str, "%Y-%m-%d")
    hoy = datetime.now()

    # Calcular `Dias_Transcurridos` desde la fecha actual
    fecha_df = pd.DataFrame({
        'Dias_Transcurridos': [abs((fecha - hoy).days)],
        'Mes': [fecha.month],
        'Dia': [fecha.day],
        'Dia_semana': [fecha.weekday()],
        'Fecha_Normalizada': [(fecha - FECHA_MINIMA).days / (FECHA_MAXIMA - FECHA_MINIMA).days],
        'Año': [fecha.year]  
    })

    # Reconstruir el DataFrame asegurando que tenga los nombres correctos
    fecha_df = fecha_df.reindex(columns=scaler_columns, fill_value=0)  # Garantiza columnas correctas y en orden

    return fecha_df

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    # Validar que la fecha esté presente en el body
    if 'fecha' not in data:
        return jsonify({'error': 'La fecha es obligatoria'}), 400

    # Convertir la fecha en las características necesarias
    try:
        fecha_df = convertir_fecha(data['fecha'])
        fecha_df_scaled = pd.DataFrame(scaler.transform(fecha_df), columns=scaler_columns)
    except ValueError:
        return jsonify({'error': 'Formato de fecha inválido (usar YYYY-MM-DD)'}), 400
    except Exception as e:
        print(f" Error en el escalado: {e}")
        return jsonify({'error': 'Error en el procesamiento de la fecha'}), 500

    # Realizar la predicción
    try:
        prediction = modelo_actual.predict(fecha_df_scaled)

        # Convertir las predicciones a tipo float estándar
        prediction = np.array(prediction).astype(float).tolist()

        resultados = {
            'ph': round(prediction[0][0], 2),
            'turbidez': round(prediction[0][1], 2),
            'conductividad': round(prediction[0][2], 2),
            'tds': round(prediction[0][3], 2),
            'dureza': round(prediction[0][4], 2),
            'color': round(prediction[0][5], 2)
        }
        return jsonify(resultados)
    except Exception as e:
        print(f" Error en la predicción: {e}")
        return jsonify({'error': 'Error en la predicción'}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5000, debug=True)