# Despliegue

## Frontend en Vercel

Recomendado para esta arquitectura:

1. Sube el repositorio a GitHub.
2. En Vercel, importa el proyecto.
3. Selecciona como Root Directory:

```text
parchis-iot-platform/frontend
```

4. Configura la variable:

```text
VITE_API_URL=https://URL-DE-TU-BACKEND
```

5. Deploy.

El archivo `frontend/vercel.json` ya deja preparada la app Vite para rutas internas como `/dashboard`, `/monitoreo` y `/reportes`.

## Backend

El backend usa NestJS, PostgreSQL y WebSocket persistente para comunicación con el ESP32. Para una demo universitaria y comunicación IoT estable, es recomendable desplegarlo en un servicio con proceso Node.js persistente, por ejemplo:

```text
Render
Railway
Fly.io
Servidor VPS
PC local en la misma red del ESP32
```

Variables necesarias:

```text
DATABASE_URL
JWT_SECRET
ADMIN_USER
ADMIN_PASSWORD
FRONTEND_URL
PORT
```

## Nota sobre WebSocket y Vercel

El frontend sí debe ir a Vercel sin problema.

Para el backend con Socket.IO y dispositivos físicos, conviene mantener un servidor persistente. Si se quiere alojar también en Vercel, habría que revisar y adaptar la arquitectura a las capacidades serverless/Fluid Compute disponibles en la cuenta, porque el firmware del ESP32 necesita una conexión estable de larga duración.
