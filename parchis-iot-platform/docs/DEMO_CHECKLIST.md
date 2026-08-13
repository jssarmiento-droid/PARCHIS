# Checklist de presentacion

## Antes de iniciar

- Backend de Render activo.
- Frontend de Vercel activo.
- PostgreSQL disponible.
- `DEVICE_TOKEN` igual en Render y `Config.h`.
- WiFi del ESP32 con internet.
- microSD en FAT32 con carpeta `MP3`.
- ESP32 sensores cargado con `Esp32SensoresHall.ino`.
- ESP32 cargado con `ParchisInclusivo.ino`.

## Pruebas por modulo

- ESP32 conecta a WiFi.
- ESP32 consulta partida activa.
- ESP32 sensores responde por I2C.
- Sensores Hall detectan fichas.
- Botones envian eventos.
- DFPlayer reproduce una pista.
- La pagina muestra ESP32 conectado.
- Monitoreo recibe movimientos de todos los colores activos.

## Flujo de defensa

1. Iniciar sesion como administrador.
2. Encender fisicamente el tablero.
3. Crear una partida.
4. Seleccionar preguntas.
5. Colocar las fichas en sus casillas iniciales.
6. Presionar Confirmar para validar posiciones e iniciar la partida fisica.
7. Mostrar eventos en monitoreo.
8. Responder una pregunta.
9. Finalizar o llegar a meta.
10. Mostrar historial y reportes.
