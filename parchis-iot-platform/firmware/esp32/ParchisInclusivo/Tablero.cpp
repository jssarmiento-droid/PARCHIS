#include "Tablero.h"
#include "Audios.h"

namespace {
constexpr uint8_t ROUTES[Config::MAX_PLAYERS][Config::ROUTE_LENGTH] = {
  {4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 1, 2, 3, 21, 25},
  {9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 1, 2, 3, 4, 5, 6, 7, 8, 22, 26},
  {14, 15, 16, 17, 18, 19, 20, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 23, 27},
  {19, 20, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 24, 28}
};
}

uint8_t Tablero::posicionInicial(ColorJugador color) {
  const uint8_t index = static_cast<uint8_t>(color);
  return index < Config::MAX_PLAYERS ? ROUTES[index][0] : 0;
}

uint8_t Tablero::meta(ColorJugador color) {
  const uint8_t index = static_cast<uint8_t>(color);
  return index < Config::MAX_PLAYERS
    ? ROUTES[index][Config::ROUTE_LENGTH - 1]
    : 0;
}

TipoCasilla Tablero::tipo(uint8_t casilla) {
  switch (casilla) {
    case 4:
    case 9:
    case 14:
    case 19:
      return TipoCasilla::INICIO;
    case 1:
    case 5:
    case 13:
    case 17:
    case 20:
      return TipoCasilla::INFORMATIVA;
    case 3:
    case 7:
    case 11:
    case 15:
    case 18:
      return TipoCasilla::PREGUNTA;
    case 21:
    case 22:
    case 23:
    case 24:
      return TipoCasilla::ENTRADA;
    case 25:
    case 26:
    case 27:
    case 28:
      return TipoCasilla::META;
    default:
      return TipoCasilla::LIBRE;
  }
}

uint16_t Tablero::pistaInformativa(uint8_t casilla) {
  switch (casilla) {
    case 1: return Audios::INFO_CASILLA_1;
    case 5: return Audios::INFO_CASILLA_5;
    case 13: return Audios::INFO_CASILLA_13;
    case 17: return Audios::INFO_CASILLA_17;
    case 20: return Audios::INFO_CASILLA_20;
    default: return 0;
  }
}

bool Tablero::calcularDestino(
    ColorJugador color,
    uint8_t indiceActual,
    uint8_t dado,
    uint8_t& nuevoIndice,
    uint8_t& destino) {
  const uint8_t colorIndex = static_cast<uint8_t>(color);
  if (colorIndex >= Config::MAX_PLAYERS) return false;

  const uint16_t candidate = static_cast<uint16_t>(indiceActual) + dado;
  if (candidate >= Config::ROUTE_LENGTH) return false;

  nuevoIndice = static_cast<uint8_t>(candidate);
  destino = ROUTES[colorIndex][nuevoIndice];
  return true;
}
