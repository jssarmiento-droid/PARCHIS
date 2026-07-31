import { ApiOutlined, BugOutlined, ThunderboltOutlined, WifiOutlined } from '@ant-design/icons';
import { Button, Card, Col, List, Row, Space, Statistic, Tag, message } from 'antd';
import { PageTitle } from '../components/PageTitle';
import { useRealtime } from '../hooks/useRealtime';
import { socket } from '../services/socket';

export function DiagnosticsPage() {
  const { connected, devices, technicalEvents, movements, activeGame } = useRealtime();
  const esp32 = devices.find((device) => device.kind === 'ESP32');
  const nano = devices.find((device) => device.kind === 'ARDUINO_NANO');

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
  }

  function simulateStatus() {
    socket.emit('esp32:system-status', {
      wifiRssi: -52,
      sensors: 'ok',
      dfPlayer: 'ok',
      uptimeMs: Date.now(),
    });
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Diagnóstico y modo demo" subtitle="Herramientas para validar la defensa incluso si el circuito físico no está conectado." />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}><Card><Statistic title="Servidor" value={connected ? 'Conectado' : 'Sin conexión'} prefix={<WifiOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card><Statistic title="ESP32" value={esp32?.connected ? 'Conectado' : 'Desconectado'} prefix={<ApiOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card><Statistic title="Arduino Nano" value={nano?.connected ? 'Activo' : 'Sin señal'} prefix={<ThunderboltOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card><Statistic title="Movimientos" value={movements.length} prefix={<BugOutlined />} /></Card></Col>
      </Row>

      <Card title="Simulador de eventos">
        <Space wrap>
          <Button type="primary" onClick={simulateStatus}>Simular estado ESP32</Button>
          <Button onClick={simulateDice}>Simular dado</Button>
          <Button onClick={() => simulateQuestion(true)}>Simular respuesta correcta</Button>
          <Button onClick={() => simulateQuestion(false)}>Simular respuesta incorrecta</Button>
          <Button danger onClick={() => socket.emit('demo:device-disconnect', { kind: 'ESP32' })}>Simular desconexión ESP32</Button>
          {['POWER', 'DICE', 'A', 'B', 'REPEAT_AUDIO', 'CONFIRM'].map((button) => (
            <Button key={button} onClick={() => simulateButton(button)}>Botón {button}</Button>
          ))}
        </Space>
      </Card>

      <Card title="Eventos técnicos recientes" extra={<Tag color="blue">WebSocket</Tag>}>
        <List
          dataSource={technicalEvents}
          locale={{ emptyText: 'Sin eventos técnicos registrados' }}
          renderItem={(event) => <List.Item>{event}</List.Item>}
        />
      </Card>
    </Space>
  );
}
