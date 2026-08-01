#ifndef BOTONES_H
#define BOTONES_H

#include <Arduino.h>
#include "Tipos.h"

class Botones {
 public:
  void iniciar();
  void actualizar();
  bool consumir(TipoBoton boton);
  static const char* nombre(TipoBoton boton);

 private:
  bool stableState_[Config::BUTTON_COUNT] = {};
  bool rawState_[Config::BUTTON_COUNT] = {};
  bool pendingPress_[Config::BUTTON_COUNT] = {};
  uint32_t lastChangeAt_[Config::BUTTON_COUNT] = {};
};

#endif
