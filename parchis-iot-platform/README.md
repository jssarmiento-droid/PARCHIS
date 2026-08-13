# Parchis Inclusivo Multisensorial

Plataforma web y firmware para supervisar un tablero fisico de parchis inclusivo con sensores Hall, dos ESP32 y DFPlayer Mini.

## Tecnologias

- Frontend: React, TypeScript, Vite, Ant Design.
- Backend: NestJS, Prisma ORM, PostgreSQL.
- Tiempo real: Socket.IO.
- Firmware: C++ para Arduino IDE y ESP32 DevKit V1.
- Audio: DFPlayer Mini con microSD.

## Arquitectura

Frontend Vercel -> Backend Render -> PostgreSQL -> ESP32 principal por HTTP -> ESP32 sensores por I2C.

El ESP32 principal consulta la partida activa, descarga jugadores y preguntas seleccionadas, controla botones, sensores de casillas 16 a 28, DFPlayer y envia eventos al backend. El ESP32 de sensores lee las casillas 1 a 15 y entrega esa mascara al ESP32 principal por I2C.

## Ejecucion local

Backend:

```powershell
cd C:\Users\USER\Desktop\PARCHISPAGINA\parchis-iot-platform\backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run start:dev
```

Frontend:

```powershell
cd C:\Users\USER\Desktop\PARCHISPAGINA\parchis-iot-platform\frontend
npm install
npm run dev
```

## Variables de entorno

Backend:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/parchis_iot
JWT_SECRET=cambia-este-secreto
ADMIN_USER=admin
ADMIN_PASSWORD=admin123
DEVICE_TOKEN=token-del-esp32
FRONTEND_URL=http://localhost:5173,https://parchis-wine.vercel.app
```

Frontend:

```env
VITE_API_URL=http://localhost:4000
```

Para produccion, `VITE_API_URL` debe apuntar al backend de Render, por ejemplo `https://parchis-iot-backend.onrender.com`.

## Firmware

ESP32:

```text
firmware/esp32/ParchisInclusivo/ParchisInclusivo.ino
```

ESP32 sensores:

```text
firmware/esp32-sensores/Esp32SensoresHall/Esp32SensoresHall.ino
```

Antes de subir al ESP32, editar `firmware/esp32/ParchisInclusivo/Config.h` con el WiFi real y el mismo `DEVICE_TOKEN` configurado en Render.

## Pines del ESP32 de sensores

El segundo ESP32 lee las casillas 1 a 15:

| Casilla | Sensor | GPIO |
|---:|---|---:|
| 1 | H1 | 4 |
| 2 | H2 | 5 |
| 3 | H3 | 13 |
| 4 | H4 | 14 |
| 5 | H5 | 16 |
| 6 | H6 | 17 |
| 7 | H7 | 18 |
| 8 | H8 | 19 |
| 9 | H9 | 23 |
| 10 | H10 | 25 |
| 11 | H11 | 26 |
| 12 | H12 | 27 |
| 13 | H13 | 32 |
| 14 | H14 | 33 |
| 15 | H15 | 34 |

El enlace I2C entre ambos ESP32 usa `GPIO21` como SDA, `GPIO22` como SCL y GND comun.

## Validacion

```powershell
cd backend
npm run build
npm run lint

cd ..\frontend
npm run build
```

Las pruebas fisicas deben validar WiFi, I2C, sensores Hall, botones, DFPlayer, descarga de partida y monitoreo web.
