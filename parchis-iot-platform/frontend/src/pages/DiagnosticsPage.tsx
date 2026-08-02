import { ApiOutlined, BugOutlined, ThunderboltOutlined, WifiOutlined } from '@ant-design/icons';
import { App as AntdApp, Button, Card, Col, List, Row, Space, Statistic, Switch, Tag } from 'antd';
import { useState } from 'react';
import { PageTitle } from '../components/PageTitle';
import { useRealtime } from '../hooks/useRealtime';
import { socket } from '../services/socket';

export function DiagnosticsPage() {
  const { message } = AntdApp.useApp();
  const { connected, devices, technicalEvents, movements, activeGame } = useRealtime();
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const esp32 = devices.find((device) => device.kind === 'ESP32');
  const uno = devices.find((device) => device.kind === 'ARDUINO_UNO');
  const pendingEvents = Number(esp32?.health?.pendingEvents || 0);
  const droppedEvents = Number(esp32?.health?.droppedEvents || 0);

  function simulateDice() {
    socket.emit('esp32:game-event', {
      eventName: 'dice',
      color: 'BLUE',
      diceValue: Math.floor(Math.random() * 6) + 1,
      turnNumber: (movements[0]?.turnNumber || 0) + 1,
      currentTile: movements[0]?.toTile || 1,
    });
    message.success('Evento de dado simulado');
  }

  function simulateQuestion(isCorrect: boolean) {
    socket.emit('esp32:game-event', {
      eventName: 'answer',
      color: 'BLUE',
      diceValue: movements[0]?.diceValue || 1,
      turnNumber: (movements[0]?.turnNumber || 0) + 1,
      currentTile: movements[0]?.toTile || 1,
      tileType: 'QUESTION',
      questionText: 'Pregunta de demostración',
      selectedAnswer: isCorrect ? 'A' : 'B',
      isCorrect,
    });
    message.success(isCorrect ? 'Respuesta correcta simulada' : 'Respuesta incorrecta simulada');
  }

  function simulateButton(button: string) {
    socket.emit('nano:button-state', { button, pressed: true, gameId: activeGame?.id });
    message.success(`Botón ${button} simulado`);
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
      <PageTitle title="Diagnóstico y modo demo" subtitle="Herramientas para validar la defensa incluso si el circuito físico no está conectado." />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}><Card className="metric-card"><Statistic title="Servidor" value={connected ? 'Conectado' : 'Sin conexión'} prefix={<WifiOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card className="metric-card"><Statistic title="ESP32" value={esp32?.connected ? 'Conectado' : 'Desconectado'} prefix={<ApiOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card className="metric-card"><Statistic title="Arduino UNO" value={uno?.connected ? 'Activo' : 'Sin señal'} prefix={<ThunderboltOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card className="metric-card"><Statistic title="Movimientos" value={movements.length} prefix={<BugOutlined />} /></Card></Col>
      </Row>

      <Card className="data-card" title="Sincronización del ESP32">
        <Space wrap>
          <Tag color={pendingEvents > 0 ? 'gold' : 'green'}>Eventos pendientes: {pendingEvents}</Tag>
          <Tag color={droppedEvents > 0 ? 'red' : 'green'}>Eventos descartados: {droppedEvents}</Tag>
          {droppedEvents > 0 ? <span>Revisa la red: se agotó la cola temporal del ESP32.</span> : null}
        </Space>
      </Card>

      <Card
        className="action-card"
        title="Simulador de eventos"
        extra={(
          <Switch
            checked={simulationEnabled}
            checkedChildren="Activo"
            unCheckedChildren="Bloqueado"
            onChange={(enabled) => {
              setSimulationEnabled(enabled);
              if (enabled) message.warning('Modo simulación activo. No lo uses durante una partida física.');
            }}
          />
        )}
      >
        <Space wrap className="mobile-stack">
          <Button type="primary" disabled={!simulationEnabled} onClick={simulateStatus}>Simular estado ESP32</Button>
          <Button disabled={!simulationEnabled} onClick={simulateDice}>Simular dado</Button>
          <Button disabled={!simulationEnabled} onClick={() => simulateQuestion(true)}>Simular respuesta correcta</Button>
          <Button disabled={!simulationEnabled} onClick={() => simulateQuestion(false)}>Simular respuesta incorrecta</Button>
          <Button danger disabled={!simulationEnabled} onClick={() => socket.emit('demo:device-disconnect', { kind: 'ESP32' })}>Simular desconexión ESP32</Button>
          {['POWER', 'DICE', 'A', 'B', 'REPEAT_AUDIO', 'CONFIRM'].map((button) => (
            <Button key={button} disabled={!simulationEnabled} onClick={() => simulateButton(button)}>Botón {button}</Button>
          ))}
        </Space>
      </Card>

      <Card className="data-card" title="Eventos técnicos recientes" extra={<Tag color="blue">WebSocket</Tag>}>
        <List
          dataSource={technicalEvents}
          locale={{ emptyText: 'Sin eventos técnicos registrados' }}
          renderItem={(event) => <List.Item>{event}</List.Item>}
        />
      </Card>
    </Space>
  );
}
