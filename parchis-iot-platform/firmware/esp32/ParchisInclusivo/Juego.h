#ifndef JUEGO_H
#define JUEGO_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include "Audio.h"
#include "Botones.h"
#include "Comunicacion.h"
#include "Dado.h"
#include "Jugadores.h"
#include "Sensores.h"
#include "Tipos.h"

class Juego {
 public:
  void iniciar();
  void actualizar();

 private:
  Audio audio_;
  Botones botones_;
  Comunicacion comunicacion_;
  Dado dado_;
  Jugadores jugadores_;
  Sensores sensores_;
  ConfiguracionPartida configuracion_;
  ConfiguracionRemota configuracionRemota_;
  EstadoJuego estado_ = EstadoJuego::ESPERANDO_SESION;
  EstadoJuego estadoAntesDePausa_ = EstadoJuego::ESPERANDO_SESION;
  Respuesta respuestaSeleccionada_ = Respuesta::NINGUNA;

  uint32_t lastGamePollAt_ = 0;
  uint32_t lastConfigPollAt_ = 0;
  uint32_t lastStatusAt_ = 0;
  uint32_t movementInitialMask_ = 0;
  uint32_t movementExpectedMask_ = 0;
  uint32_t movementUnexpectedMask_ = 0;
  uint32_t movementUnexpectedSince_ = 0;
  uint32_t movementStartedAt_ = 0;
  uint32_t pausedAt_ = 0;
  uint32_t bootId_ = 0;
  uint32_t eventSequence_ = 0;
  uint16_t turnNumber_ = 0;
  uint8_t destinationTile_ = 0;
  uint8_t destinationRouteIndex_ = 0;
  uint8_t originTile_ = 0;
  uint8_t questionCursor_ = 0;
  uint8_t currentQuestionIndex_ = 255;
  bool initialPositionErrorReported_ = false;
  bool movementErrorReported_ = false;

  void sincronizarPartida();
  void sincronizarConfiguracion();
  void enviarEstadoDispositivo();
  bool botonPresionado(TipoBoton boton);
  void esperarSesion();
  void esperarPower();
  void validarInicio();
  void iniciarPartidaFisica();
  void esperarDado();
  void esperarMovimiento();
  void corregirMovimiento();
  void aceptarMovimiento();
  void procesarCasilla();
  void iniciarPregunta();
  void esperarRespuesta();
  void esperarAudio();
  void esperarReconexionArduino();
  void cambiarTurno();
  void finalizarPartida();
  void anunciarTurno();
  void programarCambioTurno();
  void prepararEvento(DynamicJsonDocument& payload, const char* eventName);
  void enviarMovimientoInvalido(const char* reason);
  bool requiereArduino() const;
  void pausarPorArduino();
  void reiniciarMovimientoInesperado();
  void aplicarConfiguracionRemota();
};

#endif
