import { Card, Space, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { PageTitle } from '../components/PageTitle';
import { api } from '../services/api';
import { GameSession } from '../types/domain';

export function GameHistoryPage() {
  const [games, setGames] = useState<GameSession[]>([]);

  useEffect(() => {
    api.get('/games').then(({ data }) => setGames(data)).catch(() => undefined);
  }, []);

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Historial de partidas" subtitle="Registro completo asociado al identificador único de cada sesión." />
      <Card>
        <Table rowKey="id" dataSource={games} columns={[
          { title: 'ID', dataIndex: 'publicId' },
          { title: 'Estado', dataIndex: 'status', render: (value) => <Tag color={value === 'FINISHED' ? 'green' : 'blue'}>{value}</Tag> },
          { title: 'Duración', dataIndex: 'durationSeconds', render: (value) => `${Math.round(value / 60)} min` },
          { title: 'Ganador', dataIndex: 'winnerColor', render: (value) => value || '-' },
          { title: 'Jugadores', dataIndex: 'players', render: (players) => players?.map((p: { name: string }) => p.name).join(', ') },
        ]} />
      </Card>
    </Space>
  );
}
