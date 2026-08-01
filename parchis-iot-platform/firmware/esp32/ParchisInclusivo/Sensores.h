#ifndef SENSORES_H
#define SENSORES_H

#include <Arduino.h>
#include <Wire.h>
#include "Config.h"

class Sensores {
 public:
  void iniciar();
  void actualizar();
  uint32_t mascara() const;
  bool ocupada(uint8_t casilla) const;
  bool arduinoConectado() const;

 private:
  uint32_t stableMask_ = 0;
  uint32_t candidateMask_ = 0;
  uint32_t candidateSince_ = 0;
  uint32_t lastReadAt_ = 0;
  bool unoConnected_ = false;

  uint32_t readRawMask();
};

#endif
