/*
=====================================================
MONITOR DE CALIDAD DE AGUA - ESP8266
=====================================================
Sistema IoT para monitoreo en tiempo real de calidad de agua
Compatible con ESP8266 (NodeMCU, Wemos D1, etc.)
Modo simulación/real intercambiable
=====================================================
*/

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
// OneWire y DallasTemperature solo necesarios para DS18B20 real
#include <OneWire.h>
#include <DallasTemperature.h>

// =====================================================
// CONFIGURACIÓN PRINCIPAL
// =====================================================
#define SIMULATION_MODE true  // ✏️ CAMBIAR A false PARA USAR SENSORES REALES

// CONFIGURACIÓN DE RED Y SERVIDOR
const char* ssid = "Docunet Faster Cozan";           // ✏️ CAMBIAR AQUÍ
const char* password = "michuneron0409";    // ✏️ CAMBIAR AQUÍ  
const char* serverURL = "http://192.168.100.139:3000/api/sensor/data"; // ✏️ CAMBIAR AQUÍ - Puerto 3000 para backend local
// =====================================================
// CONFIGURACIÓN DE PINES ESP8266
// =====================================================
#define TEMP_SENSOR_PIN 2     // GPIO2 (D4 en NodeMCU) - Pin para sensor de temperatura DS18B20
#define PH_SENSOR_PIN A0      // Pin analógico para sensor pH (único analógico del ESP8266)
#define TURBIDITY_PIN 14      // GPIO14 (D5 en NodeMCU) - Pin digital para sensor turbidez
#define TDS_SENSOR_PIN 12     // GPIO12 (D6 en NodeMCU) - Pin digital para sensor TDS
#define LED_STATUS_PIN 5      // GPIO5 (D1 en NodeMCU) - LED indicador de estado
#define LED_WIFI_PIN 4        // GPIO4 (D2 en NodeMCU) - LED indicador WiFi

// Configuración sensor temperatura (solo si no está en modo simulación)
#if !SIMULATION_MODE
OneWire oneWire(TEMP_SENSOR_PIN);
DallasTemperature temperatureSensor(&oneWire);
#endif

// =====================================================
// VARIABLES GLOBALES
// =====================================================
String sensorID = "ESP32_PRINCIPAL";  // ✏️ Debe coincidir con el Dashboard (mismo que simulación)
unsigned long lastSensorReading = 0;
unsigned long lastDataSend = 0;
const unsigned long SENSOR_INTERVAL = 5000;   // Leer sensores cada 5 segundos
const unsigned long SEND_INTERVAL = 30000;    // Enviar datos cada 30 segundos (más frecuente para pruebas)

// Estructuras para datos
struct SensorData {
  float ph;
  float turbidez;
  float conductividad;
  float tds;
  float dureza;
  float color;
  float temperatura;
  float oxigeno_disuelto;
  String ubicacion;
  String timestamp;
};

SensorData currentData;

// =====================================================
// CONFIGURACIÓN INICIAL
// =====================================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== MONITOR DE CALIDAD DE AGUA ESP8266 ===");
  
  if (SIMULATION_MODE) {
    Serial.println("🧪 MODO SIMULACIÓN ACTIVADO");
  } else {
    Serial.println("🔬 MODO SENSORES REALES ACTIVADO");
  }
  
  Serial.println("Iniciando sistema ESP8266...");
  
  // Configurar pines
  pinMode(LED_STATUS_PIN, OUTPUT);
  pinMode(LED_WIFI_PIN, OUTPUT);
  digitalWrite(LED_STATUS_PIN, LOW);
  digitalWrite(LED_WIFI_PIN, LOW);
  
  // Inicializar sensores solo si no está en modo simulación
  #if !SIMULATION_MODE
  temperatureSensor.begin();
  Serial.println("✅ Sensores reales inicializados");
  #endif
  
  // Conectar WiFi
  connectToWiFi();
  
  // Configurar ubicación
  currentData.ubicacion = "Canal Mesias - Estacion Principal";
  
  Serial.println("Sistema iniciado correctamente!");
  digitalWrite(LED_STATUS_PIN, HIGH);
  
  // Mensaje informativo
  Serial.println("\n📡 Configuración:");
  Serial.println("Sensor ID: " + sensorID);
  Serial.println("Servidor: " + String(serverURL));
  Serial.println("Modo: " + String(SIMULATION_MODE ? "Simulación" : "Sensores Reales"));
  Serial.println("Intervalo lectura: " + String(SENSOR_INTERVAL/1000) + "s");
  Serial.println("Intervalo envío: " + String(SEND_INTERVAL/1000) + "s");
}

