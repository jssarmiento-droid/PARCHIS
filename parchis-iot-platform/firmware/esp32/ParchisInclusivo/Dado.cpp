#include "Dado.h"

void Dado::iniciar() {
  randomSeed(esp_random());
}

uint8_t Dado::lanzar() {
  return static_cast<uint8_t>(random(1, 7));
}
