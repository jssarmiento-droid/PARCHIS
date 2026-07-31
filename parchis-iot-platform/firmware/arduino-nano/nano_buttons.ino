#include <ArduinoJson.h>

const uint8_t POWER_PIN = 2;
const uint8_t DICE_PIN = 3;
const uint8_t OPTION_A_PIN = 4;
const uint8_t OPTION_B_PIN = 5;
const uint8_t REPEAT_AUDIO_PIN = 6;
const uint8_t CONFIRM_PIN = 7;

const uint8_t BUTTON_PINS[] = {
  POWER_PIN,
  DICE_PIN,
  OPTION_A_PIN,
  OPTION_B_PIN,
  REPEAT_AUDIO_PIN,
  CONFIRM_PIN
};

const char* BUTTON_NAMES[] = {
  "POWER",
  "DICE",
  "A",
  "B",
  "REPEAT_AUDIO",
  "CONFIRM"
};

bool lastState[6];
uint32_t lastChangeAt[6];
const uint32_t DEBOUNCE_MS = 80;

void setup() {
  Serial.begin(9600);
  for (uint8_t i = 0; i < 6; i++) {
    pinMode(BUTTON_PINS[i], INPUT_PULLUP);
    lastState[i] = digitalRead(BUTTON_PINS[i]) == LOW;
    lastChangeAt[i] = 0;
  }
}

void emitButton(uint8_t index, bool pressed) {
  StaticJsonDocument<128> doc;
  doc["button"] = BUTTON_NAMES[index];
  doc["pressed"] = pressed;
  doc["source"] = "ARDUINO_NANO";
  serializeJson(doc, Serial);
  Serial.println();
}

void loop() {
  uint32_t now = millis();
  for (uint8_t i = 0; i < 6; i++) {
    bool pressed = digitalRead(BUTTON_PINS[i]) == LOW;
    if (pressed != lastState[i] && now - lastChangeAt[i] > DEBOUNCE_MS) {
      lastState[i] = pressed;
      lastChangeAt[i] = now;
      emitButton(i, pressed);
    }
  }
}
