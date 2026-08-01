#ifndef AUDIO_H
#define AUDIO_H

#include <Arduino.h>
#include <DFRobotDFPlayerMini.h>

class Audio {
 public:
  bool iniciar();
  void actualizar();
  void reproducir(uint16_t pista);
  void repetir(uint16_t pista = 0);
  void limpiarCola();
  void establecerVolumen(uint8_t volumen);
  bool disponible() const;
  bool ocupado() const;

 private:
  static constexpr uint8_t QUEUE_SIZE = 6;
  HardwareSerial serial_{2};
  DFRobotDFPlayerMini player_;
  uint16_t queue_[QUEUE_SIZE] = {};
  uint8_t queueStart_ = 0;
  uint8_t queueCount_ = 0;
  uint16_t currentTrack_ = 0;
  uint16_t lastTrack_ = 0;
  uint32_t lastInitAttemptAt_ = 0;
  uint8_t volume_ = 20;
  bool ready_ = false;

  bool intentarConexion();
  void playNext();
};

#endif
