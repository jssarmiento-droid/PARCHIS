#include <Arduino.h>
#include <Wire.h>

namespace {
constexpr uint8_t I2C_ADDRESS = 0x08;
constexpr int I2C_SDA_PIN = 21;
constexpr int I2C_SCL_PIN = 22;
constexpr uint8_t SENSOR_COUNT = 15;

constexpr uint8_t SENSOR_PINS[SENSOR_COUNT] = {
  4, 5, 13, 14, 16, 17, 18, 19, 23, 25, 26, 27, 32, 33, 34
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
  Serial.begin(115200);

  for (uint8_t index = 0; index < SENSOR_COUNT; index++) {
    const uint8_t pin = SENSOR_PINS[index];
    pinMode(pin, pin >= 34 ? INPUT : INPUT_PULLUP);
  }

  updateSensorMask();
  Wire.begin(I2C_ADDRESS, I2C_SDA_PIN, I2C_SCL_PIN, 100000);
  Wire.onRequest(sendSensorMask);

  Serial.println("ESP32 sensores Hall listo por I2C");
}

void loop() {
  updateSensorMask();
  delay(10);
}
