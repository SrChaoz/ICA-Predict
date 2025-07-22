import pandas as pd
import psycopg2
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error, mean_absolute_percentage_error, median_absolute_error
import pickle
from dotenv import load_dotenv
import os
from datetime import datetime

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

# Cargar datos
query = "SELECT fecha, ph, turbidez, conductividad, tds, dureza, color, ica FROM calidad_agua"
df = pd.read_sql(query, conn)

# ---- LIMPIEZA DE DATOS ----
df = df[df['ph'] <= 14]

for col in ['turbidez', 'conductividad', 'color']:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    filtro = (df[col] >= (Q1 - 1.5 * IQR)) & (df[col] <= (Q3 + 1.5 * IQR))
    df = df[filtro]

df['dureza'].fillna(df['dureza'].median(), inplace=True)
df['color'].fillna(df['color'].median(), inplace=True)

# ---- EXTRACCIÓN DE CARACTERÍSTICAS ----
df['Fecha'] = pd.to_datetime(df['fecha'], errors='coerce')
df['Año'] = df['Fecha'].dt.year
df['Dia_semana'] = df['Fecha'].dt.dayofweek
df['Mes'] = df['Fecha'].dt.month
df['Dia'] = df['Fecha'].dt.day

df['Dias_Transcurridos'] = (df['Fecha'] - df['Fecha'].min()).dt.days

# característica temporal para normalización
df['Fecha_Normalizada'] = (df['Dias_Transcurridos'] - df['Dias_Transcurridos'].min()) / (df['Dias_Transcurridos'].max() - df['Dias_Transcurridos'].min())

df.drop(columns=['fecha'], inplace=True)

# Escalar solo las variables de entrada
scaler = StandardScaler()
X_features = ['Dias_Transcurridos', 'Mes', 'Dia', 'Dia_semana', 'Fecha_Normalizada', 'Año']
X = pd.DataFrame(scaler.fit_transform(df[X_features]), columns=X_features)

# Guardar el Scaler y los nombres de las columnas
scaler_data = {
    'scaler': scaler,
    'columns': X_features
}
with open('scaler.pkl', 'wb') as file:
    pickle.dump(scaler_data, file)

# El target se deja sin escalar
y = df[['ph', 'turbidez', 'conductividad', 'tds', 'dureza', 'color']]

# Dividir en conjuntos de entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

# ---- ENTRENAMIENTO DE MODELOS ----

# RandomForest Mejorado
rf_regressor = RandomForestRegressor(
    n_estimators=400,
    max_depth=20,
    min_samples_split=3,
    random_state=42
)
rf_regressor.fit(X_train, y_train)

y_pred_rf = rf_regressor.predict(X_test).clip(0)

# XGBoost Mejorado
xgb_regressor = XGBRegressor(
    n_estimators=600,
    max_depth=12,
    learning_rate=0.05,
    random_state=42
)
xgb_regressor.fit(X_train, y_train)

y_pred_xgb = xgb_regressor.predict(X_test).clip(0)

# ---- EVALUACIÓN DE RESULTADOS ----
def evaluar_modelo(nombre, y_real, y_pred):
    mse = mean_squared_error(y_real, y_pred)
    r2 = r2_score(y_real, y_pred)
    mae = mean_absolute_error(y_real, y_pred)
    mape = mean_absolute_percentage_error(y_real, y_pred)
    medae = median_absolute_error(y_real, y_pred)
    
    print(f" {nombre} - MSE: {mse:.2f}")
    print(f" {nombre} - R² Score: {r2:.2f}")
    print(f" {nombre} - MAE: {mae:.2f}")
    print(f" {nombre} - MAPE: {mape:.2%}")
    print(f" {nombre} - MedAE: {medae:.2f}")

evaluar_modelo("RandomForest", y_test, y_pred_rf)
evaluar_modelo("XGBoost", y_test, y_pred_xgb)

# Guardar los modelos
with open('best_rf_model.pkl', 'wb') as file:
    pickle.dump(rf_regressor, file)

with open('best_xgb_model.pkl', 'wb') as file:
    pickle.dump(xgb_regressor, file)

print(" Modelos guardados exitosamente")

# Cerrar la conexión a la base de datos
conn.close()