# Despliegue

## Backend en Render

Root directory:

```text
parchis-iot-platform/backend
```

Build command:

```bash
npm run render:build
```

Start command:

```bash
npm run render:start
```

Variables:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
ADMIN_USER=admin
ADMIN_PASSWORD=...
DEVICE_TOKEN=...
FRONTEND_URL=https://parchis-wine.vercel.app
```

## Frontend en Vercel

Root directory:

```text
parchis-iot-platform/frontend
```

Variable:

```env
VITE_API_URL=https://parchis-iot-backend.onrender.com/api/v1
```

## Firmware

Para produccion, `Config.h` debe usar:

```cpp
constexpr char API_BASE_URL[] = "https://parchis-iot-backend.onrender.com/api/v1";
```

El `DEVICE_TOKEN` del firmware debe coincidir con Render.
