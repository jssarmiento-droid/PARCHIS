#ifndef COMUNICACION_H
#define COMUNICACION_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include "Tipos.h"

class Comunicacion {
 public:
  void iniciar();
  void actualizar();
  bool conectado() const;
  bool obtenerPartidaActiva(ConfiguracionPartida& configuracion);
  bool obtenerConfiguracion(ConfiguracionRemota& configuracion);
  bool enviarEvento(DynamicJsonDocument& payload);
  bool enviarBoton(const String& gameId, const char* boton);
  bool enviarEstadoDispositivo(
    const String& gameId,
    bool puenteSensoresConectado,
    bool dfPlayerDisponible,
    uint8_t volumenPorcentaje,
    uint16_t tiempoMovimientoSegundos);
  uint8_t eventosPendientes() const;
  uint16_t eventosDescartados() const;

 private:
  uint32_t lastWifiAttemptAt_ = 0;
  uint32_t lastEventAttemptAt_ = 0;
  uint32_t eventDelayMs_ = Config::EVENT_POST_INTERVAL_MS;
  String eventQueue_[Config::EVENT_QUEUE_SIZE];
  uint8_t eventQueueStart_ = 0;
  uint8_t eventQueueCount_ = 0;
  uint16_t droppedEventCount_ = 0;

  void conectarWiFi();
  void agregarHeaders(HTTPClient& http, bool json) const;
  bool encolarEvento(const String& body);
  void enviarSiguienteEvento();
  bool postBody(const char* path, const String& body);
};

#endif
