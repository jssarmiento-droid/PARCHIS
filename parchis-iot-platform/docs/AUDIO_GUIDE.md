# Guía de audios para la microSD

1. Formatea la microSD en FAT32.
2. Crea la carpeta `/mp3/` en la raíz.
3. Usa nombres de cuatro dígitos, por ejemplo `0201.mp3`.
4. La página guarda la pista `201`; el DFPlayer reproduce el archivo `/mp3/0201.mp3`.

## Preguntas

| Pista | Archivo | Región | Respuesta correcta |
|---:|---|---|:---:|
| 201 | `0201.mp3` | Costa: Perla del Pacífico | A |
| 202 | `0202.mp3` | Costa: cultivo representativo | B |
| 203 | `0203.mp3` | Sierra: Mitad del Mundo | B |
| 204 | `0204.mp3` | Sierra: volcán más alto | A |
| 205 | `0205.mp3` | Amazonía: provincia | B |
| 206 | `0206.mp3` | Amazonía: río | B |
| 207 | `0207.mp3` | Galápagos: Darwin | A |
| 208 | `0208.mp3` | Galápagos: Ecuador | B |
| 209 | `0209.mp3` | General: regiones naturales | B |
| 210 | `0210.mp3` | General: capital | A |

Cada audio de pregunta debe decir el enunciado, opción A, opción B y la instrucción de confirmar. No debe decir la respuesta correcta.

Ejemplo de `0201.mp3`:

```text
Pregunta. ¿Cuál es la ciudad conocida como la Perla del Pacífico?
Opción A: Guayaquil.
Opción B: Manta.
Seleccione una opción y presione confirmar.
```

## Audios generales

| Rango | Archivos | Uso |
|---|---|---|
| 0001-0006 | Bienvenida, diagnóstico e inicio | Sistema |
| 0011-0014 | Turno por color | Jugadores |
| 0021-0026 | Resultado del dado | Movimiento |
| 0031-0034 | Movimiento correcto, incorrecto, ocupado y meta | Validación |
| 0041-0045 | A, B, confirmar y resultado de respuesta | Preguntas |
| 0101-0105 | Datos informativos | Casillas 1, 5, 13, 17 y 20 |
| 0301-0305 | Meta y ganador | Final de partida |
| 0402 | Error de comunicación I²C | Arduino UNO |
