#include <Arduino.h>
#include "Juego.h"

Juego juego;

void setup() {
  Serial.begin(115200);
  juego.iniciar();
}

void loop() {
  juego.actualizar();
  delay(5);
}
