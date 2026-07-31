import { Button, Card, Col, Form, Input, InputNumber, Row, Slider, Space, message } from 'antd';
import { useEffect } from 'react';
import { PageTitle } from '../components/PageTitle';
import { api } from '../services/api';

export function SettingsPage() {
  const [form] = Form.useForm();

  useEffect(() => {
    api.get('/settings').then(({ data }) => form.setFieldsValue(data)).catch(() => undefined);
  }, [form]);

  async function save(values: Record<string, unknown>) {
    await api.patch('/settings', values);
    message.success('Configuración guardada');
  }

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Configuración" subtitle="Parámetros del proyecto, tablero y comunicación con dispositivos." />
      <Card>
        <Form form={form} layout="vertical" onFinish={save}>
          <Row gutter={16}>
            <Col xs={24} md={12}><Form.Item label="Nombre del proyecto" name="projectName"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Logo URL" name="logoUrl"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="Cantidad de jugadores" name="playerCount"><InputNumber min={1} max={4} className="full-width" /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="Cantidad de casillas" name="tileCount"><InputNumber min={28} className="full-width" /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="Tiempo de espera" name="timeoutSeconds"><InputNumber min={5} className="full-width" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Dirección IP del ESP32" name="esp32Ip"><Input /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item label="Puerto WebSocket" name="websocketPort"><InputNumber className="full-width" /></Form.Item></Col>
            <Col xs={24}><Form.Item label="Volumen" name="volume"><Slider min={0} max={100} /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit">Guardar configuración</Button>
        </Form>
      </Card>
    </Space>
  );
}
