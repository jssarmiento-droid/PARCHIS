import { CheckCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Descriptions, Modal, Popconfirm, Progress, Row, Space, Table, Tag, Timeline, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { BoardMap } from '../components/BoardMap';
import { PageTitle } from '../components/PageTitle';
import { useRealtime } from '../hooks/useRealtime';
import { socket } from '../services/socket';
import { api } from '../services/api';
import { PlayerColor } from '../types/domain';

const colorLabel: Record<PlayerColor, string> = { BLUE: 'Azul', RED: 'Rojo', GREEN: 'Verde', YELLOW: 'Amarillo' };

export function MonitoringPage() {
  const { activeGame, movements, devices, finalReport, refresh } = useRealtime();
  const [checking, setChecking] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const esp32 = devices.find((device) => device.kind === 'ESP32');
  const uno = devices.find((device) => device.kind === 'ARDUINO_UNO');
  const latest = movements[0] || activeGame?.movements?.[0];
  const selectedQuestion = latest?.questionId
    ? activeGame?.selectedQuestions?.find((item) => item.question.id === latest.questionId)?.question
    : undefined;
  const questionText = latest?.questionText || selectedQuestion?.text;

  useEffect(() => {
    if (!finalReport) return;
    Modal.success({
      title: 'Reporte final generado',
      content: 'La partida finalizó y el resumen quedó guardado en la base de datos.',
    });
  }, [finalReport]);

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
        <Col xs={24} lg={16}>
          <Card className="data-card" title={activeGame?.publicId || 'Sin partida activa'}>
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
          <Card className="data-card" title="Dispositivos">
            <Space direction="vertical" className="full-width">
              <Tag color={esp32?.connected ? 'green' : 'red'}>ESP32: {esp32?.connected ? 'Conectado' : 'Desconectado'}</Tag>
              <Tag color={uno?.connected ? 'green' : 'red'}>Arduino UNO: {uno?.connected ? 'Activo' : 'Sin señal'}</Tag>
              <Button loading={checking} onClick={checkDevice}>Comprobar conexión</Button>
              <Typography.Text type="secondary">El ESP32 consulta la partida activa por HTTP.</Typography.Text>
              <Popconfirm
                title="Finalizar partida"
                description="Se generará el reporte final y no podrá continuar el juego."
                okText="Finalizar"
                cancelText="Cancelar"
                onConfirm={finishGame}
              >
                <Button danger loading={finishing} disabled={!activeGame || finishing}>Finalizar partida</Button>
              </Popconfirm>
            </Space>
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
                <Card size="small">
                  <Typography.Text strong>{colorLabel[player.color]}</Typography.Text>
                  <Typography.Title level={4}>{player.name}</Typography.Title>
                  <Progress percent={Math.round((player.currentTile / 28) * 100)} />
                  <Typography.Text>Puntaje educativo: {player.educationalScore}</Typography.Text>
                  {player.isWinner ? <Tag color="gold" icon={<CheckCircleOutlined />}>Ganador</Tag> : null}
                </Card>
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
