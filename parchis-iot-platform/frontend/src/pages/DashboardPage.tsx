import { ApiOutlined, ClockCircleOutlined, ReloadOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Table, Tag, Typography } from 'antd';
import { AsyncState } from '../components/AsyncState';
import { MetricCard } from '../components/MetricCard';
import { PageTitle } from '../components/PageTitle';
import { useRealtime } from '../hooks/useRealtime';
import { useResource } from '../hooks/useResource';
import { useCurrentTime } from '../hooks/useCurrentTime';
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
  const { devices } = useRealtime();
  const currentTime = useCurrentTime();
  const { data: summary, loading, refreshing, error, reload } = useResource<DashboardSummary>(
    async () => (await api.get('/dashboard')).data,
    [],
    15000,
  );
  const indicators = summary?.indicators;

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle
        title="Centro de control"
        subtitle="Supervisión general del tablero, dispositivos y desempeño educativo."
        extra={
          <Button icon={<ReloadOutlined />} loading={refreshing} onClick={reload}>
            Actualizar
          </Button>
        }
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8} xl={6}><MetricCard loading={loading} title="Partidas jugadas" value={indicators?.games ?? 0} icon={<TrophyOutlined />} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard loading={loading} title="Preguntas" value={indicators?.questions ?? 0} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard loading={loading} title="Audios MP3" value={indicators?.audios ?? 0} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard loading={loading} title="Tiempo promedio" value={Math.round((indicators?.averageDuration ?? 0) / 60)} suffix="min" icon={<ClockCircleOutlined />} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard loading={loading} title="Jugadores historial" value={indicators?.historicalPlayers ?? 0} icon={<UserOutlined />} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard loading={loading} title="Preguntas respondidas" value={indicators?.answeredQuestions ?? 0} /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard loading={loading} title="Promedio correctas" value={indicators?.averageCorrectRate ?? 0} suffix="%" /></Col>
        <Col xs={24} md={8} xl={6}><MetricCard loading={loading} title="Ganadores registrados" value={indicators?.winners ?? 0} /></Col>
      </Row>

      <Card className="data-card" title="Estado del sistema" extra={<Tag color="green">{currentTime.toLocaleTimeString('es-EC')}</Tag>}>
        <AsyncState loading={loading && !summary} error={error} empty={!devices.length} emptyText="Aún no hay dispositivos registrados." onRetry={reload}>
          <Table
            rowKey="kind"
            dataSource={devices}
            pagination={false}
            scroll={{ x: 760 }}
            columns={[
              { title: 'Dispositivo', dataIndex: 'name' },
              { title: 'Tipo', dataIndex: 'kind' },
              { title: 'Estado', render: (_, row) => <Tag color={row.connected ? 'green' : 'red'}>{row.connected ? 'Conectado' : 'Dispositivo desconectado'}</Tag> },
              { title: 'IP', dataIndex: 'ipAddress', render: (value) => value || 'Sin registrar' },
              { title: 'Última señal', dataIndex: 'lastSeenAt', render: (value) => value ? new Date(value).toLocaleString('es-EC') : 'Sin señal' },
            ]}
          />
        </AsyncState>
      </Card>

      <Card className="iot-panel">
        <ApiOutlined />
        <div>
          <Typography.Title level={4}>Tolerancia a desconexión</Typography.Title>
          <Typography.Paragraph>
            Si el ESP32 se desconecta, el sistema mantiene el historial de la partida y retoma la sincronización cuando el dispositivo vuelve a conectarse.
          </Typography.Paragraph>
        </div>
      </Card>
    </Space>
  );
}
