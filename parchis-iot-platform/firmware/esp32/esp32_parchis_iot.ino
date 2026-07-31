#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include "config.h"

WebSocketsClient webSocket;
HardwareSerial nanoSerial(2);

bool socketReady = false;
uint32_t lastDiceAt = 0;
uint32_t lastTileAt[TILE_SENSOR_COUNT];

String socketEvent(const char* eventName, JsonDocument& payload) {
  String body;
  serializeJson(payload, body);
  return String("42[\"") + eventName + "\"," + body + "]";
}

void emitEvent(const char* eventName, JsonDocument& payload) {
  if (!socketReady) return;
  webSocket.sendTXT(socketEvent(eventName, payload));
}

void emitSystemStatus() {
  StaticJsonDocument<256> payload;
  payload["deviceId"] = DEVICE_ID;
  payload["wifiRssi"] = WiFi.RSSI();
  payload["sensors"] = "ok";
  payload["dfPlayer"] = "pending";
  payload["uptimeMs"] = millis();
  emitEvent("esp32:system-status", payload);
}

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.printf("Conectando a %s", WIFI_SSID);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\nWiFi conectado: %s\n", WiFi.localIP().toString().c_str());
}

void handleServerCommand(const char* eventName, JsonVariant data) {
  if (strcmp(eventName, "esp32:start-game") == 0) {
    Serial.println("Comando: iniciar partida");
  }
  if (strcmp(eventName, "esp32:finish-game") == 0) {
    Serial.println("Comando: finalizar partida");
  }
  if (strcmp(eventName, "esp32:sync-config") == 0) {
    Serial.println("Comando: sincronizar configuración");
    serializeJson(data, Serial);
    Serial.println();
  }
}

void handleSocketText(uint8_t* payload, size_t length) {
  if (length == 0) return;

  if (payload[0] == '0') {
    webSocket.sendTXT("40");
    socketReady = true;
    emitSystemStatus();
    return;
  }

  if (payload[0] == '2') {
    webSocket.sendTXT("3");
    return;
  }

  String message = String((char*)payload).substring(0, length);
  if (!message.startsWith("42")) return;

  StaticJsonDocument<512> doc;
  if (deserializeJson(doc, message.substring(2))) return;

  const char* eventName = doc[0] | "";
  JsonVariant data = doc[1];
  handleServerCommand(eventName, data);
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("WebSocket conectado");
      break;
    case WStype_TEXT:
      handleSocketText(payload, length);
      break;
    case WStype_DISCONNECTED:
      Serial.println("WebSocket desconectado");
      socketReady = false;
      break;
    default:
      break;
  }
}

void setupPins() {
  pinMode(DICE_SENSOR_PIN, INPUT_PULLUP);
  for (uint8_t i = 0; i < TILE_SENSOR_COUNT; i++) {
    pinMode(TILE_SENSOR_PINS[i], INPUT_PULLUP);
    lastTileAt[i] = 0;
  }
}

void setupSocket() {
  webSocket.begin(SERVER_HOST, SERVER_PORT, SOCKET_PATH);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(3000);
  webSocket.enableHeartbeat(15000, 3000, 2);
}

void checkDice() {
  uint32_t now = millis();
  if (digitalRead(DICE_SENSOR_PIN) == LOW && now - lastDiceAt > DEBOUNCE_MS) {
    lastDiceAt = now;
    StaticJsonDocument<256> payload;
    payload["eventName"] = "dice";
    payload["deviceId"] = DEVICE_ID;
    payload["diceValue"] = random(1, 7);
    payload["turnNumber"] = 1;
    payload["color"] = "BLUE";
    emitEvent("esp32:game-event", payload);
  }
}

void checkTiles() {
  uint32_t now = millis();
  for (uint8_t i = 0; i < TILE_SENSOR_COUNT; i++) {
    if (digitalRead(TILE_SENSOR_PINS[i]) == LOW && now - lastTileAt[i] > DEBOUNCE_MS) {
      lastTileAt[i] = now;
      StaticJsonDocument<256> payload;
      payload["eventName"] = "tile_detected";
      payload["deviceId"] = DEVICE_ID;
      payload["color"] = "BLUE";
      payload["currentTile"] = i + 1;
      payload["tileType"] = "FREE";
      payload["turnNumber"] = 1;
      emitEvent("esp32:game-event", payload);
    }
  }
}

void readNanoButtons() {
  if (!nanoSerial.available()) return;
  String line = nanoSerial.readStringUntil('\n');
  line.trim();
  if (line.length() == 0) return;

  StaticJsonDocument<160> doc;
  if (deserializeJson(doc, line)) return;
  emitEvent("nano:button-state", doc);
}

void setup() {
  Serial.begin(115200);
  nanoSerial.begin(NANO_BAUD, SERIAL_8N1, NANO_RX_PIN, NANO_TX_PIN);
  randomSeed(esp_random());
  setupPins();
  connectWifi();
  setupSocket();
}

void loop() {
  webSocket.loop();
  checkDice();
  checkTiles();
  readNanoButtons();

  static uint32_t lastStatusAt = 0;
  if (millis() - lastStatusAt > 5000) {
    lastStatusAt = millis();
    emitSystemStatus();
  }
}
