import { ApiOutlined, ClockCircleOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Row, Space, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { PageTitle } from '../components/PageTitle';
import { useRealtime } from '../hooks/useRealtime';
import { api } from '../services/api';

interface DashboardSummary {
  currentTime: string;
  indicators: {
    games: number;
    questions: number;
    audios: number;
    averageDuration: number;
    historicalPlayers: number;
    answeredQuestions: number;
    averageCorrectRate: number;
    winners: number;
  };
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const { devices } = useRealtime();

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setSummary(data)).catch(() => undefined);
  }, []);

  const indicators = summary?.indicators;

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Centro de control" subtitle="Supervisión general del tablero, dispositivos y desempeño educativo." />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8} xl={6}><MetricCard title="Partidas jugadas" value={indicators?.games ?? 0} icon={<TrophyOutlined />} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard title="Preguntas" value={indicators?.questions ?? 0} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard title="Audios MP3" value={indicators?.audios ?? 0} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard title="Tiempo promedio" value={Math.round((indicators?.averageDuration ?? 0) / 60)} suffix="min" icon={<ClockCircleOutlined />} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard title="Jugadores historial" value={indicators?.historicalPlayers ?? 0} icon={<UserOutlined />} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard title="Preguntas respondidas" value={indicators?.answeredQuestions ?? 0} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard title="Promedio correctas" value={indicators?.averageCorrectRate ?? 0} suffix="%" /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard title="Ganadores registrados" value={indicators?.winners ?? 0} /></Col>
      </Row>

      <Card title="Estado del sistema" extra={<Tag color="blue">{new Date().toLocaleTimeString()}</Tag>}>
        <Table
          rowKey="kind"
          dataSource={devices}
          pagination={false}
          columns={[
            { title: 'Dispositivo', dataIndex: 'name' },
            { title: 'Tipo', dataIndex: 'kind' },
            { title: 'Estado', render: (_, row) => <Tag color={row.connected ? 'green' : 'red'}>{row.connected ? 'Conectado' : 'Dispositivo desconectado'}</Tag> },
            { title: 'IP', dataIndex: 'ipAddress', render: (value) => value || 'Sin registrar' },
            { title: 'Última señal', dataIndex: 'lastSeenAt', render: (value) => value ? new Date(value).toLocaleString() : 'Sin señal' },
          ]}
        />
      </Card>

      <Card className="iot-panel">
        <ApiOutlined />
        <div>
          <Typography.Title level={4}>Tolerancia a desconexión</Typography.Title>
          <Typography.Paragraph>
            Si el ESP32 se desconecta, el sistema mantiene el historial local de la partida y vuelve a sincronizar los eventos cuando el dispositivo reconecta.
          </Typography.Paragraph>
        </div>
      </Card>
    </Space>
  );
}
