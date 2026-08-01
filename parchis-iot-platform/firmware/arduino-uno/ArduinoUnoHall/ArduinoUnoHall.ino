#include <Wire.h>

namespace {
constexpr uint8_t I2C_ADDRESS = 0x08;
constexpr uint8_t SENSOR_COUNT = 15;
constexpr uint8_t SENSOR_PINS[SENSOR_COUNT] = {
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, A0, A1, A2
};

volatile uint16_t sensorMask = 0;

void updateSensorMask() {
  uint16_t nextMask = 0;
  for (uint8_t index = 0; index < SENSOR_COUNT; index++) {
    if (digitalRead(SENSOR_PINS[index]) == LOW) {
      nextMask |= static_cast<uint16_t>(1) << index;
    }
  }

  noInterrupts();
  sensorMask = nextMask;
  interrupts();
}

void sendSensorMask() {
  const uint16_t currentMask = sensorMask;
  Wire.write(static_cast<uint8_t>(currentMask & 0xFF));
  Wire.write(static_cast<uint8_t>(currentMask >> 8));
}
}  // namespace

void setup() {
  for (uint8_t index = 0; index < SENSOR_COUNT; index++) {
    pinMode(SENSOR_PINS[index], INPUT_PULLUP);
  }

  updateSensorMask();
  Wire.begin(I2C_ADDRESS);
  Wire.onRequest(sendSensorMask);
}

void loop() {
  updateSensorMask();
  delay(10);
}
