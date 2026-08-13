#include "Audio.h"
#include "Config.h"

bool Audio::iniciar() {
  volume_ = min(Config::DFPLAYER_VOLUME, static_cast<uint8_t>(30));
  serial_.begin(9600, SERIAL_8N1, Config::DFPLAYER_RX_PIN, Config::DFPLAYER_TX_PIN);
  return intentarConexion();
}

void Audio::actualizar() {
  if (!ready_) {
    if (millis() - lastInitAttemptAt_ >= Config::DFPLAYER_RETRY_MS) intentarConexion();
    return;
  }
  if (!player_.available()) return;
  if (player_.readType() == DFPlayerPlayFinished) {
    currentTrack_ = 0;
    playNext();
  }
}

void Audio::reproducir(uint16_t pista) {
  if (!ready_ || pista == 0) return;
  lastTrack_ = pista;

  if (currentTrack_ == 0) {
    currentTrack_ = pista;
    player_.playMp3Folder(pista);
    return;
  }

  if (queueCount_ < QUEUE_SIZE) {
    const uint8_t index = (queueStart_ + queueCount_) % QUEUE_SIZE;
    queue_[index] = pista;
    queueCount_++;
  }
}

void Audio::repetir(uint16_t pista) {
  if (!ready_) return;
  const uint16_t trackToRepeat = pista > 0 ? pista : lastTrack_;
  if (trackToRepeat == 0) return;
  limpiarCola();
  lastTrack_ = trackToRepeat;
  currentTrack_ = trackToRepeat;
  player_.playMp3Folder(trackToRepeat);
}

void Audio::limpiarCola() {
  queueStart_ = 0;
  queueCount_ = 0;
}

void Audio::establecerVolumen(uint8_t volumen) {
  volume_ = min(volumen, static_cast<uint8_t>(30));
  if (ready_) player_.volume(volume_);
}

bool Audio::disponible() const {
  return ready_;
}

bool Audio::ocupado() const {
  return currentTrack_ != 0 || queueCount_ > 0;
}

bool Audio::intentarConexion() {
  lastInitAttemptAt_ = millis();
  ready_ = player_.begin(serial_, true, true);
  if (!ready_) return false;
  player_.volume(volume_);
  player_.EQ(DFPLAYER_EQ_NORMAL);
  return true;
}

void Audio::playNext() {
  if (queueCount_ == 0) return;
  currentTrack_ = queue_[queueStart_];
  queueStart_ = (queueStart_ + 1) % QUEUE_SIZE;
  queueCount_--;
  player_.playMp3Folder(currentTrack_);
}
