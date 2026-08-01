#ifndef DADO_H
#define DADO_H

#include <Arduino.h>

class Dado {
 public:
  void iniciar();
  uint8_t lanzar();
};

#endif
