#ifndef CONFIG_PRIVATE_H
#define CONFIG_PRIVATE_H

#include <Arduino.h>

namespace Config {
constexpr char WIFI_SSID[] = "TU_RED_WIFI";
constexpr char WIFI_PASSWORD[] = "TU_PASSWORD_WIFI";

constexpr char API_BASE_URL[] = "https://parchis-iot-backend.onrender.com/api/v1";
constexpr char DEVICE_TOKEN[] = "TU_DEVICE_TOKEN";
constexpr char DEVICE_ID[] = "ESP32-PARCHIS-IOT-001";

constexpr uint8_t MAX_PLAYERS = 4;
constexpr uint8_t MAX_QUESTIONS = 10;
constexpr uint8_t TOTAL_TILES = 28;
constexpr uint8_t ROUTE_LENGTH = 22;

constexpr uint8_t ARDUINO_I2C_ADDRESS = 0x08;
constexpr int I2C_SDA_PIN = 21;
constexpr int I2C_SCL_PIN = 22;

constexpr uint8_t ESP32_SENSOR_PINS[] = {
  4, 5, 18, 19, 34, 35, 36, 39, 23, 25, 26, 27, 2
};
constexpr uint8_t ESP32_SENSOR_COUNT =
  sizeof(ESP32_SENSOR_PINS) / sizeof(ESP32_SENSOR_PINS[0]);

constexpr uint8_t BUTTON_PINS[] = {32, 33, 13, 14, 12, 15};
constexpr uint8_t BUTTON_COUNT = sizeof(BUTTON_PINS) / sizeof(BUTTON_PINS[0]);

constexpr int DFPLAYER_RX_PIN = 16;
constexpr int DFPLAYER_TX_PIN = 17;
constexpr uint8_t DFPLAYER_VOLUME = 20;

constexpr uint32_t BUTTON_DEBOUNCE_MS = 70;
constexpr uint32_t SENSOR_DEBOUNCE_MS = 45;
constexpr uint32_t MOVEMENT_SETTLE_MS = 1200;
constexpr uint32_t ACTIVE_GAME_POLL_MS = 3000;
constexpr uint32_t REMOTE_CONFIG_POLL_MS = 10000;
constexpr uint32_t STATUS_INTERVAL_MS = 5000;
constexpr uint32_t WIFI_RETRY_MS = 10000;
constexpr uint32_t DFPLAYER_RETRY_MS = 3000;
constexpr uint32_t HTTP_TIMEOUT_MS = 4000;
constexpr uint32_t EVENT_POST_INTERVAL_MS = 250;
constexpr uint32_t EVENT_RETRY_MS = 2000;
constexpr uint8_t EVENT_QUEUE_SIZE = 24;
}  // namespace Config

#endif
