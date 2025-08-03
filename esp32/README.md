# 🤖 Monitor de Calidad de Agua - ESP32

Sistema IoT para monitoreo en tiempo real de calidad del agua en el Canal Mesias.

## 📦 Componentes Necesarios

### Hardware Básico
- **ESP32 DevKit V1** (o similar)
- **Sensor de pH** (analog)
- **Sensor de turbidez** (analog)
- **Sensor TDS/Conductividad** (analog)
- **Sensor de temperatura DS18B20** (digital)
- **LEDs indicadores** (2x)
- **Resistencias** 220Ω (para LEDs)
- **Resistencia pull-up** 4.7kΩ (para DS18B20)
- **Cables jumper**
- **Protoboard**

### Componentes Opcionales
- **Sensor de oxígeno disuelto**
- **Sensor de color**
- **Pantalla OLED** (para mostrar datos localmente)
- **Caja waterproof**
- **Panel solar pequeño**

## 🔧 Conexiones

### Pines ESP32
```
GPIO 4  -> Sensor Temperatura DS18B20 (con resistor 4.7kΩ pull-up)
GPIO A0 -> Sensor pH (analógico)
GPIO A1 -> Sensor Turbidez (analógico)  
GPIO A2 -> Sensor TDS (analógico)
GPIO 2  -> LED Estado (con resistor 220Ω)
GPIO 5  -> LED WiFi (con resistor 220Ω)
3.3V    -> Alimentación sensores
GND     -> Tierra común
```

### Diagrama de Conexión
```
ESP32                    Sensores
┌─────────────┐         ┌──────────┐
│             │         │  pH      │
│    A0    ●──┼─────────┼─ Signal  │
│             │         │          │
│    A1    ●──┼─────────┼─ Turbidez│
│             │         │          │
│    A2    ●──┼─────────┼─ TDS     │
│             │         │          │
│    GPIO4 ●──┼─────────┼─ DS18B20 │
│             │         │          │
│    3.3V  ●──┼─────────┼─ VCC     │
│    GND   ●──┼─────────┼─ GND     │
└─────────────┘         └──────────┘
```

## 📚 Librerías Necesarias

Instalar en el Arduino IDE:

1. **WiFi** (incluida en ESP32)
2. **HTTPClient** (incluida en ESP32)
3. **ArduinoJson** v6.x
   ```
   Sketch -> Include Library -> Manage Libraries
   Buscar: "ArduinoJson" por Benoit Blanchon
   ```
4. **OneWire** para DS18B20
   ```
   Buscar: "OneWire" por Jim Studt
   ```
5. **DallasTemperature** para DS18B20
   ```
   Buscar: "DallasTemperature" por Miles Burton
   ```

## ⚙️ Configuración

### 1. Configurar WiFi y Servidor
Editar el archivo `config.h`:
```cpp
const char* WIFI_SSID = "TU_WIFI";
const char* WIFI_PASSWORD = "TU_PASSWORD";
const char* API_ENDPOINT = "https://tu-servidor.com/api/sensor/data";
```

### 2. Configurar ID del Sensor
```cpp
const String SENSOR_ID = "ESP32_CANAL_MESIAS_001";
const String LOCATION = "Canal Mesias - Estacion Principal";
```

### 3. Calibrar Sensores
Usar la función `calibrateSensors()` para obtener valores raw y ajustar las constantes de calibración.

## 🚀 Instalación

### 1. Preparar Arduino IDE
1. Instalar soporte ESP32:
   - File -> Preferences
   - Agregar URL: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools -> Board Manager -> Buscar "esp32" -> Instalar

2. Seleccionar placa:
   - Tools -> Board -> ESP32 Dev Module

3. Configurar puerto:
   - Tools -> Port -> Seleccionar puerto COM

### 2. Subir el Código
1. Abrir `water_quality_monitor.ino`
2. Configurar `config.h` con tus parámetros
3. Verificar y subir el código
4. Abrir Serial Monitor (115200 baud)

## 📊 Funcionamiento

### Flujo de Datos
```
ESP32 → WiFi → Backend API → Supabase → Frontend Dashboard
```

### Intervalos
- **Lectura sensores**: Cada 5 segundos
- **Envío datos**: Cada 1 minuto
- **Verificación WiFi**: Cada 30 segundos

### Indicadores LED
- **LED Estado (GPIO 2)**:
  - 🟢 Encendido: Sistema funcionando
  - 🔴 Parpadeando: Enviando datos
- **LED WiFi (GPIO 5)**:
  - 🟢 Encendido: WiFi conectado
  - 🔴 Apagado: Sin conexión WiFi

## 🔧 Troubleshooting

### WiFi no conecta
1. Verificar SSID y password
2. Verificar que WiFi esté en 2.4GHz (no 5GHz)
3. Acercar ESP32 al router

### Sensores no funcionan
1. Verificar conexiones
2. Usar `calibrateSensors()` para ver valores raw
3. Ajustar constantes de calibración

### No envía datos
1. Verificar URL del servidor
2. Verificar que backend esté funcionando
3. Verificar formato JSON en Serial Monitor

## 📡 Formato de Datos Enviados

```json
{
  "sensor_id": "ESP32_CANAL_MESIAS_001",
  "ph": 7.2,
  "turbidez": 15.5,
  "conductividad": 450.0,
  "tds": 225.0,
  "dureza": 135.0,
  "color": 25.0,
  "temperatura": 22.5,
  "oxigeno_disuelto": 8.5,
  "ubicacion": "Canal Mesias - Estacion Principal"
}
```

## 🔋 Optimización de Energía

Para uso con batería/solar:
1. Usar `WiFi.setSleep()` entre envíos
2. Implementar deep sleep entre lecturas
3. Reducir frecuencia de envío de datos
4. Usar watchdog timer

## 📈 Monitoreo

- **Serial Monitor**: Datos en tiempo real
- **LEDs**: Estado visual del sistema
- **Dashboard Web**: Visualización remota
- **Logs del servidor**: Historial de datos recibidos

## 🛠️ Mantenimiento

### Calibración Periódica
- pH: Usar soluciones buffer 4.0, 7.0, 10.0
- Turbidez: Usar estándares de formazina
- TDS: Usar soluciones de conductividad conocida

### Limpieza
- Sensores: Limpiar semanalmente
- Carcasa: Verificar hermeticidad
- Conexiones: Revisar oxidación

## 📞 Soporte

Para problemas técnicos:
1. Revisar Serial Monitor
2. Verificar logs del backend
3. Consultar dashboard de estado del sistema
