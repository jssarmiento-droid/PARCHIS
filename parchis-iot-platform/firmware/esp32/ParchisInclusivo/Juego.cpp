#include "Juego.h"
#include "Audios.h"
#include "Config.h"
#include "Tablero.h"

namespace {
void imprimirMascaraCasillas(const char* etiqueta, uint32_t mascara) {
  Serial.print(etiqueta);
  Serial.print(": ");
  bool hayCasillas = false;
  for (uint8_t casilla = 1; casilla <= Config::TOTAL_TILES; casilla++) {
    if ((mascara & (static_cast<uint32_t>(1) << (casilla - 1))) == 0) continue;
    if (hayCasillas) Serial.print(", ");
    Serial.print(casilla);
    hayCasillas = true;
  }
  if (!hayCasillas) Serial.print("ninguna");
  Serial.println();
}
}  // namespace

void Juego::iniciar() {
  bootId_ = esp_random();
  lastConfigPollAt_ = millis() - Config::REMOTE_CONFIG_POLL_MS;
  dado_.iniciar();
  botones_.iniciar();
  sensores_.iniciar();
  audio_.iniciar();
  comunicacion_.iniciar();
  audio_.reproducir(Audios::BIENVENIDA);
}

void Juego::actualizar() {
  comunicacion_.actualizar();
  botones_.actualizar();
  sensores_.actualizar();
  audio_.actualizar();
  if (requierePuenteSensores() && !sensores_.puenteSensoresConectado()) pausarPorPuenteSensores();
  sincronizarConfiguracion();
  sincronizarPartida();
  enviarEstadoDispositivo();

  if (botonPresionado(TipoBoton::REPETIR)) {
    if (estado_ == EstadoJuego::ESPERANDO_RESPUESTA
        && currentQuestionIndex_ < configuracion_.totalPreguntas) {
      audio_.repetir(configuracion_.preguntas[currentQuestionIndex_].pistaAudio);
    } else {
      audio_.repetir();
    }
  }

  switch (estado_) {
    case EstadoJuego::ESPERANDO_SESION: esperarSesion(); break;
    case EstadoJuego::ESPERANDO_CONFIRMACION_INICIO: esperarConfirmacionInicio(); break;
    case EstadoJuego::VALIDANDO_INICIO: validarInicio(); break;
    case EstadoJuego::ESPERANDO_DADO: esperarDado(); break;
    case EstadoJuego::ESPERANDO_MOVIMIENTO: esperarMovimiento(); break;
    case EstadoJuego::CORRIGIENDO_MOVIMIENTO: corregirMovimiento(); break;
    case EstadoJuego::PROCESANDO_CASILLA: procesarCasilla(); break;
    case EstadoJuego::ESPERANDO_RESPUESTA: esperarRespuesta(); break;
    case EstadoJuego::ESPERANDO_AUDIO: esperarAudio(); break;
    case EstadoJuego::PAUSADO_DISPOSITIVO: esperarReconexionPuenteSensores(); break;
    default: break;
  }
}

void Juego::sincronizarPartida() {
  const uint32_t now = millis();
  if (now - lastGamePollAt_ < Config::ACTIVE_GAME_POLL_MS) return;
  lastGamePollAt_ = now;

  if (estado_ != EstadoJuego::ESPERANDO_SESION
      && estado_ != EstadoJuego::ESPERANDO_CONFIRMACION_INICIO
      && estado_ != EstadoJuego::FINALIZADO) {
    return;
  }

  ConfiguracionPartida next;
  if (!comunicacion_.obtenerPartidaActiva(next)) return;

  const bool newGame = next.id != configuracion_.id;
  if (!newGame && estado_ != EstadoJuego::ESPERANDO_CONFIRMACION_INICIO) return;

  configuracion_ = next;
  jugadores_.cargar(configuracion_);
  estado_ = EstadoJuego::ESPERANDO_CONFIRMACION_INICIO;
  initialPositionErrorReported_ = false;
}

