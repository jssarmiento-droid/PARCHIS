import { Card } from 'antd';
import { GamePlayer, MoveHistory } from '../types/domain';
import { OfficialBoard } from './OfficialBoard';

export function BoardMap({ players = [], latest }: { players?: GamePlayer[]; latest?: MoveHistory }) {
  return (
    <Card title="Tablero de la partida" className="board-card">
      <div className="board-monitor-layout">
        <OfficialBoard
          activeTile={latest?.toTile}
          pieces={players.map((player) => ({
            color: player.color,
            tile: player.currentTile,
            label: player.name,
          }))}
        />
        <div className="board-legend" aria-label="Leyenda del tablero">
          <div><span className="legend-swatch swatch-common" /><strong>Recorrido común</strong><small>Casillas 1 a 20</small></div>
          <div><span className="legend-swatch swatch-entry" /><strong>Entradas</strong><small>Casillas 21 a 24</small></div>
          <div><span className="legend-swatch swatch-goal" /><strong>Metas</strong><small>Casillas 25 a 28</small></div>
          <p>La casilla resaltada corresponde al último movimiento recibido desde el circuito.</p>
        </div>
      </div>
    </Card>
  );
}
