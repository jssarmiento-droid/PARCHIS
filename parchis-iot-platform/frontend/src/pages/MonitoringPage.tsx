import { Button, Card, Col, Descriptions, Modal, Progress, Row, Space, Table, Tag, Timeline, Typography } from 'antd';
import { useEffect } from 'react';
import { BoardMap } from '../components/BoardMap';
import { PageTitle } from '../components/PageTitle';
import { useRealtime } from '../hooks/useRealtime';
import { socket } from '../services/socket';

const colorLabel = { BLUE: 'Azul', RED: 'Rojo', GREEN: 'Verde', YELLOW: 'Amarillo' };

export function MonitoringPage() {
  const { activeGame, movements, devices, finalReport } = useRealtime();
  const esp32 = devices.find((device) => device.kind === 'ESP32');
  const nano = devices.find((device) => device.kind === 'ARDUINO_NANO');
  const latest = movements[0] || activeGame?.movements?.[0];

  useEffect(() => {
    if (!finalReport) return;
    Modal.success({
      title: 'Reporte final generado',
      content: 'La partida finalizó y el resumen quedó guardado en la base de datos.',
    });
  }, [finalReport]);

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Monitoreo en tiempo real" subtitle="Eventos del ESP32, panel de botones, turnos y movimiento educativo." />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={activeGame?.publicId || 'Sin partida activa'}>
            <Descriptions bordered column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="Estado">{activeGame?.status || 'Sin iniciar'}</Descriptions.Item>
              <Descriptions.Item label="Jugador activo">{latest?.color ? colorLabel[latest.color] : 'Esperando evento'}</Descriptions.Item>
              <Descriptions.Item label="Dado">{latest?.diceValue ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Casilla actual">{latest?.toTile ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Tipo de casilla">{latest?.tileType ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="Respuesta">{latest?.isCorrect === undefined ? '-' : latest.isCorrect ? 'Correcta' : 'Incorrecta'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Dispositivos">
            <Space direction="vertical" className="full-width">
              <Tag color={esp32?.connected ? 'green' : 'red'}>ESP32: {esp32?.connected ? 'Conectado' : 'Desconectado'}</Tag>
              <Tag color={nano?.connected ? 'green' : 'red'}>Arduino Nano: {nano?.connected ? 'Activo' : 'Sin señal'}</Tag>
              <Button onClick={() => socket.emit('web:sync-config', { requestedAt: new Date().toISOString() })}>Sincronizar configuración</Button>
              <Button danger onClick={() => socket.emit('web:finish-game', { gameId: activeGame?.id })} disabled={!activeGame}>Finalizar partida</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Jugadores">
        <Row gutter={[16, 16]}>
          {(activeGame?.players || []).map((player) => (
            <Col xs={24} md={12} xl={6} key={player.id}>
              <Card size="small">
                <Typography.Text strong>{colorLabel[player.color]}</Typography.Text>
                <Typography.Title level={4}>{player.name}</Typography.Title>
                <Progress percent={Math.round((player.currentTile / 28) * 100)} />
                <Typography.Text>Puntaje educativo: {player.educationalScore}</Typography.Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <BoardMap players={activeGame?.players} latest={latest} />

      <Card title="Historial de movimientos">
        <Table
          rowKey="id"
          dataSource={movements}
          columns={[
            { title: 'Turno', dataIndex: 'turnNumber' },
            { title: 'Jugador', dataIndex: 'color', render: (value) => colorLabel[value as keyof typeof colorLabel] },
            { title: 'Dado', dataIndex: 'diceValue' },
            { title: 'Casilla', dataIndex: 'toTile' },
            { title: 'Resultado', dataIndex: 'isCorrect', render: (value) => value === undefined ? '-' : value ? <Tag color="green">Correcta</Tag> : <Tag color="red">Incorrecta</Tag> },
            { title: 'Hora', dataIndex: 'createdAt', render: (value) => value ? new Date(value).toLocaleTimeString() : '-' },
          ]}
        />
      </Card>

      <Card title="Línea de eventos">
        <Timeline items={movements.slice(0, 8).map((item) => ({ children: `Turno ${item.turnNumber} - ${colorLabel[item.color]} - Dado ${item.diceValue ?? '-'}` }))} />
      </Card>
    </Space>
  );
}
