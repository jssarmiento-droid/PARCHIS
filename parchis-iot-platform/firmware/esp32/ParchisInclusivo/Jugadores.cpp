#include "Jugadores.h"
#include "Tablero.h"

void Jugadores::cargar(const ConfiguracionPartida& configuracion) {
  totalActivos_ = 0;
  actual_ = ColorJugador::NINGUNO;

  for (uint8_t index = 0; index < Config::MAX_PLAYERS; index++) {
    jugadores_[index] = configuracion.jugadores[index];
    if (!jugadores_[index].activo) continue;
    jugadores_[index].indiceRuta = 0;
    jugadores_[index].posicion = Tablero::posicionInicial(jugadores_[index].color);
    jugadores_[index].ultimoDado = 0;
    jugadores_[index].puntajeEducativo = 0;
    jugadores_[index].respuestasCorrectas = 0;
    jugadores_[index].respuestasIncorrectas = 0;
    jugadores_[index].ganador = false;
    totalActivos_++;
  }
}

void Jugadores::seleccionarPrimeroAleatorio() {
  if (totalActivos_ == 0) return;
  uint8_t selected = static_cast<uint8_t>(random(totalActivos_));
  for (uint8_t index = 0; index < Config::MAX_PLAYERS; index++) {
    if (!jugadores_[index].activo) continue;
    if (selected == 0) {
      actual_ = static_cast<ColorJugador>(index);
      return;
    }
    selected--;
  }
}

DatosJugador& Jugadores::actual() {
  return jugadores_[static_cast<uint8_t>(actual_)];
}

const DatosJugador& Jugadores::actual() const {
  return jugadores_[static_cast<uint8_t>(actual_)];
}

DatosJugador& Jugadores::obtener(ColorJugador color) {
  return jugadores_[static_cast<uint8_t>(color)];
}

const DatosJugador& Jugadores::obtener(ColorJugador color) const {
  return jugadores_[static_cast<uint8_t>(color)];
}

void Jugadores::siguiente() {
  if (totalActivos_ == 0) return;
  uint8_t index = static_cast<uint8_t>(actual_);
  for (uint8_t offset = 1; offset <= Config::MAX_PLAYERS; offset++) {
    const uint8_t candidate = (index + offset) % Config::MAX_PLAYERS;
    if (jugadores_[candidate].activo) {
      actual_ = static_cast<ColorJugador>(candidate);
      return;
    }
  }
}

bool Jugadores::ocupadaPorOtro(uint8_t casilla, ColorJugador excepto) const {
  for (uint8_t index = 0; index < Config::MAX_PLAYERS; index++) {
    const DatosJugador& jugador = jugadores_[index];
    if (jugador.activo && jugador.color != excepto && jugador.posicion == casilla) {
      return true;
    }
  }
  return false;
}

uint32_t Jugadores::mascaraEsperada() const {
  uint32_t mask = 0;
  for (uint8_t index = 0; index < Config::MAX_PLAYERS; index++) {
    const DatosJugador& jugador = jugadores_[index];
    if (jugador.activo && jugador.posicion > 0) {
      mask |= static_cast<uint32_t>(1) << (jugador.posicion - 1);
    }
  }
  return mask;
}

uint8_t Jugadores::totalActivos() const {
  return totalActivos_;
}

ColorJugador Jugadores::mejorPuntaje() const {
  ColorJugador best = ColorJugador::NINGUNO;
  uint16_t bestScore = 0;
  for (uint8_t index = 0; index < Config::MAX_PLAYERS; index++) {
    const DatosJugador& jugador = jugadores_[index];
    if (!jugador.activo) continue;
    if (best == ColorJugador::NINGUNO || jugador.puntajeEducativo > bestScore) {
      best = jugador.color;
      bestScore = jugador.puntajeEducativo;
    }
  }
  return best;
}
