import { Button, Card, Col, Form, Input, Row, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import { api } from '../services/api';
import { socket } from '../services/socket';

export function NewGamePage() {
  const navigate = useNavigate();

  async function createGame(values: Record<string, string>) {
    const { data } = await api.post('/games', values);
    await api.post(`/games/${data.id}/start`);
    socket.emit('web:start-game', { gameId: data.id });
    message.success(`Partida creada: ${data.publicId}`);
    navigate('/monitoreo');
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Nueva partida" subtitle="Registra los cuatro jugadores y genera un identificador único para la sesión." />
      <Card>
        <Form layout="vertical" onFinish={createGame}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item label="Nombre jugador Azul" name="bluePlayer" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Nombre jugador Rojo" name="redPlayer" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Nombre jugador Verde" name="greenPlayer" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Nombre jugador Amarillo" name="yellowPlayer" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit" size="large">Iniciar partida</Button>
        </Form>
      </Card>
    </Space>
  );
}
