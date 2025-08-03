/*
=====================================================
CONFIGURACIÓN DEL SISTEMA ESP32
=====================================================
Archivo para configurar parámetros del sistema
=====================================================
*/

#ifndef CONFIG_H
#define CONFIG_H

// =====================================================
// CONFIGURACIÓN DE RED
// =====================================================
// IMPORTANTE: Cambiar estos valores por los reales
const char* WIFI_SSID = "TU_NOMBRE_WIFI";
const char* WIFI_PASSWORD = "TU_PASSWORD_WIFI";

// URL del servidor backend (cambiar por tu dominio real)
const char* API_ENDPOINT = "https://tu-dominio.com/api/sensor/data";
// Para desarrollo local: "http://192.168.1.100:5000/api/sensor/data"

// =====================================================
// CONFIGURACIÓN DEL SENSOR
// =====================================================
const String SENSOR_ID = "ESP32_CANAL_MESIAS_001";
const String LOCATION = "Canal Mesias - Estacion Principal";

// Intervalos de tiempo (en milisegundos)
const unsigned long SENSOR_READ_INTERVAL = 5000;   // Leer sensores cada 5 segundos
const unsigned long DATA_SEND_INTERVAL = 60000;    // Enviar datos cada 1 minuto
const unsigned long WIFI_CHECK_INTERVAL = 30000;   // Verificar WiFi cada 30 segundos

// =====================================================
// CONFIGURACIÓN DE PINES
// =====================================================
#define PIN_TEMPERATURE 4    // Sensor temperatura DS18B20
#define PIN_PH A0           // Sensor pH
#define PIN_TURBIDITY A1    // Sensor turbidez
#define PIN_TDS A2          // Sensor TDS/conductividad
#define PIN_LED_STATUS 2    // LED estado general
#define PIN_LED_WIFI 5      // LED estado WiFi

// =====================================================
// CALIBRACIÓN DE SENSORES
// =====================================================
// pH: Valores para mapear la lectura analógica
#define PH_MIN_VOLTAGE 0.0
#define PH_MAX_VOLTAGE 3.3
#define PH_MIN_VALUE 0.0
#define PH_MAX_VALUE 14.0

// Turbidez: Valores para mapear (depende del sensor)
#define TURBIDITY_MIN_VOLTAGE 0.0
#define TURBIDITY_MAX_VOLTAGE 3.3
#define TURBIDITY_MIN_VALUE 0.0
#define TURBIDITY_MAX_VALUE 1000.0

// TDS: Valores para mapear
#define TDS_MIN_VOLTAGE 0.0
#define TDS_MAX_VOLTAGE 3.3
#define TDS_MIN_VALUE 0.0
#define TDS_MAX_VALUE 2000.0

// =====================================================
// CONFIGURACIÓN DE DEBUGGING
// =====================================================
#define DEBUG_MODE true
#define SERIAL_BAUD_RATE 115200

// =====================================================
// CONFIGURACIÓN DE REINTENTOS
// =====================================================
#define MAX_WIFI_RETRY_ATTEMPTS 20
#define MAX_HTTP_RETRY_ATTEMPTS 3
#define RETRY_DELAY_MS 500

#endif