// =====================================================
// BUCLE PRINCIPAL
// =====================================================
void loop() {
  unsigned long currentTime = millis();
  
  // Manejar comandos desde Serial Monitor
  handleSerialCommands();
  
  // Verificar conexión WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado. Intentando reconectar...");
    digitalWrite(LED_WIFI_PIN, LOW);
    connectToWiFi();
  } else {
    digitalWrite(LED_WIFI_PIN, HIGH);
  }
  
  // Leer sensores cada SENSOR_INTERVAL
  if (currentTime - lastSensorReading >= SENSOR_INTERVAL) {
    readAllSensors();
    printSensorData();
    lastSensorReading = currentTime;
  }
  
  // Enviar datos cada SEND_INTERVAL
  if (currentTime - lastDataSend >= SEND_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED) {
      sendDataToServer();
      lastDataSend = currentTime;
    }
  }
  
  delay(1000); // Pausa de 1 segundo
}

// =====================================================
// FUNCIONES DE CONECTIVIDAD
// =====================================================
void connectToWiFi() {
  Serial.print("Conectando a WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    digitalWrite(LED_WIFI_PIN, HIGH);
  } else {
    Serial.println("\nError: No se pudo conectar a WiFi");
    digitalWrite(LED_WIFI_PIN, LOW);
  }
}

// =====================================================
// FUNCIONES DE LECTURA DE SENSORES
// =====================================================
void readAllSensors() {
  if (SIMULATION_MODE) {
    // 🧪 MODO SIMULACIÓN - Datos aleatorios realistas
    simulateRealisticData();
  } else {
    // 🔬 MODO REAL - Leer sensores físicos
    readRealSensors();
  }
}

// =====================================================
// FUNCIÓN PARA SIMULAR DATOS REALISTAS
// =====================================================
void simulateRealisticData() {
  // Simular datos que varían lentamente como en agua real
  static float baseValues[8] = {7.2, 15.5, 450.0, 225.0, 135.0, 25.0, 22.5, 8.5};
  static unsigned long lastUpdate = 0;
  static float targets[8];
  static bool initialized = false;
  
  // Inicializar targets la primera vez
  if (!initialized) {
    for (int i = 0; i < 8; i++) {
      targets[i] = baseValues[i];
    }
    initialized = true;
  }
  
  // Cambiar targets lentamente (cada 30 segundos aprox)
  if (millis() - lastUpdate > 30000) {
    targets[0] = random(650, 850) / 100.0;  // pH 6.5-8.5
    targets[1] = random(5, 100);            // Turbidez 5-100 NTU
    targets[2] = random(200, 800);          // Conductividad 200-800 µS/cm
    targets[3] = random(100, 500);          // TDS 100-500 ppm
    targets[4] = random(80, 300);           // Dureza 80-300 mg/L
    targets[5] = random(5, 50);             // Color 5-50 Pt-Co
    targets[6] = random(180, 300) / 10.0;   // Temperatura 18-30°C
    targets[7] = random(5, 12);             // Oxígeno 5-12 mg/L
    lastUpdate = millis();
  }
  
  // Interpolar hacia los targets (cambio gradual)
  float factor = 0.02; // Velocidad de cambio
  currentData.ph = baseValues[0] + (targets[0] - baseValues[0]) * factor;
  currentData.turbidez = baseValues[1] + (targets[1] - baseValues[1]) * factor;
  currentData.conductividad = baseValues[2] + (targets[2] - baseValues[2]) * factor;
  currentData.tds = baseValues[3] + (targets[3] - baseValues[3]) * factor;
  currentData.dureza = baseValues[4] + (targets[4] - baseValues[4]) * factor;
  currentData.color = baseValues[5] + (targets[5] - baseValues[5]) * factor;
  currentData.temperatura = baseValues[6] + (targets[6] - baseValues[6]) * factor;
  currentData.oxigeno_disuelto = baseValues[7] + (targets[7] - baseValues[7]) * factor;
  
  // Actualizar base values
  for (int i = 0; i < 8; i++) {
    baseValues[i] = baseValues[i] + (targets[i] - baseValues[i]) * factor;
  }
  
  // Añadir ruido pequeño para hacer más realista
  currentData.ph += random(-10, 10) / 100.0;
  currentData.turbidez += random(-20, 20) / 10.0;
  currentData.conductividad += random(-50, 50) / 10.0;
  currentData.tds += random(-20, 20) / 10.0;
  currentData.dureza += random(-30, 30) / 10.0;
  currentData.color += random(-10, 10) / 10.0;
  currentData.temperatura += random(-5, 5) / 10.0;
  currentData.oxigeno_disuelto += random(-5, 5) / 10.0;
}

