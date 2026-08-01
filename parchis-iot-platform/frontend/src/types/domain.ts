export type PlayerColor = 'BLUE' | 'RED' | 'GREEN' | 'YELLOW';
export type DeviceKind = 'ESP32' | 'ARDUINO_UNO';
export type GameStatus = 'CREATED' | 'RUNNING' | 'PAUSED' | 'FINISHED' | 'ABORTED';

export interface SystemConfig {
  id: string;
  projectName: string;
  logoUrl?: string;
  playerCount: number;
  tileCount: number;
  timeoutSeconds: number;
  volume: number;
  createdAt: string;
  updatedAt: string;
}

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
  selectedQuestions?: GameQuestion[];
  movements?: MoveHistory[];
}

export interface GameQuestion {
  id: string;
  order: number;
  question: QuestionSummary;
}

export interface QuestionSummary {
  id: string;
  title: string;
  text: string;
  optionA: string;
  optionB: string;
  correctOption?: string;
  topic: string;
  region: 'COSTA' | 'SIERRA' | 'AMAZONIA' | 'GALAPAGOS' | 'GENERAL';
  audioTrack: number;
  status?: boolean;
  audioId?: string;
}

export interface MoveHistory {
  id: string;
  turnNumber: number;
  color: PlayerColor;
  diceValue?: number;
  fromTile?: number;
  toTile?: number;
  tileType?: string;
  questionId?: string;
  questionText?: string;
  selectedAnswer?: string;
  isCorrect?: boolean;
  educationalScore: number;
  eventName: string;
  createdAt: string;
}
