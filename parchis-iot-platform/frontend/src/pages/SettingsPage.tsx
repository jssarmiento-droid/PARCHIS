import { SaveOutlined } from '@ant-design/icons';
import { App as AntdApp, Button, Card, Col, Descriptions, Form, Input, InputNumber, Row, Slider, Space } from 'antd';
import { useEffect, useState } from 'react';
import { AsyncState } from '../components/AsyncState';
import { PageTitle } from '../components/PageTitle';
import { useRealtime } from '../hooks/useRealtime';
import { useResource } from '../hooks/useResource';
import { api } from '../services/api';
import { SystemConfig } from '../types/domain';

export function SettingsPage() {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const { devices, refresh } = useRealtime();
  const { data, loading, error, reload, setData } = useResource<SystemConfig>(
    async () => (await api.get('/settings')).data,
    [],
  );

  useEffect(() => {
    if (data) form.setFieldsValue(data);
  }, [data, form]);

  async function save(values: Record<string, unknown>) {
    setSaving(true);
    try {
      const { data: updated } = await api.patch('/settings', values);
      setData(updated);
      form.setFieldsValue(updated);
      await refresh();
      message.success('Configuración guardada y lista para sincronizar con el ESP32');
    } catch {
      message.error('No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  }

  const esp32 = devices.find((device) => device.kind === 'ESP32');

  return (
    <Space direction="vertical" size="large" className="full-width">
      <PageTitle title="Configuración" subtitle="Ajustes aplicados a la plataforma y sincronizados por el ESP32 conectado." />
      <Card className="data-card" title="Ajustes activos">
        <AsyncState loading={loading} error={error} empty={false} onRetry={reload}>
          <Form form={form} layout="vertical" onFinish={save} disabled={saving}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Nombre del proyecto" name="projectName" rules={[{ required: true, message: 'Ingresa el nombre del proyecto' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Logo URL" name="logoUrl">
                  <Input placeholder="https://..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Máximo de jugadores" name="playerCount" rules={[{ required: true }]}>
                  <InputNumber min={2} max={4} className="full-width" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Tiempo máximo para mover la ficha (segundos)" name="timeoutSeconds" rules={[{ required: true }]}>
                  <InputNumber min={5} max={120} className="full-width" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label="Volumen del tablero" name="volume" rules={[{ required: true }]}>
                  <Slider min={0} max={100} />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving} disabled={saving}>
              Guardar configuración
            </Button>
          </Form>
        </AsyncState>
      </Card>
      <Card className="data-card" title="Información técnica">
        <Descriptions bordered column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="Tablero físico">28 casillas fijas</Descriptions.Item>
          <Descriptions.Item label="Aplicación de ajustes">El ESP32 consulta los cambios cada 10 segundos</Descriptions.Item>
          <Descriptions.Item label="Conexión del ESP32">{esp32?.connected ? 'Conectado al backend' : 'Esperando conexión'}</Descriptions.Item>
          <Descriptions.Item label="IP detectada">{esp32?.ipAddress || 'Se mostrará cuando el ESP32 envíe estado'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
}
