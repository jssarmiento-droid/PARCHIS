# Arquitectura de Tres Capas

## Capa de presentación

React + TypeScript + Vite + Ant Design.

Responsabilidades:

- Login del administrador.
- Dashboard IoT.
- Nueva partida.
- Monitoreo en tiempo real.
- Gestión de preguntas.
- Gestión de audios.
- Historial.
- Reportes.
- Configuración.

## Capa de aplicación

NestJS.

Modulos:

- `auth`
- `dashboard`
- `devices`
- `games`
- `questions`
- `audios`
- `reports`
- `settings`
- `websocket`

## Capa de datos

Prisma ORM + PostgreSQL.

Modelos principales:

- `AdminUser`
- `GameSession`
- `GamePlayer`
- `MoveHistory`
- `AnswerHistory`
- `Question`
- `AudioAsset`
- `BoardTile`
- `DeviceStatus`
- `ButtonEvent`
- `SystemConfig`
- `FinalReport`

## Tolerancia a fallos

El servidor mantiene el estado de dispositivos en `DeviceStatus`.

Cuando el ESP32 se desconecta:

- El frontend muestra `Dispositivo desconectado`.
- La partida activa permanece en base de datos.
- Los movimientos ya recibidos no se pierden.
- Al reconectar, el ESP32 vuelve a emitir `esp32:system-status`.

## Flujo recomendado

1. El administrador inicia sesión.
2. Crea una partida.
3. El backend genera `Partida #YYYY-001`.
4. El frontend emite `web:start-game`.
5. El ESP32 recibe inicio de partida por WebSocket.
6. El ESP32 emite eventos de juego.
7. El backend guarda movimientos y retransmite al frontend.
8. Al finalizar, se genera `FinalReport`.
