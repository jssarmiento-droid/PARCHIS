import { Card, Tag, Typography } from 'antd';
import { GamePlayer, MoveHistory, PlayerColor } from '../types/domain';

const tileLabels: Record<string, string> = {
  START: 'Salida',
  FREE: 'Libre',
  INFORMATIVE: 'Info',
  QUESTION: 'Pregunta',
  ENTRY: 'Entrada a meta',
  LOSE_TURN: 'Pierde',
  REPEAT_TURN: 'Repite',
  GOAL: 'Meta',
};
const officialTiles = [
  'INFORMATIVE', 'FREE', 'QUESTION', 'START', 'INFORMATIVE', 'FREE', 'QUESTION', 'FREE', 'START', 'FREE',
  'QUESTION', 'FREE', 'INFORMATIVE', 'START', 'QUESTION', 'FREE', 'INFORMATIVE', 'QUESTION', 'START', 'INFORMATIVE',
  'ENTRY', 'ENTRY', 'ENTRY', 'ENTRY', 'GOAL', 'GOAL', 'GOAL', 'GOAL',
];
const exclusiveColor: Record<number, PlayerColor> = {
  21: 'BLUE', 22: 'RED', 23: 'GREEN', 24: 'YELLOW',
  25: 'BLUE', 26: 'RED', 27: 'GREEN', 28: 'YELLOW',
};
const playerClass: Record<PlayerColor, string> = {
  BLUE: 'player-blue',
  RED: 'player-red',
  GREEN: 'player-green',
  YELLOW: 'player-yellow',
};

export function BoardMap({ players = [], latest }: { players?: GamePlayer[]; latest?: MoveHistory }) {
  return (
    <Card title="Tablero de 28 casillas" className="board-card">
      <div className="board-map">
        {Array.from({ length: 28 }, (_, index) => {
          const tile = index + 1;
          const type = officialTiles[index];
          const occupants = players.filter((player) => player.currentTile === tile);
          const active = latest?.toTile === tile;

          return (
            <div className={`board-tile ${active ? 'active' : ''}`} key={tile}>
              <Typography.Text strong>{tile}</Typography.Text>
              <Tag color={type === 'QUESTION' ? 'purple' : type === 'GOAL' ? 'gold' : type === 'START' ? 'green' : type === 'ENTRY' ? 'orange' : 'blue'}>
                {tileLabels[type]}
              </Tag>
              {exclusiveColor[tile] ? <Typography.Text type="secondary">{exclusiveColor[tile] === 'BLUE' ? 'Azul' : exclusiveColor[tile] === 'RED' ? 'Rojo' : exclusiveColor[tile] === 'GREEN' ? 'Verde' : 'Amarillo'}</Typography.Text> : null}
              <div className="player-dots">
                {occupants.map((player) => (
                  <span className={`player-dot ${playerClass[player.color]}`} title={player.name} key={player.id} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
