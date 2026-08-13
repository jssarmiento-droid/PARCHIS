#include "Comunicacion.h"
#include "Audios.h"
#include "Config.h"
#include <WiFiClientSecure.h>

void Comunicacion::iniciar() {
  WiFi.mode(WIFI_STA);
  conectarWiFi();
}

void Comunicacion::actualizar() {
  if (WiFi.status() != WL_CONNECTED) {
    const uint32_t now = millis();
    if (now - lastWifiAttemptAt_ >= Config::WIFI_RETRY_MS) conectarWiFi();
    return;
  }
  enviarSiguienteEvento();
}

bool Comunicacion::conectado() const {
  return WiFi.status() == WL_CONNECTED;
}

bool Comunicacion::obtenerPartidaActiva(ConfiguracionPartida& configuracion) {
  if (!conectado()) {
    Serial.println("[HTTP] No se puede consultar partida: WiFi desconectado");
    return false;
  }

  HTTPClient http;
  const String url = String(Config::API_BASE_URL) + "/device/games/active";
  WiFiClient plainClient;
  WiFiClientSecure secureClient;
  const bool secure = url.startsWith("https://");
  if (secure) secureClient.setInsecure();
  if (!(secure ? http.begin(secureClient, url) : http.begin(plainClient, url))) {
    Serial.println("[HTTP] No se pudo iniciar consulta de partida activa");
    return false;
  }
  http.useHTTP10(true);
  http.setTimeout(Config::HTTP_TIMEOUT_MS);
  http.addHeader("Accept", "application/json");
  agregarHeaders(http, false);

  const int statusCode = http.GET();
  if (statusCode != HTTP_CODE_OK) {
    Serial.print("[HTTP] Partida activa no disponible. Codigo: ");
    Serial.println(statusCode);
    http.end();
    return false;
  }

  const String response = http.getString();
  DynamicJsonDocument document(24576);
  const DeserializationError error = deserializeJson(document, response);
  if (error || document.as<JsonVariant>().isNull()) {
    Serial.print("[HTTP] Error leyendo partida activa: ");
    Serial.println(error.c_str());
    Serial.print("[HTTP] Tamano respuesta: ");
    Serial.println(response.length());
    http.end();
    return false;
  }

  ConfiguracionPartida next;
  next.id = String(document["id"] | "");
  next.publicId = String(document["publicId"] | "");
  next.status = String(document["status"] | "");
  if (next.id.length() == 0) {
    Serial.println("[HTTP] No hay partida activa configurada");
    http.end();
    return false;
  }

  for (JsonObject player : document["players"].as<JsonArray>()) {
    const ColorJugador color = colorDesdeApi(String(player["color"] | ""));
    const uint8_t index = static_cast<uint8_t>(color);
    if (index >= Config::MAX_PLAYERS) continue;

    DatosJugador& target = next.jugadores[index];
    target.id = String(player["id"] | "");
    target.nombre = String(player["name"] | "");
    target.color = color;
    target.activo = true;
    next.totalJugadores++;
  }

  for (JsonObject selection : document["selectedQuestions"].as<JsonArray>()) {
    if (next.totalPreguntas >= Config::MAX_QUESTIONS) break;
    JsonObject question = selection["question"].as<JsonObject>();
    PreguntaJuego& target = next.preguntas[next.totalPreguntas];
    target.id = String(question["id"] | "");
    target.texto = String(question["text"] | "");
    target.opcionA = String(question["optionA"] | "");
    target.opcionB = String(question["optionB"] | "");
    target.correcta = String(question["correctOption"] | "A") == "B"
      ? Respuesta::B
      : Respuesta::A;
    target.pistaAudio = question["audioTrack"]
      | static_cast<uint16_t>(Audios::PREGUNTA_INICIAL + next.totalPreguntas);
    next.totalPreguntas++;
  }

  http.end();
  configuracion = next;
  Serial.print("[HTTP] Partida activa recibida: ");
  Serial.print(next.publicId);
  Serial.print(" | Jugadores: ");
  Serial.print(next.totalJugadores);
  Serial.print(" | Preguntas: ");
  Serial.println(next.totalPreguntas);
  return next.totalJugadores >= 2;
}

