import { PlayerColor } from '../types/domain';

interface BoardPiece {
  color: PlayerColor;
  tile: number;
  label: string;
}

interface OfficialBoardProps {
  activeTile?: number;
  pieces?: BoardPiece[];
  compact?: boolean;
}

const tilePosition: Record<number, string> = {
  1: '1 / 1', 2: '1 / 2', 3: '1 / 3', 4: '1 / 4', 5: '1 / 5', 6: '1 / 6',
  7: '2 / 6', 8: '3 / 6', 9: '4 / 6', 10: '5 / 6',
  11: '6 / 6', 12: '6 / 5', 13: '6 / 4', 14: '6 / 3', 15: '6 / 2', 16: '6 / 1',
  17: '5 / 1', 18: '4 / 1', 19: '3 / 1', 20: '2 / 1',
  21: '2 / 3', 22: '3 / 5', 23: '5 / 4', 24: '4 / 2',
  25: '3 / 3', 26: '3 / 4', 27: '4 / 4', 28: '4 / 3',
};

const tileType = [
  'info', 'free', 'question', 'start-blue', 'info', 'free', 'question', 'free', 'start-red', 'free',
  'question', 'free', 'info', 'start-green', 'question', 'free', 'info', 'question', 'start-yellow', 'info',
  'entry-blue', 'entry-red', 'entry-green', 'entry-yellow', 'goal-blue', 'goal-red', 'goal-green', 'goal-yellow',
];

const tileMarker: Record<string, string> = {
  info: 'i',
  question: '?',
  'start-blue': 'S',
  'start-red': 'S',
  'start-green': 'S',
  'start-yellow': 'S',
  'entry-blue': '>',
  'entry-red': '>',
  'entry-green': '>',
  'entry-yellow': '>',
  'goal-blue': '●',
  'goal-red': '●',
  'goal-green': '●',
  'goal-yellow': '●',
};

const routeColor: Record<number, string> = {
  3: 'blue',
  8: 'red',
  13: 'green',
  18: 'yellow',
};

const colorName: Record<PlayerColor, string> = {
  BLUE: 'Azul',
  RED: 'Rojo',
  GREEN: 'Verde',
  YELLOW: 'Amarillo',
};

export function OfficialBoard({ activeTile, pieces = [], compact = false }: OfficialBoardProps) {
  return (
    <div className={compact ? 'official-board is-compact' : 'official-board'} role="img" aria-label="Tablero oficial de Parchis Inclusivo con 28 casillas">
      <div className="official-board-grid">
        <span className="official-board-center" aria-hidden="true">
          <i className="center-quadrant center-blue" />
          <i className="center-quadrant center-red" />
          <i className="center-quadrant center-yellow" />
          <i className="center-quadrant center-green" />
          <b>PI</b>
        </span>
        {Array.from({ length: 28 }, (_, index) => {
          const tile = index + 1;
          const type = tileType[index];
          const occupants = pieces.filter((piece) => piece.tile === tile);
          return (
            <div
              className={`official-board-tile tile-${type} ${routeColor[tile] ? `route-${routeColor[tile]}` : ''} ${activeTile === tile ? 'is-active' : ''}`}
              style={{ gridArea: tilePosition[tile] }}
              aria-label={`Casilla ${tile}`}
              key={tile}
            >
              <span className="official-board-number">{tile}</span>
              {tileMarker[type] ? <span className="official-board-marker" aria-hidden="true">{tileMarker[type]}</span> : null}
              {occupants.length ? (
                <span className="official-board-pieces">
                  {occupants.map((piece) => (
                    <i
                      className={`board-piece piece-${piece.color.toLowerCase()}`}
                      title={`${piece.label}, ${colorName[piece.color]}`}
                      key={`${piece.color}-${piece.label}`}
                    />
                  ))}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