void Juego::sincronizarConfiguracion() {
  const uint32_t now = millis();
  if (now - lastConfigPollAt_ < Config::REMOTE_CONFIG_POLL_MS) return;
  lastConfigPollAt_ = now;

  ConfiguracionRemota next = configuracionRemota_;
  if (!comunicacion_.obtenerConfiguracion(next)) return;
  configuracionRemota_ = next;
  aplicarConfiguracionRemota();
}

void Juego::enviarEstadoDispositivo() {
  const uint32_t now = millis();
  if (now - lastStatusAt_ < Config::STATUS_INTERVAL_MS) return;
  lastStatusAt_ = now;
  comunicacion_.enviarEstadoDispositivo(
    configuracion_.id,
    sensores_.puenteSensoresConectado(),
    audio_.disponible(),
    configuracionRemota_.volumenPorcentaje,
    configuracionRemota_.tiempoMovimientoSegundos);
}

bool Juego::botonPresionado(TipoBoton boton) {
  if (!botones_.consumir(boton)) return false;
  comunicacion_.enviarBoton(configuracion_.id, Botones::nombre(boton));
  return true;
}

void Juego::esperarSesion() {
  if (!botonPresionado(TipoBoton::CONFIRMAR)) return;

  ConfiguracionPartida next;
  if (!comunicacion_.obtenerPartidaActiva(next)) {
    audio_.reproducir(Audios::SIN_PARTIDA);
    return;
  }

  configuracion_ = next;
  jugadores_.cargar(configuracion_);
  initialPositionErrorReported_ = false;
  solicitarInicioFisico();
}

void Juego::esperarConfirmacionInicio() {
  if (!botonPresionado(TipoBoton::CONFIRMAR)) return;
  solicitarInicioFisico();
}

void Juego::solicitarInicioFisico() {
  audio_.reproducir(Audios::DIAGNOSTICO);

  if (!sensores_.puenteSensoresConectado()) {
    audio_.reproducir(Audios::ERROR_PUENTE_SENSORES);
    return;
  }
  if (!audio_.disponible()) return;

  if (!Config::VALIDAR_FICHAS_INICIALES) {
    Serial.println("[INICIO] Modo directo: se omite la validacion de fichas iniciales");
    iniciarPartidaFisica();
    return;
  }

  estado_ = EstadoJuego::VALIDANDO_INICIO;
}

void Juego::validarInicio() {
  const uint32_t expectedMask = jugadores_.mascaraEsperada();
  const uint32_t actualMask = sensores_.mascara();
  if (expectedMask != actualMask) {
    if (!initialPositionErrorReported_) {
      imprimirMascaraCasillas("[INICIO] Casillas esperadas", expectedMask);
      imprimirMascaraCasillas("[INICIO] Casillas detectadas", actualMask);
      audio_.reproducir(Audios::POSICIONES_INCORRECTAS);
      initialPositionErrorReported_ = true;
    }
    return;
  }

  initialPositionErrorReported_ = false;
  iniciarPartidaFisica();
}

void Juego::iniciarPartidaFisica() {
  jugadores_.seleccionarPrimeroAleatorio();
  turnNumber_ = 1;
  questionCursor_ = 0;
  audio_.reproducir(Audios::DIAGNOSTICO_OK);
  audio_.reproducir(Audios::PARTIDA_INICIADA);

  DynamicJsonDocument payload(1024);
  prepararEvento(payload, "game_started");
  payload["currentTile"] = jugadores_.actual().posicion;
  comunicacion_.enviarEvento(payload);

  anunciarTurno();
  estado_ = EstadoJuego::ESPERANDO_DADO;
}