// =====================================================
// FUNCIÓN PARA LEER SENSORES REALES
// =====================================================
void readRealSensors() {
  #if !SIMULATION_MODE
  // Leer temperatura del DS18B20
  temperatureSensor.requestTemperatures();
  currentData.temperatura = temperatureSensor.getTempCByIndex(0);
  if (currentData.temperatura == DEVICE_DISCONNECTED_C) {
    currentData.temperatura = 25.0; // Valor por defecto
    Serial.println("⚠️ Sensor de temperatura desconectado");
  }
  
  // Leer pH desde pin analógico (calibrar según tu sensor)
  int phRaw = analogRead(PH_SENSOR_PIN);
  currentData.ph = mapFloat(phRaw, 0, 1024, 0, 14); // ESP8266 usa 1024 como máximo ADC
  
  // Leer otros sensores (aquí debes adaptar según tus sensores específicos)
  // Por ejemplo, si tienes sensores digitales:
  currentData.turbidez = readTurbiditySensor();
  currentData.tds = readTDSSensor();
  
  // Calcular valores derivados
  currentData.conductividad = currentData.tds * 2;
  currentData.dureza = currentData.tds * 0.6;
  
  // Para sensores que no tienes, usar valores simulados
  currentData.color = random(5, 50);
  currentData.oxigeno_disuelto = random(6, 12);
  
  #else
  // Esta función no debería ejecutarse en modo simulación
  Serial.println("❌ Error: readRealSensors() llamada en modo simulación");
  #endif
}

// =====================================================
// FUNCIONES AUXILIARES PARA SENSORES ESPECÍFICOS
// =====================================================
float readTurbiditySensor() {
  // Implementar según tu sensor específico
  // Por ejemplo, para sensor analógico:
  // int raw = analogRead(TURBIDITY_PIN);
  // return mapFloat(raw, 0, 1024, 0, 1000);
  
  // Placeholder - reemplazar con código real
  return 15.5;
}

float readTDSSensor() {
  // Implementar según tu sensor específico
  // Por ejemplo, para sensor digital o I2C:
  // return sensor.readTDS();
  
  // Placeholder - reemplazar con código real
  return 225.0;
}

// =====================================================
// FUNCIÓN PARA MAPEAR VALORES FLOAT
// =====================================================
float mapFloat(float x, float in_min, float in_max, float out_min, float out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// =====================================================
// FUNCIÓN PARA ENVIAR DATOS AL SERVIDOR
// =====================================================
void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Error: WiFi no conectado");
    return;
  }
  
  WiFiClient client;
  HTTPClient http;
  
  http.begin(client, serverURL);
  http.addHeader("Content-Type", "application/json");
  
  // Crear JSON con los datos
  StaticJsonDocument<512> jsonDoc;
  jsonDoc["sensor_id"] = sensorID;
  jsonDoc["ph"] = round(currentData.ph * 100.0) / 100.0;
  jsonDoc["turbidez"] = round(currentData.turbidez * 100.0) / 100.0;
  jsonDoc["conductividad"] = round(currentData.conductividad * 100.0) / 100.0;
  jsonDoc["tds"] = round(currentData.tds * 100.0) / 100.0;
  jsonDoc["dureza"] = round(currentData.dureza * 100.0) / 100.0;
  jsonDoc["color"] = round(currentData.color * 100.0) / 100.0;
  jsonDoc["temperatura"] = round(currentData.temperatura * 100.0) / 100.0;
  jsonDoc["oxigeno_disuelto"] = round(currentData.oxigeno_disuelto * 100.0) / 100.0;
  jsonDoc["ubicacion"] = currentData.ubicacion;
  
  String jsonString;
  serializeJson(jsonDoc, jsonString);
  
  Serial.println("\n=== ENVIANDO DATOS ===");
  Serial.println("URL: " + String(serverURL));
  Serial.println("Modo: " + String(SIMULATION_MODE ? "🧪 Simulación" : "🔬 Real"));
  Serial.println("JSON: " + jsonString);
  
  // Enviar POST request
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Respuesta del servidor:");
    Serial.println("Código: " + String(httpResponseCode));
    Serial.println("Respuesta: " + response);
    
    if (httpResponseCode == 200 || httpResponseCode == 201) {
      Serial.println("✅ Datos enviados correctamente");
      // Parpadear LED de estado para confirmar envío
      for (int i = 0; i < 3; i++) {
        digitalWrite(LED_STATUS_PIN, LOW);
        delay(100);
        digitalWrite(LED_STATUS_PIN, HIGH);
        delay(100);
      }
    } else {
      Serial.println("❌ Error en el servidor");
    }
  } else {
    Serial.println("❌ Error de conexión HTTP: " + String(httpResponseCode));
  }
  
  http.end();
}

