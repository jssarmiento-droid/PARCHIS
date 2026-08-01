import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Space, Table, Tag } from 'antd';
import { AsyncState } from '../components/AsyncState';
import { PageTitle } from '../components/PageTitle';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { GameSession, PlayerColor } from '../types/domain';

const colorLabel: Record<PlayerColor, string> = { BLUE: 'Azul', RED: 'Rojo', GREEN: 'Verde', YELLOW: 'Amarillo' };

export function GameHistoryPage() {
  const { data, loading, refreshing, error, reload } = useResource<GameSession[]>(
    async () => (await api.get('/games')).data,
    [],
    30000,
  );
  const games = data || [];

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle
        title="Historial de partidas"
        subtitle="Registro completo asociado al identificador único de cada sesión."
        extra={<Button icon={<ReloadOutlined />} loading={refreshing} onClick={reload}>Actualizar</Button>}
      />
      <Card className="data-card">
        <AsyncState loading={loading} error={error} empty={games.length === 0} emptyText="Todavía no hay partidas registradas." onRetry={reload}>
          <Table
            rowKey="id"
            dataSource={games}
            loading={refreshing}
            scroll={{ x: 860 }}
            columns={[
              { title: 'ID', dataIndex: 'publicId' },
              { title: 'Estado', dataIndex: 'status', render: (value) => <Tag color={value === 'FINISHED' ? 'green' : 'blue'}>{value}</Tag> },
              { title: 'Duración', dataIndex: 'durationSeconds', render: (value) => `${Math.round(value / 60)} min` },
              { title: 'Ganador', dataIndex: 'winnerColor', render: (value: PlayerColor | undefined) => value ? colorLabel[value] : '-' },
              { title: 'Jugadores', dataIndex: 'players', render: (players) => players?.map((player: { name: string }) => player.name).join(', ') || '-' },
            ]}
          />
        </AsyncState>
      </Card>
    </Space>
  );
}