void Juego::esperarDado() {
  if (!botonPresionado(TipoBoton::DADO)) return;

  DatosJugador& player = jugadores_.actual();
  player.ultimoDado = dado_.lanzar();
  audio_.reproducir(Audios::DADO_UNO + player.ultimoDado - 1);

  DynamicJsonDocument diceEvent(1024);
  prepararEvento(diceEvent, "dice");
  diceEvent["diceValue"] = player.ultimoDado;
  diceEvent["currentTile"] = player.posicion;
  diceEvent["fromTile"] = player.posicion;
  diceEvent["toTile"] = player.posicion;
  comunicacion_.enviarEvento(diceEvent);

  originTile_ = player.posicion;
  destinationTile_ = 0;
  if (!Tablero::calcularDestino(
      player.color,
      player.indiceRuta,
      player.ultimoDado,
      destinationRouteIndex_,
      destinationTile_)) {
    audio_.reproducir(Audios::DADO_EXCEDE_META);
    enviarMovimientoInvalido("GOAL_OVERSHOOT");
    programarCambioTurno();
    return;
  }

  if (jugadores_.ocupadaPorOtro(destinationTile_, player.color)) {
    audio_.reproducir(Audios::CASILLA_OCUPADA);
    enviarMovimientoInvalido("OCCUPIED_TILE");
    programarCambioTurno();
    return;
  }

  movementInitialMask_ = jugadores_.mascaraEsperada();
  movementExpectedMask_ = movementInitialMask_;
  movementExpectedMask_ &= ~(static_cast<uint32_t>(1) << (originTile_ - 1));
  movementExpectedMask_ |= static_cast<uint32_t>(1) << (destinationTile_ - 1);
  movementErrorReported_ = false;
  reiniciarMovimientoInesperado();
  movementStartedAt_ = millis();
  estado_ = EstadoJuego::ESPERANDO_MOVIMIENTO;
}

void Juego::esperarMovimiento() {
  const uint32_t now = millis();
  if (now - movementStartedAt_ >= configuracionRemota_.tiempoMovimientoSegundos * 1000UL) {
    audio_.reproducir(Audios::MOVIMIENTO_INCORRECTO);
    enviarMovimientoInvalido("MOVEMENT_TIMEOUT");
    movementErrorReported_ = true;
    estado_ = EstadoJuego::CORRIGIENDO_MOVIMIENTO;
    return;
  }
  const uint32_t actualMask = sensores_.mascara();
  const uint32_t movingMask = movementInitialMask_
    & ~(static_cast<uint32_t>(1) << (originTile_ - 1));

  if (actualMask == movementExpectedMask_) {
    reiniciarMovimientoInesperado();
    aceptarMovimiento();
    return;
  }

  if (actualMask == movementInitialMask_ || actualMask == movingMask) {
    reiniciarMovimientoInesperado();
    return;
  }

  if (actualMask != movementUnexpectedMask_) {
    movementUnexpectedMask_ = actualMask;
    movementUnexpectedSince_ = now;
    return;
  }
  if (now - movementUnexpectedSince_ < Config::MOVEMENT_SETTLE_MS) return;

  if (!movementErrorReported_) {
    audio_.reproducir(Audios::MOVIMIENTO_INCORRECTO);
    enviarMovimientoInvalido("WRONG_TILE_OR_PIECE");
    movementErrorReported_ = true;
  }
  estado_ = EstadoJuego::CORRIGIENDO_MOVIMIENTO;
}

void Juego::corregirMovimiento() {
  if (sensores_.mascara() != movementInitialMask_) return;
  movementErrorReported_ = false;
  reiniciarMovimientoInesperado();
  movementStartedAt_ = millis();
  estado_ = EstadoJuego::ESPERANDO_MOVIMIENTO;
}

void Juego::aceptarMovimiento() {
  DatosJugador& player = jugadores_.actual();
  player.indiceRuta = destinationRouteIndex_;
  player.posicion = destinationTile_;
  audio_.reproducir(Audios::MOVIMIENTO_CORRECTO);

  DynamicJsonDocument payload(1280);
  prepararEvento(payload, "movement_correct");
  payload["diceValue"] = player.ultimoDado;
  payload["fromTile"] = originTile_;
  payload["toTile"] = destinationTile_;
  payload["currentTile"] = destinationTile_;
  payload["tileType"] = tipoCasillaApi(Tablero::tipo(destinationTile_));
  payload["educationalScore"] = player.puntajeEducativo;
  comunicacion_.enviarEvento(payload);
  estado_ = EstadoJuego::PROCESANDO_CASILLA;
}

