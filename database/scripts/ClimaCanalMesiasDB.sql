--1. Crear tabla de calidad de agua
CREATE TABLE calidad_agua (
    id SERIAL PRIMARY KEY,  
    fecha DATE,
    ph DOUBLE PRECISION,
    turbidez DOUBLE PRECISION,
    conductividad DOUBLE PRECISION,
    tds DOUBLE PRECISION,
    dureza DOUBLE PRECISION,
    color DOUBLE PRECISION,
    ica DOUBLE PRECISION
);


--2. Agregar columnas de clima
ALTER TABLE calidad_agua
ADD COLUMN precipitacion DOUBLE PRECISION,
ADD COLUMN temperatura DOUBLE PRECISION,
ADD COLUMN viento DOUBLE PRECISION,
ADD COLUMN humedad DOUBLE PRECISION,
ADD COLUMN presion DOUBLE PRECISION;


--3. Crear función para insertar datos
CREATE OR REPLACE FUNCTION insertar_datos(
    p_fecha DATE,
    p_ph DOUBLE PRECISION,
    p_turbidez DOUBLE PRECISION,
    p_conductividad DOUBLE PRECISION,
    p_tds DOUBLE PRECISION,
    p_dureza DOUBLE PRECISION,
    p_color DOUBLE PRECISION,
    p_ica DOUBLE PRECISION,
    p_precipitacion DOUBLE PRECISION,
    p_temperatura DOUBLE PRECISION,
    p_viento DOUBLE PRECISION,
    p_humedad DOUBLE PRECISION,
    p_presion DOUBLE PRECISION
) RETURNS VOID AS $$
BEGIN
    INSERT INTO calidad_agua (
        fecha, ph, turbidez, conductividad, tds, dureza, color, ica,
        precipitacion, temperatura, viento, humedad, presion
    ) VALUES (
        p_fecha, p_ph, p_turbidez, p_conductividad,
        p_tds, p_dureza, p_color, p_ica,
        p_precipitacion, p_temperatura, p_viento, p_humedad, p_presion
    );
END;
$$ LANGUAGE plpgsql;


--4. Crear función para obtener datos por fecha 
CREATE OR REPLACE FUNCTION obtener_datos_por_fecha(fecha_consulta DATE)
RETURNS TABLE (
    id INTEGER,
    fecha DATE,
    ph DOUBLE PRECISION,
    turbidez DOUBLE PRECISION,
    conductividad DOUBLE PRECISION,
    tds DOUBLE PRECISION,
    dureza DOUBLE PRECISION,
    color DOUBLE PRECISION,
    ica DOUBLE PRECISION,
    precipitacion DOUBLE PRECISION,
    temperatura DOUBLE PRECISION,
    viento DOUBLE PRECISION,
    humedad DOUBLE PRECISION,
    presion DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM calidad_agua AS ca
    WHERE ca.fecha = fecha_consulta; 
END;
$$ LANGUAGE plpgsql;

select * from calidad_agua

SELECT id, fecha, precipitacion, temperatura, viento, humedad, presion
FROM calidad_agua
WHERE precipitacion IS NOT NULL;

