# Parchis Inclusivo Multisensorial IoT

Plataforma profesional para supervisar un tablero físico de parchís inclusivo con ESP32 DevKit V1 y Arduino Nano.

## Arquitectura

```text
Frontend React + TypeScript + Vite + Ant Design
        |
        | REST API administración
        | WebSocket monitoreo en vivo
        v
Backend NestJS
        |
        v
Prisma ORM
        |
        v
PostgreSQL
        |
        v
ESP32 DevKit V1
        |
        v
Arduino Nano panel de botones
```

## Carpetas

```text
backend/      NestJS + Prisma + PostgreSQL + Socket.IO
frontend/     React + TypeScript + Ant Design + Ant Design Charts
firmware/     ESP32 y Arduino Nano
docs/         Documentación técnica
```

Para despliegue revisa:

```text
docs/DEPLOYMENT.md
```

## Backend

1. Crea una base PostgreSQL llamada `parchis_iot`.
2. Copia `.env.example` a `.env`.
3. Ajusta `DATABASE_URL` si tu usuario o contraseña de PostgreSQL son diferentes.

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run start:dev
```

Backend:

```text
http://localhost:4000
```

Usuario demo:

```text
Usuario: admin
Contraseña: admin123
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Firmware ESP32

Archivo:

```text
firmware/esp32/esp32_parchis_iot.ino
```

Configura:

```cpp
const char* WIFI_SSID = "TU_RED_WIFI";
const char* WIFI_PASSWORD = "TU_PASSWORD_WIFI";
const char* SERVER_HOST = "192.168.1.100";
const uint16_t SERVER_PORT = 4000;
```

Instala en Arduino IDE:

```text
WebSocketsClient
ArduinoJson
```

## Firmware Arduino Nano

Archivo:

```text
firmware/arduino-nano/nano_buttons.ino
```

El Nano lee seis botones:

```text
Power
Dado
A
B
Repetir audio
Confirmar respuesta
```

Conecta el TX del Nano al RX2 del ESP32:

```text
Nano TX  -> ESP32 GPIO16
Nano GND -> ESP32 GND
```

Recomendado: usar conversión de nivel 5V a 3.3V entre TX del Nano y RX del ESP32.

## Comunicación

REST API:

```text
Login
Preguntas
Audios
Configuración
Historial
Reportes
Nueva partida
```

WebSocket:

```text
esp32:system-status
esp32:game-event
nano:button-state
web:start-game
web:finish-game
web:sync-config
device:status
game:state
game:movement
game:final-report
```

## Reglas implementadas

- 28 casillas.
- Tipos: salida, libre, informativa, pregunta, pierde turno, repite turno, meta.
- No existen casillas de avanzar ni retroceder por efecto.
- Respuesta correcta: +1 punto educativo y avanza una casilla.
- Respuesta incorrecta: 0 puntos y retrocede una casilla.
- La nueva casilla no ejecuta efecto.
- Se guarda historial completo por ID único de partida.
- El sistema soporta estado `Dispositivo desconectado` y reconexión.
