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


SELECT * FROM calidad_agua;

--2. Crear función para obtener datos por fecha
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
    ica DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM calidad_agua AS ca
    WHERE ca.fecha = fecha_consulta; 
END;
$$ LANGUAGE plpgsql;


--3.Crear función para insertar datos
CREATE OR REPLACE FUNCTION insertar_datos(
    p_fecha DATE,
    p_ph DOUBLE PRECISION,
    p_turbidez DOUBLE PRECISION,
    p_conductividad DOUBLE PRECISION,
    p_tds DOUBLE PRECISION,
    p_dureza DOUBLE PRECISION,
    p_color DOUBLE PRECISION,
    p_ica DOUBLE PRECISION
) RETURNS VOID AS $$
BEGIN
    INSERT INTO calidad_agua (
        fecha, ph, turbidez, conductividad, tds, dureza, color, ica
    ) VALUES (
        p_fecha, p_ph, p_turbidez, p_conductividad,
        p_tds, p_dureza, p_color, p_ica
    );
END;
$$ LANGUAGE plpgsql;

--4.Crear nueva tabla para datos predichos
CREATE TABLE datos_predic (
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

SELECT * FROM datos_predic

--5. Crar funcion para ingresar datos a la tabla:
CREATE OR REPLACE FUNCTION insertar_datos_predic(
  p_fecha DATE,
  p_ph DOUBLE PRECISION,
  p_turbidez DOUBLE PRECISION,
  p_conductividad DOUBLE PRECISION,
  p_tds DOUBLE PRECISION,
  p_dureza DOUBLE PRECISION,
  p_color DOUBLE PRECISION,
  p_ica DOUBLE PRECISION
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO datos_predic (
    fecha, ph, turbidez, conductividad, tds, dureza, color, ica
  )
  VALUES (
    p_fecha, p_ph, p_turbidez, p_conductividad,
    p_tds, p_dureza, p_color, p_ica
  );
END;
$$ LANGUAGE plpgsql;











