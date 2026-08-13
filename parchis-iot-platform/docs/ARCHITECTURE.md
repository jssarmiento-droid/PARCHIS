# Arquitectura

## Capas

1. Presentacion: React, TypeScript, Ant Design.
2. Aplicacion: NestJS, REST API, Socket.IO.
3. Datos: Prisma ORM y PostgreSQL.
4. Dispositivo: ESP32 principal, ESP32 de sensores por I2C, DFPlayer Mini.

## Flujo de datos

1. El administrador crea una partida y selecciona preguntas desde la web.
2. El backend guarda jugadores, preguntas y estado en PostgreSQL.
3. El ESP32 consulta `/api/v1/device/games/active`.
4. El ESP32 ejecuta la logica fisica del tablero y envia eventos a `/api/v1/device/events`.
5. El backend persiste movimientos/respuestas y emite eventos por WebSocket.
6. El frontend actualiza monitoreo, historial y reportes sin recargar la pagina.

## Responsabilidades

- Frontend: operacion, visualizacion, gestion y reportes.
- Backend: autenticacion, persistencia, calculos, API y WebSocket.
- ESP32: turnos, dado, botones, DFPlayer, sensores 16-28, HTTP.
- ESP32 sensores: sensores 1-15 por I2C.
