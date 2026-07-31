#pragma once

const char* WIFI_SSID = "TU_RED_WIFI";
const char* WIFI_PASSWORD = "TU_PASSWORD_WIFI";

const char* SERVER_HOST = "192.168.1.100";
const uint16_t SERVER_PORT = 4000;
const char* SOCKET_PATH = "/socket.io/?EIO=4&transport=websocket&device=esp32&firmware=2.0.0";

const char* DEVICE_ID = "ESP32-PARCHIS-IOT-001";

const uint8_t DICE_SENSOR_PIN = 18;
const uint8_t TILE_SENSOR_PINS[] = {32, 33, 25, 26, 27, 14};
const uint8_t TILE_SENSOR_COUNT = sizeof(TILE_SENSOR_PINS) / sizeof(TILE_SENSOR_PINS[0]);
const uint32_t DEBOUNCE_MS = 250;

// UART2 para recibir eventos del Arduino Nano.
const int NANO_RX_PIN = 16;
const int NANO_TX_PIN = 17;
const uint32_t NANO_BAUD = 9600;
