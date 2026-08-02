import { ApiOutlined, ArrowRightOutlined, ClockCircleOutlined, PlusOutlined, ReloadOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Row, Space, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AsyncState } from '../components/AsyncState';
import { MetricCard } from '../components/MetricCard';
import { PageTitle } from '../components/PageTitle';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { useRealtime } from '../hooks/useRealtime';
import { useResource } from '../hooks/useResource';
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
  const navigate = useNavigate();
  const { connected, devices } = useRealtime();
  const currentTime = useCurrentTime();
  const { data: summary, loading, refreshing, error, reload } = useResource<DashboardSummary>(
    async () => (await api.get('/dashboard')).data,
    [],
    15000,
  );
  const indicators = summary?.indicators;
  const esp32Connected = devices.some((device) => device.kind === 'ESP32' && device.connected);
  const unoConnected = devices.some((device) => device.kind === 'ARDUINO_UNO' && device.connected);

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle
        title="Centro de control"
        subtitle="Resumen operativo del tablero, las partidas y el contenido educativo."
        extra={<Button icon={<ReloadOutlined />} loading={refreshing} onClick={reload}>Actualizar</Button>}
      />

      <section className="dashboard-status-panel">
        <div className="dashboard-status-copy">
          <span className="section-label">Estado del sistema</span>
          <strong>{connected ? 'Plataforma disponible' : 'Esperando conexión con el servidor'}</strong>
          <p>Última comprobación: {currentTime.toLocaleTimeString('es-EC')}</p>
        </div>
        <div className="dashboard-status-items">
          <span><Badge status={connected ? 'success' : 'error'} />Servidor</span>
          <span><Badge status={esp32Connected ? 'success' : 'error'} />ESP32</span>
          <span><Badge status={unoConnected ? 'success' : 'default'} />Arduino UNO</span>
        </div>
        <div className="dashboard-quick-actions">
          <Button icon={<PlusOutlined />} onClick={() => navigate('/nueva-partida')}>Nueva partida</Button>
          <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate('/monitoreo')}>Abrir monitoreo</Button>
        </div>
      </section>

      <Row gutter={[16, 16]} className="dashboard-primary-metrics">
        <Col xs={24} sm={12} xl={6}><MetricCard loading={loading} title="Partidas jugadas" value={indicators?.games ?? 0} icon={<TrophyOutlined />} /></Col>
        <Col xs={24} sm={12} xl={6}><MetricCard loading={loading} title="Preguntas" value={indicators?.questions ?? 0} /></Col>
        <Col xs={24} sm={12} xl={6}><MetricCard loading={loading} title="Audios MP3" value={indicators?.audios ?? 0} /></Col>
        <Col xs={24} sm={12} xl={6}><MetricCard loading={loading} title="Tiempo promedio" value={Math.round((indicators?.averageDuration ?? 0) / 60)} suffix="min" icon={<ClockCircleOutlined />} /></Col>
      </Row>

      <section className="dashboard-secondary-stats" aria-label="Indicadores educativos">
        <div><span><UserOutlined /> Jugadores registrados</span><strong>{indicators?.historicalPlayers ?? 0}</strong></div>
        <div><span>Preguntas respondidas</span><strong>{indicators?.answeredQuestions ?? 0}</strong></div>
        <div><span>Promedio de aciertos</span><strong>{indicators?.averageCorrectRate ?? 0}%</strong></div>
        <div><span>Ganadores registrados</span><strong>{indicators?.winners ?? 0}</strong></div>
      </section>

      <Card className="data-card" title="Dispositivos registrados" extra={<Tag color={connected ? 'green' : 'red'}>{connected ? 'En línea' : 'Sin conexión'}</Tag>}>
        <AsyncState loading={loading && !summary} error={error} empty={!devices.length} emptyText="Aún no hay dispositivos registrados." onRetry={reload}>
          <Table
            rowKey="kind"
            dataSource={devices}
            pagination={false}
            scroll={{ x: 760 }}
            columns={[
              { title: 'Dispositivo', dataIndex: 'name' },
              { title: 'Tipo', dataIndex: 'kind' },
              { title: 'Estado', render: (_, row) => <Tag color={row.connected ? 'green' : 'red'}>{row.connected ? 'Conectado' : 'Desconectado'}</Tag> },
              { title: 'IP', dataIndex: 'ipAddress', render: (value) => value || 'Sin registrar' },
              { title: 'Última señal', dataIndex: 'lastSeenAt', render: (value) => value ? new Date(value).toLocaleString('es-EC') : 'Sin señal' },
            ]}
          />
        </AsyncState>
      </Card>

      <div className="reliability-note">
        <ApiOutlined />
        <div><strong>Continuidad ante desconexiones</strong><p>El historial se conserva y la sincronización se retoma cuando el ESP32 vuelve a conectarse.</p></div>
      </div>
    </Space>
  );
}