void Juego::procesarCasilla() {
  const uint8_t tile = jugadores_.actual().posicion;
  const TipoCasilla type = Tablero::tipo(tile);

  if (type == TipoCasilla::META) {
    finalizarPartida();
    return;
  }

  if (type == TipoCasilla::INFORMATIVA) {
    audio_.reproducir(Tablero::pistaInformativa(tile));
    DynamicJsonDocument payload(1024);
    prepararEvento(payload, "informative_tile");
    payload["currentTile"] = tile;
    payload["tileType"] = "INFORMATIVE";
    comunicacion_.enviarEvento(payload);
    programarCambioTurno();
    return;
  }

  if (type == TipoCasilla::PREGUNTA) {
    iniciarPregunta();
    return;
  }

  programarCambioTurno();
}

void Juego::iniciarPregunta() {
  if (configuracion_.totalPreguntas == 0) {
    programarCambioTurno();
    return;
  }

  currentQuestionIndex_ = questionCursor_ % configuracion_.totalPreguntas;
  questionCursor_++;
  respuestaSeleccionada_ = Respuesta::NINGUNA;
  const PreguntaJuego& question = configuracion_.preguntas[currentQuestionIndex_];
  audio_.reproducir(question.pistaAudio);

  DynamicJsonDocument payload(2048);
  prepararEvento(payload, "question_started");
  payload["currentTile"] = jugadores_.actual().posicion;
  payload["tileType"] = "QUESTION";
  payload["questionId"] = question.id;
  payload["questionText"] = question.texto;
  payload["audioTrack"] = question.pistaAudio;
  comunicacion_.enviarEvento(payload);
  estado_ = EstadoJuego::ESPERANDO_RESPUESTA;
}

void Juego::esperarRespuesta() {
  if (botonPresionado(TipoBoton::OPCION_A)) {
    respuestaSeleccionada_ = Respuesta::A;
    audio_.reproducir(Audios::OPCION_A);
  }
  if (botonPresionado(TipoBoton::OPCION_B)) {
    respuestaSeleccionada_ = Respuesta::B;
    audio_.reproducir(Audios::OPCION_B);
  }
  if (!botonPresionado(TipoBoton::CONFIRMAR)) return;

  if (respuestaSeleccionada_ == Respuesta::NINGUNA) {
    audio_.reproducir(Audios::SELECCIONE_OPCION);
    return;
  }

  DatosJugador& player = jugadores_.actual();
  const PreguntaJuego& question = configuracion_.preguntas[currentQuestionIndex_];
  const bool correct = respuestaSeleccionada_ == question.correcta;
  if (correct) {
    player.puntajeEducativo++;
    player.respuestasCorrectas++;
    audio_.reproducir(Audios::RESPUESTA_CORRECTA);
  } else {
    player.respuestasIncorrectas++;
    audio_.reproducir(Audios::RESPUESTA_INCORRECTA);
  }

  DynamicJsonDocument payload(2048);
  prepararEvento(payload, "answer");
  payload["currentTile"] = player.posicion;
  payload["tileType"] = "QUESTION";
  payload["questionId"] = question.id;
  payload["questionText"] = question.texto;
  payload["selectedAnswer"] = respuestaSeleccionada_ == Respuesta::A ? "A" : "B";
  payload["isCorrect"] = correct;
  payload["educationalScore"] = player.puntajeEducativo;
  comunicacion_.enviarEvento(payload);

  respuestaSeleccionada_ = Respuesta::NINGUNA;
  programarCambioTurno();
}

void Juego::esperarAudio() {
  if (!audio_.ocupado()) cambiarTurno();
}

void Juego::esperarReconexionPuenteSensores() {
  if (!sensores_.puenteSensoresConectado()) return;

  if (estadoAntesDePausa_ == EstadoJuego::ESPERANDO_MOVIMIENTO
      && sensores_.mascara() == movementExpectedMask_) {
    aceptarMovimiento();
    return;
  }

  if (sensores_.mascara() != jugadores_.mascaraEsperada()) return;
  if (movementStartedAt_ > 0) movementStartedAt_ += millis() - pausedAt_;
  estado_ = estadoAntesDePausa_;
  audio_.reproducir(Audios::DIAGNOSTICO_OK);

  DynamicJsonDocument payload(768);
  prepararEvento(payload, "device_resumed");
  comunicacion_.enviarEvento(payload);
}

