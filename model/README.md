## **Descripción**
Este modelo de predicción está implementado en Python usando el algoritmo **Random Forest**. Se encarga de predecir los siguientes parámetros de calidad del agua:

- pH
- TDS
- Conductividad
- Color
- Turbidez
- Dureza

## **Requisitos**
- Python 3.10+
- Instalación de dependencias mediante el archivo `requirements.txt`:
```bash
pip install -r requirements.txt
```
o tambien 

```bash
pip install pandas scikit-learn numpy flask psycopg2 xgboost python-dotenv
```
## **Entrenamiento del Modelo**
El modelo utiliza como variables de entrada:
- `Dias_Transcurridos`
- `Mes`
- `Dia`
- `Dia_semana`

El script de entrenamiento se encuentra en la carpeta `model/scripts/train_model.py` debera crear un archivo `.env` en la raiz de la carpeta modelo para poder reentrenar con la base de datos .

## **Ejecución del Servidor Flask**
```bash
cd model
python app.py
```

La API tendrá las siguientes rutas:
- **`POST /predict`**: Recibe una fecha como entrada y retorna los parámetros de la prediccion.

## **Estructura del Proyecto**
```
model/
├── model/
├── scripts/
├── app.py
├── requirements.txt
├── README.md
```

## **Notas Finales**
- En caso de querer entrenar le modelo de nuevo agregar un archivo .env en la raiz de el proyecto con tus crdenciales  
- Se recomienda verificar que las dependencias estén actualizadas.
- La precision de el modelo se puede mejorar si se obtiene un conjunto de datos o dataseet mas grande, actualmente solo cuenta con 266 registros, para mejorar su precicison como minimo deberian ser 1500 registros
---


