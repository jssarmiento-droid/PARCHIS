import { ApiOutlined, BugOutlined, ThunderboltOutlined, WifiOutlined } from '@ant-design/icons';
import { App as AntdApp, Button, Card, Col, List, Row, Space, Statistic, Switch, Tag } from 'antd';
import { useState } from 'react';
import { PageTitle } from '../components/PageTitle';
import { useRealtime } from '../hooks/useRealtime';
import { socket } from '../services/socket';
import { PlayerColor } from '../types/domain';

const colorLabel: Record<PlayerColor, string> = {
  BLUE: 'Azul',
  RED: 'Rojo',
  GREEN: 'Verde',
  YELLOW: 'Amarillo',
};

export function DiagnosticsPage() {
  const { message } = AntdApp.useApp();
  const { connected, devices, technicalEvents, movements, activeGame } = useRealtime();
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const esp32 = devices.find((device) => device.kind === 'ESP32');
  const sensorBridge = devices.find((device) => device.kind === 'ESP32_SENSORS');
  const pendingEvents = Number(esp32?.health?.pendingEvents || 0);
  const droppedEvents = Number(esp32?.health?.droppedEvents || 0);
  const activePlayers = activeGame?.players || [];

  function nextSimulatedPlayer() {
    if (!activePlayers.length) return undefined;
    const lastColor = movements[0]?.color;
    const lastIndex = activePlayers.findIndex((player) => player.color === lastColor);
    return activePlayers[(lastIndex + 1 + activePlayers.length) % activePlayers.length];
  }

  function simulateDice() {
    const player = nextSimulatedPlayer();
    if (!activeGame || !player) {
      message.warning('Primero prepara una partida para simular eventos por jugador.');
      return;
    }

    const diceValue = Math.floor(Math.random() * 6) + 1;
    socket.emit('esp32:game-event', {
      eventName: 'dice',
      gameId: activeGame.id,
      eventId: `sim-dice-${Date.now()}`,
      color: player.color,
      diceValue,
      turnNumber: (movements[0]?.turnNumber || 0) + 1,
      currentTile: player.currentTile,
      fromTile: player.currentTile,
      toTile: player.currentTile,
    });
    message.success(`Dado simulado para ${colorLabel[player.color]}: ${diceValue}`);
  }

  function simulateQuestion(isCorrect: boolean) {
    const player = nextSimulatedPlayer();
    if (!activeGame || !player) {
      message.warning('Primero prepara una partida para simular respuestas por jugador.');
      return;
    }

    const selectedQuestion = activeGame.selectedQuestions?.[0]?.question;
    socket.emit('esp32:game-event', {
      eventName: 'answer',
      gameId: activeGame.id,
      eventId: `sim-answer-${Date.now()}`,
      color: player.color,
      diceValue: movements[0]?.diceValue || 1,
      turnNumber: (movements[0]?.turnNumber || 0) + 1,
      currentTile: player.currentTile,
      tileType: 'QUESTION',
      questionId: selectedQuestion?.id,
      questionText: selectedQuestion?.text || 'Pregunta sin seleccion',
      selectedAnswer: isCorrect ? 'A' : 'B',
      isCorrect,
      educationalScore: player.educationalScore + (isCorrect ? 1 : 0),
    });
    message.success(`${colorLabel[player.color]}: ${isCorrect ? 'respuesta correcta' : 'respuesta incorrecta'} simulada`);
  }

  function simulateButton(button: string) {
    socket.emit('nano:button-state', { button, pressed: true, gameId: activeGame?.id });
    message.success(`Boton ${button} simulado`);
  }

  function simulateStatus() {
    socket.emit('esp32:system-status', {
      wifiRssi: -52,
      sensors: 'ok',
      dfPlayer: 'ok',
      uptimeMs: Date.now(),
    });
    message.success('Estado del ESP32 simulado');
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Diagnostico y modo de prueba" subtitle="Herramientas para validar eventos controlados cuando el circuito fisico no esta conectado." />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}><Card className="metric-card"><Statistic title="Servidor" value={connected ? 'Conectado' : 'Sin conexion'} prefix={<WifiOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card className="metric-card"><Statistic title="ESP32" value={esp32?.connected ? 'Conectado' : 'Desconectado'} prefix={<ApiOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card className="metric-card"><Statistic title="ESP32 sensores" value={sensorBridge?.connected ? 'Activo' : 'Sin senal'} prefix={<ThunderboltOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card className="metric-card"><Statistic title="Movimientos" value={movements.length} prefix={<BugOutlined />} /></Card></Col>
      </Row>

      <Card className="data-card" title="Sincronizacion del ESP32">
        <Space wrap>
          <Tag color={pendingEvents > 0 ? 'gold' : 'green'}>Eventos pendientes: {pendingEvents}</Tag>
          <Tag color={droppedEvents > 0 ? 'red' : 'green'}>Eventos descartados: {droppedEvents}</Tag>
          {droppedEvents > 0 ? <span>Revisa la red: se agoto la cola temporal del ESP32.</span> : null}
        </Space>
      </Card>

      <Card
        className="action-card"
        title="Prueba controlada de eventos"
        extra={(
          <Switch
            checked={simulationEnabled}
            checkedChildren="Activo"
            unCheckedChildren="Bloqueado"
            onChange={(enabled) => {
              setSimulationEnabled(enabled);
              if (enabled) message.warning('Modo de prueba activo. No lo uses durante una partida fisica.');
            }}
          />
        )}
      >
        <Space wrap className="mobile-stack">
          <Button type="primary" disabled={!simulationEnabled} onClick={simulateStatus}>Simular estado ESP32</Button>
          <Button disabled={!simulationEnabled} onClick={simulateDice}>Simular dado</Button>
          <Button disabled={!simulationEnabled} onClick={() => simulateQuestion(true)}>Simular respuesta correcta</Button>
          <Button disabled={!simulationEnabled} onClick={() => simulateQuestion(false)}>Simular respuesta incorrecta</Button>
          <Button danger disabled={!simulationEnabled} onClick={() => socket.emit('test:device-disconnect', { kind: 'ESP32' })}>Simular desconexion ESP32</Button>
          {['POWER', 'DICE', 'A', 'B', 'REPEAT_AUDIO', 'CONFIRM'].map((button) => (
            <Button key={button} disabled={!simulationEnabled} onClick={() => simulateButton(button)}>Boton {button}</Button>
          ))}
        </Space>
      </Card>

      <Card className="data-card" title="Eventos tecnicos recientes" extra={<Tag color="blue">WebSocket</Tag>}>
        <List
          dataSource={technicalEvents}
          locale={{ emptyText: 'Sin eventos tecnicos registrados' }}
          renderItem={(event) => <List.Item>{event}</List.Item>}
        />
      </Card>
    </Space>
  );
}
