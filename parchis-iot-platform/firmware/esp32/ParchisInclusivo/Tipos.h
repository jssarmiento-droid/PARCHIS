#ifndef TIPOS_H
#define TIPOS_H

#include <Arduino.h>
#include "Config.h"

enum class ColorJugador : uint8_t {
  AZUL = 0,
  ROJO = 1,
  VERDE = 2,
  AMARILLO = 3,
  NINGUNO = 255
};

enum class TipoCasilla : uint8_t {
  INICIO,
  LIBRE,
  INFORMATIVA,
  PREGUNTA,
  ENTRADA,
  META
};

enum class Respuesta : uint8_t {
  NINGUNA,
  A,
  B
};

enum class EstadoJuego : uint8_t {
  ESPERANDO_SESION,
  ESPERANDO_POWER,
  VALIDANDO_INICIO,
  ESPERANDO_DADO,
  ESPERANDO_MOVIMIENTO,
  CORRIGIENDO_MOVIMIENTO,
  PROCESANDO_CASILLA,
  ESPERANDO_RESPUESTA,
  ESPERANDO_AUDIO,
  PAUSADO_DISPOSITIVO,
  FINALIZADO
};

enum class TipoBoton : uint8_t {
  POWER = 0,
  OPCION_A = 1,
  OPCION_B = 2,
  REPETIR = 3,
  CONFIRMAR = 4,
  DADO = 5
};

struct PreguntaJuego {
  String id;
  String texto;
  String opcionA;
  String opcionB;
  Respuesta correcta = Respuesta::NINGUNA;
  uint16_t pistaAudio = 0;
};

struct DatosJugador {
  String id;
  String nombre;
  ColorJugador color = ColorJugador::NINGUNO;
  uint8_t posicion = 0;
  uint8_t indiceRuta = 0;
  uint8_t ultimoDado = 0;
  uint16_t puntajeEducativo = 0;
  uint16_t respuestasCorrectas = 0;
  uint16_t respuestasIncorrectas = 0;
  bool activo = false;
  bool ganador = false;
};

struct ConfiguracionPartida {
  String id;
  String publicId;
  String status;
  DatosJugador jugadores[Config::MAX_PLAYERS];
  PreguntaJuego preguntas[Config::MAX_QUESTIONS];
  uint8_t totalJugadores = 0;
  uint8_t totalPreguntas = 0;
};

struct ConfiguracionRemota {
  uint8_t maxJugadores = 4;
  uint8_t volumenPorcentaje = 70;
  uint16_t tiempoMovimientoSegundos = 20;
};

inline const char* colorApi(ColorJugador color) {
  switch (color) {
    case ColorJugador::AZUL: return "BLUE";
    case ColorJugador::ROJO: return "RED";
    case ColorJugador::VERDE: return "GREEN";
    case ColorJugador::AMARILLO: return "YELLOW";
    default: return "";
  }
}

inline ColorJugador colorDesdeApi(const String& color) {
  if (color == "BLUE") return ColorJugador::AZUL;
  if (color == "RED") return ColorJugador::ROJO;
  if (color == "GREEN") return ColorJugador::VERDE;
  if (color == "YELLOW") return ColorJugador::AMARILLO;
  return ColorJugador::NINGUNO;
}

inline const char* tipoCasillaApi(TipoCasilla tipo) {
  switch (tipo) {
    case TipoCasilla::INICIO: return "START";
    case TipoCasilla::INFORMATIVA: return "INFORMATIVE";
    case TipoCasilla::PREGUNTA: return "QUESTION";
    case TipoCasilla::ENTRADA: return "ENTRY";
    case TipoCasilla::META: return "GOAL";
    default: return "FREE";
  }
}

#endif
