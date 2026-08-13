#ifndef AUDIOS_H
#define AUDIOS_H

#include <Arduino.h>

namespace Audios {
constexpr uint16_t BIENVENIDA = 1;
constexpr uint16_t SIN_PARTIDA = 2;
constexpr uint16_t DIAGNOSTICO = 3;
constexpr uint16_t DIAGNOSTICO_OK = 4;
constexpr uint16_t POSICIONES_INCORRECTAS = 5;
constexpr uint16_t PARTIDA_INICIADA = 6;

constexpr uint16_t TURNO_AZUL = 11;
constexpr uint16_t TURNO_ROJO = 12;
constexpr uint16_t TURNO_VERDE = 13;
constexpr uint16_t TURNO_AMARILLO = 14;

constexpr uint16_t DADO_UNO = 21;
constexpr uint16_t DADO_DOS = 22;
constexpr uint16_t DADO_TRES = 23;
constexpr uint16_t DADO_CUATRO = 24;
constexpr uint16_t DADO_CINCO = 25;
constexpr uint16_t DADO_SEIS = 26;

constexpr uint16_t MOVIMIENTO_CORRECTO = 31;
constexpr uint16_t MOVIMIENTO_INCORRECTO = 32;
constexpr uint16_t CASILLA_OCUPADA = 33;
constexpr uint16_t DADO_EXCEDE_META = 34;

constexpr uint16_t OPCION_A = 41;
constexpr uint16_t OPCION_B = 42;
constexpr uint16_t SELECCIONE_OPCION = 43;
constexpr uint16_t RESPUESTA_CORRECTA = 44;
constexpr uint16_t RESPUESTA_INCORRECTA = 45;

constexpr uint16_t INFO_CASILLA_1 = 101;
constexpr uint16_t INFO_CASILLA_5 = 102;
constexpr uint16_t INFO_CASILLA_13 = 103;
constexpr uint16_t INFO_CASILLA_17 = 104;
constexpr uint16_t INFO_CASILLA_20 = 105;

constexpr uint16_t PREGUNTA_INICIAL = 201;

constexpr uint16_t LLEGADA_META = 301;
constexpr uint16_t GANA_AZUL = 302;
constexpr uint16_t GANA_ROJO = 303;
constexpr uint16_t GANA_VERDE = 304;
constexpr uint16_t GANA_AMARILLO = 305;

constexpr uint16_t ERROR_PUENTE_SENSORES = 402;
}  // namespace Audios

#endif
