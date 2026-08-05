# Checklist de presentacion

## Antes de iniciar

- Backend de Render activo.
- Frontend de Vercel activo.
- PostgreSQL disponible.
- `DEVICE_TOKEN` igual en Render y `Config.h`.
- WiFi del ESP32 con internet.
- microSD en FAT32 con carpeta `MP3`.
- Arduino UNO cargado con `ArduinoUnoHall.ino`.
- ESP32 cargado con `ParchisInclusivo.ino`.

## Pruebas por modulo

- ESP32 conecta a WiFi.
- ESP32 consulta partida activa.
- Arduino UNO responde por I2C.
- Sensores Hall detectan fichas.
- Botones envian eventos.
- DFPlayer reproduce una pista.
- La pagina muestra ESP32 conectado.
- Monitoreo recibe movimientos de todos los colores activos.

## Flujo de defensa

1. Iniciar sesion como administrador.
2. Crear una partida.
3. Seleccionar preguntas.
4. Encender tablero.
5. Mostrar eventos en monitoreo.
6. Responder una pregunta.
7. Finalizar o llegar a meta.
8. Mostrar historial y reportes.
