#include "Sensores.h"

void Sensores::iniciar() {
  Wire.begin(Config::I2C_SDA_PIN, Config::I2C_SCL_PIN);
  for (uint8_t index = 0; index < Config::ESP32_SENSOR_COUNT; index++) {
    const uint8_t pin = Config::ESP32_SENSOR_PINS[index];
    pinMode(pin, pin >= 34 ? INPUT : INPUT_PULLUP);
  }
  stableMask_ = candidateMask_ = readRawMask();
  candidateSince_ = millis();
}

void Sensores::actualizar() {
  const uint32_t now = millis();
  if (now - lastReadAt_ < 20) return;
  lastReadAt_ = now;

  const uint32_t rawMask = readRawMask();
  if (rawMask != candidateMask_) {
    candidateMask_ = rawMask;
    candidateSince_ = now;
  }

  if (candidateMask_ != stableMask_
      && now - candidateSince_ >= Config::SENSOR_DEBOUNCE_MS) {
    stableMask_ = candidateMask_;
  }
}

uint32_t Sensores::mascara() const {
  return stableMask_;
}

bool Sensores::ocupada(uint8_t casilla) const {
  if (casilla < 1 || casilla > Config::TOTAL_TILES) return false;
  return (stableMask_ & (static_cast<uint32_t>(1) << (casilla - 1))) != 0;
}

bool Sensores::puenteSensoresConectado() const {
  return sensorBridgeConnected_;
}

uint32_t Sensores::readRawMask() {
  uint16_t unoMask = 0;
  const uint8_t received = Wire.requestFrom(
    static_cast<int>(Config::SENSOR_BRIDGE_I2C_ADDRESS), 2);
  sensorBridgeConnected_ = received == 2 && Wire.available() >= 2;
  if (sensorBridgeConnected_) {
    const uint8_t lowByte = Wire.read();
    const uint8_t highByte = Wire.read();
    unoMask = static_cast<uint16_t>(lowByte)
      | (static_cast<uint16_t>(highByte) << 8);
  }

  uint32_t mask = unoMask & 0x7FFF;
  for (uint8_t index = 0; index < Config::ESP32_SENSOR_COUNT; index++) {
    if (digitalRead(Config::ESP32_SENSOR_PINS[index]) == LOW) {
      mask |= static_cast<uint32_t>(1) << (index + 15);
    }
  }
  return mask;
}
