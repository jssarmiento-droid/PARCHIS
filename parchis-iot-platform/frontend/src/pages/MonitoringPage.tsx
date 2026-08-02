import { CheckCircleOutlined } from '@ant-design/icons';
import { Alert, App as AntdApp, Button, Card, Col, Descriptions, Popconfirm, Progress, Row, Space, Table, Tag, Timeline, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { BoardMap } from '../components/BoardMap';
import { PageTitle } from '../components/PageTitle';
import { useRealtime } from '../hooks/useRealtime';
import { socket } from '../services/socket';
import { api } from '../services/api';
import { PlayerColor } from '../types/domain';

const colorLabel: Record<PlayerColor, string> = { BLUE: 'Azul', RED: 'Rojo', GREEN: 'Verde', YELLOW: 'Amarillo' };

export function MonitoringPage() {
  const { message, modal } = AntdApp.useApp();
  const { connected, activeGame, movements, devices, finalReport, refresh } = useRealtime();
  const [checking, setChecking] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const esp32 = devices.find((device) => device.kind === 'ESP32');
  const uno = devices.find((device) => device.kind === 'ARDUINO_UNO');
  const latest = movements[0] || activeGame?.movements?.[0];
  const selectedQuestion = latest?.questionId
    ? activeGame?.selectedQuestions?.find((item) => item.question.id === latest.questionId)?.question
    : undefined;
  const questionText = latest?.questionText || selectedQuestion?.text;
  const dfPlayerValue = esp32?.health?.dfPlayer;
  const sensorsValue = esp32?.health?.sensors;
  const wifiRssi = typeof esp32?.health?.wifiRssi === 'number' ? esp32.health.wifiRssi : null;
  const audioReady = dfPlayerValue === true || String(dfPlayerValue || '').toLowerCase() === 'ok';
  const sensorsReady = sensorsValue === true || String(sensorsValue || '').toLowerCase() === 'ok';

  useEffect(() => {
    if (!finalReport) return;
    modal.success({
      title: 'Reporte final generado',
      content: 'La partida finalizó y el resumen quedó guardado en la base de datos.',
    });
  }, [finalReport, modal]);

  async function checkDevice() {
    setChecking(true);
    try {
      await api.get('/devices/status');
      await refresh();
      message.success('Estado del circuito actualizado');
    } catch {
      message.error('No se pudo consultar el estado del circuito');
    } finally {
      setChecking(false);
    }
  }

  async function finishGame() {
    if (!activeGame) return;
    setFinishing(true);
    try {
      await new Promise<void>((resolve, reject) => {
        socket.timeout(7000).emit('web:finish-game', { gameId: activeGame.id }, (error: Error | null) => {
          if (error) reject(error);
          else resolve();
        });
      });
      message.success('La partida fue finalizada y el reporte quedó guardado');
    } catch {
      message.error('No se pudo finalizar la partida. Comprueba la conexión con el servidor.');
    } finally {
      setFinishing(false);
    }
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Monitoreo en tiempo real" subtitle="Eventos del ESP32, panel de botones, turnos y movimiento educativo." />
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card className="data-card game-state-card" title={activeGame?.publicId || 'Sin partida activa'} extra={<Tag color={activeGame ? 'green' : 'default'}>{activeGame ? 'Partida preparada' : 'Esperando'}</Tag>}>
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
        <Col xs={24} xl={8}>
          <Card className="data-card device-status-card" title="Estado del circuito">
            <div className="device-status-list">
              <div><span><i className={`status-dot ${connected ? 'is-green' : 'is-red'}`} />Servidor</span><strong>{connected ? 'Conectado' : 'Desconectado'}</strong></div>
              <div><span><i className={`status-dot ${esp32?.connected ? 'is-green' : 'is-red'}`} />ESP32</span><strong>{esp32?.connected ? 'Conectado' : 'Desconectado'}</strong></div>
              <div><span><i className={`status-dot ${uno?.connected ? 'is-green' : 'is-muted'}`} />Arduino UNO</span><strong>{uno?.connected ? 'Conectado' : 'Sin señal'}</strong></div>
              <div><span><i className={`status-dot ${audioReady ? 'is-green' : 'is-muted'}`} />DFPlayer</span><strong>{audioReady ? 'Disponible' : 'Sin telemetría'}</strong></div>
              <div><span><i className={`status-dot ${sensorsReady ? 'is-green' : 'is-muted'}`} />Sensores</span><strong>{sensorsReady ? '28 / 28' : 'Esperando lectura'}</strong></div>
              <div><span><i className={`status-dot ${wifiRssi !== null ? 'is-green' : 'is-muted'}`} />WiFi</span><strong>{wifiRssi !== null ? `${wifiRssi} dBm` : 'Sin datos'}</strong></div>
            </div>
            <div className="device-status-actions">
              <Button loading={checking} onClick={checkDevice}>Comprobar conexión</Button>
              <Popconfirm
                title="Finalizar partida"
                description="Se generará el reporte final y no podrá continuar el juego."
                okText="Finalizar"
                cancelText="Cancelar"
                onConfirm={finishGame}
              >
                <Button danger loading={finishing} disabled={!activeGame || finishing}>Finalizar partida</Button>
              </Popconfirm>
            </div>
          </Card>
        </Col>
        <Col xs={24}>
          <Card className="data-card current-question-card" title="Pregunta actual">
            {questionText ? (
              <Space direction="vertical" size="middle" className="full-width">
                <Typography.Title level={4} className="question-title">{questionText}</Typography.Title>
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={12}><Alert message={`Opción A: ${selectedQuestion?.optionA || '-'}`} type="info" showIcon /></Col>
                  <Col xs={24} md={12}><Alert message={`Opción B: ${selectedQuestion?.optionB || '-'}`} type="info" showIcon /></Col>
                </Row>
                <Typography.Text type="secondary">
                  {latest?.selectedAnswer ? `Respuesta seleccionada: ${latest.selectedAnswer}` : 'Esperando respuesta del panel físico.'}
                </Typography.Text>
              </Space>
            ) : (
              <div className="empty-state">El circuito todavía no ha enviado una pregunta.</div>
            )}
          </Card>
        </Col>
      </Row>

      <Card className="data-card" title="Jugadores">
        {activeGame?.players?.length ? (
          <Row gutter={[16, 16]}>
            {activeGame.players.map((player) => (
              <Col xs={24} md={12} xl={6} key={player.id}>
                <div className={`player-status-item player-${player.color.toLowerCase()}`}>
                  <span className="player-status-color">{colorLabel[player.color]}</span>
                  <Typography.Title level={4}>{player.name}</Typography.Title>
                  <Progress percent={Math.round((player.currentTile / 28) * 100)} />
                  <Typography.Text>Puntaje educativo: {player.educationalScore}</Typography.Text>
                  {player.isWinner ? <Tag color="gold" icon={<CheckCircleOutlined />}>Ganador</Tag> : null}
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="empty-state">No hay jugadores cargados para una partida activa.</div>
        )}
      </Card>

      <BoardMap players={activeGame?.players} latest={latest} />

      <Card className="data-card" title="Historial de movimientos">
        <Table
          rowKey="id"
          dataSource={movements}
          locale={{ emptyText: 'Esperando eventos del ESP32' }}
          scroll={{ x: 820 }}
          columns={[
            { title: 'Turno', dataIndex: 'turnNumber' },
            { title: 'Jugador', dataIndex: 'color', render: (value) => colorLabel[value as PlayerColor] },
            { title: 'Dado', dataIndex: 'diceValue' },
            { title: 'Casilla', dataIndex: 'toTile' },
            { title: 'Resultado', dataIndex: 'isCorrect', render: (value) => value === undefined ? '-' : value ? <Tag color="green">Correcta</Tag> : <Tag color="red">Incorrecta</Tag> },
            { title: 'Hora', dataIndex: 'createdAt', render: (value) => value ? new Date(value).toLocaleTimeString('es-EC') : '-' },
          ]}
        />
      </Card>

      <Card className="data-card" title="Línea de eventos">
        <Timeline items={movements.slice(0, 8).map((item) => ({ children: `Turno ${item.turnNumber} - ${colorLabel[item.color]} - Dado ${item.diceValue ?? '-'}` }))} />
      </Card>
    </Space>
  );
}
