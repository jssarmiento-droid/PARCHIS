# Parchis Inclusivo Multisensorial

Plataforma web y firmware para supervisar un tablero fisico de parchis inclusivo con sensores Hall, ESP32, Arduino UNO y DFPlayer Mini.

## Tecnologias

- Frontend: React, TypeScript, Vite, Ant Design.
- Backend: NestJS, Prisma ORM, PostgreSQL.
- Tiempo real: Socket.IO.
- Firmware: C++ para Arduino IDE, ESP32 DevKit V1 y Arduino UNO R3.
- Audio: DFPlayer Mini con microSD.

## Arquitectura

Frontend Vercel -> Backend Render -> PostgreSQL -> ESP32 por HTTP -> Arduino UNO por I2C.

El ESP32 consulta la partida activa, descarga jugadores y preguntas seleccionadas, controla botones, sensores de casillas 16 a 28, DFPlayer y envia eventos al backend. El Arduino UNO solo lee sensores Hall de casillas 1 a 15 y entrega esa mascara al ESP32 por I2C.

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
VITE_API_URL=http://localhost:4000/api/v1
```

Para produccion, `VITE_API_URL` debe apuntar al backend de Render.

## Firmware

ESP32:

```text
firmware/esp32/ParchisInclusivo/ParchisInclusivo.ino
```

Arduino UNO:

```text
firmware/arduino-uno/ArduinoUnoHall/ArduinoUnoHall.ino
```

Antes de subir al ESP32, editar `firmware/esp32/ParchisInclusivo/Config.h` con el WiFi real y el mismo `DEVICE_TOKEN` configurado en Render.

## Validacion

```powershell
cd backend
npm run build
npm run lint

cd ..\frontend
npm run build
```

Las pruebas fisicas deben validar WiFi, I2C, sensores Hall, botones, DFPlayer, descarga de partida y monitoreo web.
