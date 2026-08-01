#ifndef TABLERO_H
#define TABLERO_H

#include <Arduino.h>
#include "Tipos.h"

class Tablero {
 public:
  static uint8_t posicionInicial(ColorJugador color);
  static uint8_t meta(ColorJugador color);
  static TipoCasilla tipo(uint8_t casilla);
  static uint16_t pistaInformativa(uint8_t casilla);
  static bool calcularDestino(
    ColorJugador color,
    uint8_t indiceActual,
    uint8_t dado,
    uint8_t& nuevoIndice,
    uint8_t& destino);
};

#endif
