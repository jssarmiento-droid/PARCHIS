export type PlayerColor = 'BLUE' | 'RED' | 'GREEN' | 'YELLOW';
export type DeviceKind = 'ESP32' | 'ARDUINO_NANO';
export type GameStatus = 'CREATED' | 'RUNNING' | 'PAUSED' | 'FINISHED' | 'ABORTED';

export interface DeviceStatus {
  id: string;
  kind: DeviceKind;
  name: string;
  connected: boolean;
  ipAddress?: string;
  firmwareVersion?: string;
  lastSeenAt?: string;
  health?: Record<string, unknown>;
}

export interface GamePlayer {
  id: string;
  color: PlayerColor;
  name: string;
  currentTile: number;
  educationalScore: number;
  isWinner: boolean;
}

export interface GameSession {
  id: string;
  publicId: string;
  status: GameStatus;
  startedAt?: string;
  finishedAt?: string;
  durationSeconds: number;
  winnerColor?: PlayerColor;
  players: GamePlayer[];
  movements?: MoveHistory[];
}

export interface MoveHistory {
  id: string;
  turnNumber: number;
  color: PlayerColor;
  diceValue?: number;
  fromTile?: number;
  toTile?: number;
  tileType?: string;
  questionText?: string;
  selectedAnswer?: string;
  isCorrect?: boolean;
  educationalScore: number;
  eventName: string;
  createdAt: string;
}