void Juego::cambiarTurno() {
  turnNumber_++;
  jugadores_.siguiente();
  anunciarTurno();

  DynamicJsonDocument payload(1024);
  prepararEvento(payload, "turn_changed");
  payload["currentTile"] = jugadores_.actual().posicion;
  comunicacion_.enviarEvento(payload);
  estado_ = EstadoJuego::ESPERANDO_DADO;
}

void Juego::finalizarPartida() {
  DatosJugador& winner = jugadores_.actual();
  winner.ganador = true;
  audio_.reproducir(Audios::LLEGADA_META);
  audio_.reproducir(Audios::GANA_AZUL + static_cast<uint8_t>(winner.color));

  DynamicJsonDocument payload(1280);
  prepararEvento(payload, "winner");
  payload["currentTile"] = winner.posicion;
  payload["toTile"] = winner.posicion;
  payload["tileType"] = "GOAL";
  payload["educationalScore"] = winner.puntajeEducativo;
  payload["bestEducationalColor"] = colorApi(jugadores_.mejorPuntaje());
  comunicacion_.enviarEvento(payload);
  estado_ = EstadoJuego::FINALIZADO;
}

void Juego::anunciarTurno() {
  audio_.reproducir(Audios::TURNO_AZUL
    + static_cast<uint8_t>(jugadores_.actual().color));
}

void Juego::programarCambioTurno() {
  estado_ = EstadoJuego::ESPERANDO_AUDIO;
}

void Juego::prepararEvento(DynamicJsonDocument& payload, const char* eventName) {
  eventSequence_++;
  payload["eventName"] = eventName;
  payload["eventId"] = String(bootId_, HEX) + "-" + String(eventSequence_);
  payload["sequence"] = eventSequence_;
  payload["gameId"] = configuracion_.id;
  payload["turnNumber"] = turnNumber_;
  payload["color"] = colorApi(jugadores_.actual().color);
  payload["occurredAtMs"] = millis();
}

void Juego::enviarMovimientoInvalido(const char* reason) {
  DynamicJsonDocument payload(1280);
  prepararEvento(payload, "movement_invalid");
  payload["diceValue"] = jugadores_.actual().ultimoDado;
  payload["fromTile"] = originTile_;
  payload["toTile"] = destinationTile_;
  payload["currentTile"] = originTile_;
  payload["reason"] = reason;
  comunicacion_.enviarEvento(payload);
}

bool Juego::requierePuenteSensores() const {
  return estado_ == EstadoJuego::ESPERANDO_DADO
    || estado_ == EstadoJuego::ESPERANDO_MOVIMIENTO
    || estado_ == EstadoJuego::CORRIGIENDO_MOVIMIENTO
    || estado_ == EstadoJuego::PROCESANDO_CASILLA
    || estado_ == EstadoJuego::ESPERANDO_RESPUESTA
    || estado_ == EstadoJuego::ESPERANDO_AUDIO;
}

void Juego::pausarPorPuenteSensores() {
  estadoAntesDePausa_ = estado_;
  pausedAt_ = millis();
  estado_ = EstadoJuego::PAUSADO_DISPOSITIVO;
  audio_.reproducir(Audios::ERROR_PUENTE_SENSORES);

  DynamicJsonDocument payload(768);
  prepararEvento(payload, "device_paused");
  payload["reason"] = "SENSOR_BRIDGE_I2C_DISCONNECTED";
  comunicacion_.enviarEvento(payload);
}

void Juego::reiniciarMovimientoInesperado() {
  movementUnexpectedMask_ = 0;
  movementUnexpectedSince_ = 0;
}

void Juego::aplicarConfiguracionRemota() {
  const uint8_t volumenDfPlayer = static_cast<uint8_t>(
    (static_cast<uint16_t>(configuracionRemota_.volumenPorcentaje) * 30 + 50) / 100);
  audio_.establecerVolumen(volumenDfPlayer);
}
