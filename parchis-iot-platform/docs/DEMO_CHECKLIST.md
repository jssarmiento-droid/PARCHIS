# Checklist para la demostración

## Antes de encender

- Backend y frontend iniciados.
- PostgreSQL con las diez preguntas y pistas 201 a 210.
- MicroSD FAT32 con carpeta `/mp3/` y todos los audios.
- WiFi, `API_BASE_URL` y `DEVICE_TOKEN` configurados en `firmware/esp32/ParchisInclusivo/Config.h`.
- Arduino UNO y ESP32 cargados desde Arduino IDE.
- GND común y conversor de nivel lógico para I²C.

## Prueba de extremo a extremo

1. Crear una partida y seleccionar preguntas.
2. Confirmar que Monitoreo muestra `CREATED`.
3. Colocar únicamente las fichas de los jugadores participantes en sus casillas iniciales.
4. Presionar Power y esperar el diagnóstico.
5. Confirmar que la partida cambia a `RUNNING`.
6. Probar dado, movimiento válido, casilla informativa, pregunta, A/B, Confirmar y Repetir.
7. Probar una casilla ocupada y un dado que supere la meta.
8. Llegar a meta y revisar el reporte final.

## Señales de error

| Síntoma | Revisión |
|---|---|
| No se carga la partida | WiFi, URL del backend y partida preparada. |
| No hay audio | Carpeta `/mp3/`, nombres, alimentación y UART del DFPlayer. |
| Error Arduino UNO | SDA/A4 a GPIO21, SCL/A5 a GPIO22, GND común y conversor de nivel. |
| Fichas incorrectas | Retirar colores no participantes y usar casillas iniciales 4, 9, 14 y 19. |
| Eventos pendientes | El ESP32 los reenviará cuando recupere la red. |