// =====================================================
// FUNCIÓN PARA MOSTRAR DATOS EN MONITOR SERIE
// =====================================================
void printSensorData() {
  Serial.println("\n=== LECTURA DE SENSORES ===");
  Serial.println("Modo: " + String(SIMULATION_MODE ? "🧪 SIMULACIÓN" : "🔬 REAL"));
  Serial.println("Sensor ID: " + sensorID);
  Serial.println("Ubicación: " + currentData.ubicacion);
  Serial.println("pH: " + String(currentData.ph, 2));
  Serial.println("Turbidez: " + String(currentData.turbidez, 2) + " NTU");
  Serial.println("Conductividad: " + String(currentData.conductividad, 2) + " µS/cm");
  Serial.println("TDS: " + String(currentData.tds, 2) + " ppm");
  Serial.println("Dureza: " + String(currentData.dureza, 2) + " mg/L");
  Serial.println("Color: " + String(currentData.color, 2) + " Pt-Co");
  Serial.println("Temperatura: " + String(currentData.temperatura, 2) + " °C");
  Serial.println("Oxígeno Disuelto: " + String(currentData.oxigeno_disuelto, 2) + " mg/L");
  Serial.println("WiFi: " + String(WiFi.status() == WL_CONNECTED ? "Conectado" : "Desconectado"));
  Serial.println("Próximo envío en: " + String((SEND_INTERVAL - (millis() - lastDataSend))/1000) + "s");
  Serial.println("=============================");
}

// =====================================================
// FUNCIÓN PARA CALIBRACIÓN (solo en modo real)
// =====================================================
void calibrateSensors() {
  if (SIMULATION_MODE) {
    Serial.println("\n⚠️ Calibración no disponible en modo simulación");
    Serial.println("Cambiar SIMULATION_MODE a false para calibrar sensores reales");
    return;
  }
  
  Serial.println("\n=== MODO CALIBRACIÓN ===");
  Serial.println("pH Raw (A0): " + String(analogRead(PH_SENSOR_PIN)));
  // Añadir más lecturas raw según tus sensores
  Serial.println("========================");
}

// =====================================================
// FUNCIÓN PARA CAMBIAR MODO (llamar desde Serial)
// =====================================================
void handleSerialCommands() {
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    command.toLowerCase();
    
    if (command == "info") {
      Serial.println("\n=== INFORMACIÓN DEL SISTEMA ===");
      Serial.println("Modo actual: " + String(SIMULATION_MODE ? "Simulación" : "Real"));
      Serial.println("WiFi: " + String(WiFi.status() == WL_CONNECTED ? "Conectado" : "Desconectado"));
      Serial.println("IP: " + WiFi.localIP().toString());
      Serial.println("Servidor: " + String(serverURL));
      Serial.println("Último envío: " + String((millis() - lastDataSend)/1000) + "s atrás");
      Serial.println("================================");
    }
    else if (command == "test") {
      Serial.println("\n🧪 Enviando datos de prueba...");
      sendDataToServer();
    }
    else if (command == "cal") {
      calibrateSensors();
    }
    else if (command == "help") {
      Serial.println("\n=== COMANDOS DISPONIBLES ===");
      Serial.println("info  - Mostrar información del sistema");
      Serial.println("test  - Enviar datos de prueba");
      Serial.println("cal   - Calibrar sensores (solo modo real)");
      Serial.println("help  - Mostrar esta ayuda");
      Serial.println("=============================");
    }
  }
}