bool Comunicacion::obtenerConfiguracion(ConfiguracionRemota& configuracion) {
  if (!conectado()) return false;

  HTTPClient http;
  const String url = String(Config::API_BASE_URL) + "/device/config";
  WiFiClient plainClient;
  WiFiClientSecure secureClient;
  const bool secure = url.startsWith("https://");
  if (secure) secureClient.setInsecure();
  if (!(secure ? http.begin(secureClient, url) : http.begin(plainClient, url))) return false;
  http.useHTTP10(true);
  http.setTimeout(Config::HTTP_TIMEOUT_MS);
  http.addHeader("Accept", "application/json");
  agregarHeaders(http, false);

  const int statusCode = http.GET();
  if (statusCode != HTTP_CODE_OK) {
    http.end();
    return false;
  }

  const String response = http.getString();
  DynamicJsonDocument document(1024);
  const DeserializationError error = deserializeJson(document, response);
  http.end();
  if (error) return false;

  const int maxJugadores = document["playerCount"] | configuracion.maxJugadores;
  const int volumen = document["volume"] | configuracion.volumenPorcentaje;
  const int tiempo = document["timeoutSeconds"] | configuracion.tiempoMovimientoSegundos;
  if (maxJugadores < 2 || maxJugadores > 4 || volumen < 0 || volumen > 100
      || tiempo < 5 || tiempo > 120) return false;

  configuracion.maxJugadores = static_cast<uint8_t>(maxJugadores);
  configuracion.volumenPorcentaje = static_cast<uint8_t>(volumen);
  configuracion.tiempoMovimientoSegundos = static_cast<uint16_t>(tiempo);
  return true;
}

bool Comunicacion::enviarEvento(DynamicJsonDocument& payload) {
  payload["deviceId"] = Config::DEVICE_ID;
  String body;
  serializeJson(payload, body);
  return encolarEvento(body);
}

bool Comunicacion::enviarBoton(const String& gameId, const char* boton) {
  DynamicJsonDocument payload(384);
  payload["gameId"] = gameId;
  payload["button"] = boton;
  payload["pressed"] = true;
  payload["source"] = "ESP32";
  String body;
  serializeJson(payload, body);
  return postBody("/device/buttons", body);
}

bool Comunicacion::enviarEstadoDispositivo(
    const String& gameId,
    bool puenteSensoresConectado,
    bool dfPlayerDisponible,
    uint8_t volumenPorcentaje,
    uint16_t tiempoMovimientoSegundos) {
  DynamicJsonDocument payload(512);
  payload["deviceId"] = Config::DEVICE_ID;
  payload["firmwareVersion"] = "4.0.0-integrado";
  payload["wifiRssi"] = WiFi.RSSI();
  payload["sensors"] = puenteSensoresConectado ? "ok" : "error";
  payload["sensorBridge"] = puenteSensoresConectado ? "connected" : "disconnected";
  payload["dfPlayer"] = dfPlayerDisponible ? "ok" : "not_ready";
  payload["pendingEvents"] = eventosPendientes();
  payload["droppedEvents"] = eventosDescartados();
  payload["volume"] = volumenPorcentaje;
  payload["movementTimeoutSeconds"] = tiempoMovimientoSegundos;
  payload["uptimeMs"] = millis();
  payload["gameId"] = gameId;
  String body;
  serializeJson(payload, body);
  return postBody("/device/status", body);
}

void Comunicacion::conectarWiFi() {
  lastWifiAttemptAt_ = millis();
  WiFi.begin(Config::WIFI_SSID, Config::WIFI_PASSWORD);
}

void Comunicacion::agregarHeaders(HTTPClient& http, bool json) const {
  if (json) http.addHeader("Content-Type", "application/json");
  if (strlen(Config::DEVICE_TOKEN) > 0) {
    http.addHeader("x-device-token", Config::DEVICE_TOKEN);
  }
}

uint8_t Comunicacion::eventosPendientes() const {
  return eventQueueCount_;
}

uint16_t Comunicacion::eventosDescartados() const {
  return droppedEventCount_;
}

bool Comunicacion::encolarEvento(const String& body) {
  if (eventQueueCount_ >= Config::EVENT_QUEUE_SIZE) {
    droppedEventCount_++;
    return false;
  }
  const uint8_t index = (eventQueueStart_ + eventQueueCount_) % Config::EVENT_QUEUE_SIZE;
  eventQueue_[index] = body;
  eventQueueCount_++;
  return true;
}

void Comunicacion::enviarSiguienteEvento() {
  if (eventQueueCount_ == 0) return;
  const uint32_t now = millis();
  if (now - lastEventAttemptAt_ < eventDelayMs_) return;
  lastEventAttemptAt_ = now;

  if (!postBody("/device/events", eventQueue_[eventQueueStart_])) {
    eventDelayMs_ = Config::EVENT_RETRY_MS;
    return;
  }
  eventDelayMs_ = Config::EVENT_POST_INTERVAL_MS;
  eventQueue_[eventQueueStart_] = "";
  eventQueueStart_ = (eventQueueStart_ + 1) % Config::EVENT_QUEUE_SIZE;
  eventQueueCount_--;
}

bool Comunicacion::postBody(const char* path, const String& body) {
  if (!conectado()) return false;
  HTTPClient http;
  const String url = String(Config::API_BASE_URL) + path;
  WiFiClient plainClient;
  WiFiClientSecure secureClient;
  const bool secure = url.startsWith("https://");
  if (secure) secureClient.setInsecure();
  if (!(secure ? http.begin(secureClient, url) : http.begin(plainClient, url))) return false;
  http.setTimeout(Config::HTTP_TIMEOUT_MS);
  agregarHeaders(http, true);
  const int statusCode = http.POST(body);
  http.end();
  return statusCode >= 200 && statusCode < 300;
}
