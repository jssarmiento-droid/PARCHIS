# Guia de audios

Los audios fisicos del circuito se reproducen desde la microSD del DFPlayer Mini. La pagina registra el numero de pista, pero no copia archivos a la microSD.

## Estructura obligatoria

```text
MP3/
  0001.mp3
  0002.mp3
  0011.mp3
  0201.mp3
```

La carpeta debe llamarse `MP3`. Los archivos deben tener una sola extension `.mp3`.

## Pistas principales

- 0001: bienvenida.
- 0002: sin partida activa.
- 0003: diagnostico.
- 0004: diagnostico correcto.
- 0005: posiciones iniciales incorrectas.
- 0006: partida iniciada.
- 0011-0014: turnos Azul, Rojo, Verde y Amarillo.
- 0021-0026: dado 1 a 6.
- 0031-0034: movimiento correcto, incorrecto, casilla ocupada y dado excede meta.
- 0041-0045: opcion A, opcion B, seleccione opcion, respuesta correcta e incorrecta.
- 0101-0105: audios informativos.
- 0201-0210: preguntas educativas.
- 0301-0305: llegada a meta y ganadores.
- 0402: error de comunicacion con Arduino UNO.

En la pagina, una pregunta con pista `201` corresponde al archivo `MP3/0201.mp3`.
