#ifndef JUGADORES_H
#define JUGADORES_H

#include <Arduino.h>
#include "Tipos.h"

class Jugadores {
 public:
  void cargar(const ConfiguracionPartida& configuracion);
  void seleccionarPrimeroAleatorio();
  DatosJugador& actual();
  const DatosJugador& actual() const;
  DatosJugador& obtener(ColorJugador color);
  const DatosJugador& obtener(ColorJugador color) const;
  void siguiente();
  bool ocupadaPorOtro(uint8_t casilla, ColorJugador excepto) const;
  uint32_t mascaraEsperada() const;
  uint8_t totalActivos() const;
  ColorJugador mejorPuntaje() const;

 private:
  DatosJugador jugadores_[Config::MAX_PLAYERS];
  ColorJugador actual_ = ColorJugador::NINGUNO;
  uint8_t totalActivos_ = 0;
};

#endif
