import { Card, Tag, Typography } from 'antd';
import { GamePlayer, MoveHistory, PlayerColor } from '../types/domain';

const tileTypes = ['START', 'FREE', 'INFORMATIVE', 'QUESTION', 'LOSE_TURN', 'REPEAT_TURN', 'GOAL'];
const tileLabels: Record<string, string> = {
  START: 'Salida',
  FREE: 'Libre',
  INFORMATIVE: 'Info',
  QUESTION: 'Pregunta',
  LOSE_TURN: 'Pierde',
  REPEAT_TURN: 'Repite',
  GOAL: 'Meta',
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
          const type = tile === 1 ? 'START' : tile === 28 ? 'GOAL' : tileTypes[index % tileTypes.length];
          const occupants = players.filter((player) => player.currentTile === tile);
          const active = latest?.toTile === tile;

          return (
            <div className={`board-tile ${active ? 'active' : ''}`} key={tile}>
              <Typography.Text strong>{tile}</Typography.Text>
              <Tag color={type === 'QUESTION' ? 'purple' : type === 'GOAL' ? 'gold' : type === 'START' ? 'green' : 'blue'}>
                {tileLabels[type]}
              </Tag>
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
