# Parchis Inclusivo Multisensorial IoT

Plataforma para supervisar un tablero fisico de parchis inclusivo con un ESP32 DevKit V1 y un Arduino UNO R3.

## Arquitectura

```text
Frontend React + TypeScript + Vite + Ant Design
        |
        | REST API para administracion
        | WebSocket para monitoreo en vivo
        v
Backend NestJS
        |
        v
Prisma ORM + PostgreSQL
        |
        v
ESP32 DevKit V1
        |
        | I2C: ESP32 maestro, Arduino UNO esclavo
        v
Arduino UNO R3: sensores Hall de casillas 1 a 15
```

## Carpetas

```text
backend/      NestJS + Prisma + PostgreSQL + Socket.IO
frontend/     React + TypeScript + Vite + Ant Design
firmware/     Sketches del ESP32 y Arduino UNO
docs/         Documentacion tecnica
```

## Inicio local

Backend:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run start:dev
```

Backend: `http://localhost:4000`

Frontend, en otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Usuario demo:

```text
Usuario: admin
Contrasena: admin123
```

## Configuracion del ESP32

Edita `firmware/esp32/ParchisInclusivo/Config.h`:

```cpp
const char* WIFI_SSID = "TU_RED_WIFI";
const char* WIFI_PASSWORD = "TU_PASSWORD_WIFI";
const char* API_BASE_URL = "http://192.168.1.100:4000/api/v1";
const char* DEVICE_TOKEN = "";
```

En pruebas locales, el ESP32 y la computadora deben estar en la misma red WiFi. Reemplaza la IP de ejemplo por la IPv4 de la computadora. No uses `localhost`, porque desde el ESP32 significaria el propio ESP32.

Instala en Arduino IDE:

```text
ArduinoJson
DFRobotDFPlayerMini
```

## Firmware del Arduino UNO R3

Archivo: `firmware/arduino-uno/ArduinoUnoHall/ArduinoUnoHall.ino`

El UNO funciona como esclavo I2C con direccion `0x08` y solo lee los sensores Hall de las casillas 1 a 15.

```text
Arduino UNO A4  -> ESP32 GPIO21 (SDA)
Arduino UNO A5  -> ESP32 GPIO22 (SCL)
Arduino UNO GND -> ESP32 GND
```

Usa un conversor de nivel logico bidireccional para las lineas SDA y SCL entre el UNO de 5 V y el ESP32 de 3.3 V.

El UNO devuelve una mascara de 16 bits al ESP32. Cada bit representa si un sensor Hall de las casillas 1 a 15 esta activo.

## Firmware del ESP32

Archivo: `firmware/esp32/ParchisInclusivo/ParchisInclusivo.ino`

El ESP32 es el maestro I2C y realiza estas tareas:

- Lee por I2C las casillas 1 a 15 del Arduino UNO.
- Lee directamente las casillas 16 a 28.
- Lee directamente los seis botones.
- Controla el DFPlayer Mini por UART2.
- Consulta la partida activa cada tres segundos.
- Consulta los ajustes remotos cada diez segundos.
- Aplica el volumen y el tiempo máximo de movimiento configurados desde la plataforma.
- Envia estados, botones y eventos de sensores al backend mediante HTTP.

### Pines del ESP32

```text
I2C SDA             GPIO21
I2C SCL             GPIO22
Power               GPIO32
A                   GPIO33
B                   GPIO13
Repetir audio       GPIO14
Confirmar           GPIO12
Dado                GPIO15
DFPlayer TX -> RX   GPIO16
DFPlayer RX <- TX   GPIO17
```

Casillas 16 a 28:

```text
16 GPIO4    17 GPIO5     18 GPIO18   19 GPIO19
20 GPIO34   21 GPIO35    22 GPIO36   23 GPIO39
24 GPIO23   25 GPIO25    26 GPIO26   27 GPIO27
28 GPIO2
```

Los GPIO34, GPIO35, GPIO36 y GPIO39 son solo de entrada y necesitan resistencias pull-up externas. GPIO2 es un pin de arranque; debe probarse con cuidado para evitar bloquear el inicio del ESP32.

## Audios y preguntas

La plataforma mantiene un banco de diez preguntas organizado por Costa, Sierra, Amazonia, Galapagos y contenido general. Antes de iniciar se seleccionan entre una y diez preguntas. El ESP32 consulta la partida activa y descarga el texto, las opciones, la respuesta correcta y el numero de pista.

El audio que reproduce el tablero debe estar almacenado en `/mp3/` dentro de la microSD del DFPlayer Mini. La pagina registra solamente la pista numerica. Revisa `docs/AUDIO_GUIDE.md` para conocer los nombres y guiones que debe preparar el equipo.

## Comunicacion HTTP y WebSocket

El circuito utiliza HTTP hacia el backend:

```text
POST /api/v1/device/status
POST /api/v1/device/events
POST /api/v1/device/buttons
GET  /api/v1/device/games/active
GET  /api/v1/device/games/:id/questions
GET  /api/v1/device/config
```

## Configuración desde la plataforma

La pantalla Configuración aplica cambios reales sin recompilar el ESP32:

- Nombre y logo del proyecto: se actualizan en la interfaz.
- Máximo de jugadores: limita las nuevas partidas entre 2 y 4 jugadores.
- Tiempo máximo de movimiento: el ESP32 lo utiliza para validar cada desplazamiento.
- Volumen: el ESP32 lo sincroniza con el DFPlayer Mini.

Las casillas, pines, WiFi y dirección del backend pertenecen al firmware y se modifican en `Config.h`, porque dependen del cableado y de la red física.

El flujo general es:

```text
Sensores y botones
        -> ESP32
        -> HTTP
        -> Backend
        -> WebSocket
        -> Frontend en tiempo real
```

## Reglas de tablero incorporadas

- Recorrido comun: casillas 1 a 20.
- Entradas exclusivas: Azul 21, Rojo 22, Verde 23, Amarillo 24.
- Metas: Azul 25, Rojo 26, Verde 27, Amarillo 28.
- Inicios: Azul 4, Rojo 9, Verde 14, Amarillo 19.
- Preguntas: 3, 7, 11, 15 y 18.
- Informativas: 1, 5, 13, 17 y 20.
- No existen capturas ni retroceso por respuesta incorrecta.
- La llegada a la meta se valida con el sensor Hall correspondiente.

## Estado actual del firmware

El firmware incluye comunicacion I2C, sensores, botones, DFPlayer, WiFi, rutas por color, turnos, movimientos, casillas ocupadas, preguntas, respuestas y victoria. La validacion final requiere cargar ambos sketches desde Arduino IDE y probar el comportamiento electrico de los 28 sensores con el circuito conectado.
