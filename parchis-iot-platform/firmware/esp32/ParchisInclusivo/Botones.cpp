#include "Botones.h"

void Botones::iniciar() {
  for (uint8_t index = 0; index < Config::BUTTON_COUNT; index++) {
    pinMode(Config::BUTTON_PINS[index], INPUT_PULLUP);
    const bool pressed = digitalRead(Config::BUTTON_PINS[index]) == LOW;
    stableState_[index] = pressed;
    rawState_[index] = pressed;
  }
}

void Botones::actualizar() {
  const uint32_t now = millis();
  for (uint8_t index = 0; index < Config::BUTTON_COUNT; index++) {
    const bool pressed = digitalRead(Config::BUTTON_PINS[index]) == LOW;
    if (pressed != rawState_[index]) {
      rawState_[index] = pressed;
      lastChangeAt_[index] = now;
    }

    if (pressed != stableState_[index]
        && now - lastChangeAt_[index] >= Config::BUTTON_DEBOUNCE_MS) {
      stableState_[index] = pressed;
      if (pressed) pendingPress_[index] = true;
    }
  }
}

bool Botones::consumir(TipoBoton boton) {
  const uint8_t index = static_cast<uint8_t>(boton);
  if (index >= Config::BUTTON_COUNT || !pendingPress_[index]) return false;
  pendingPress_[index] = false;
  return true;
}

const char* Botones::nombre(TipoBoton boton) {
  switch (boton) {
    case TipoBoton::POWER: return "POWER";
    case TipoBoton::OPCION_A: return "A";
    case TipoBoton::OPCION_B: return "B";
    case TipoBoton::REPETIR: return "REPEAT_AUDIO";
    case TipoBoton::CONFIRMAR: return "CONFIRM";
    case TipoBoton::DADO: return "DICE";
    default: return "UNKNOWN";
  }
}
