import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(values: { username: string; password: string }) {
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', values);
      localStorage.setItem('accessToken', data.accessToken);
      message.success('Sesión iniciada correctamente');
      navigate('/dashboard');
    } catch {
      message.error('Usuario o contraseña incorrectos');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <Typography.Title level={2}>Parchís Inclusivo</Typography.Title>
        <Typography.Paragraph>Acceso del administrador del sistema IoT</Typography.Paragraph>
        <Form layout="vertical" onFinish={handleLogin} initialValues={{ username: 'admin', password: 'admin123' }}>
          <Form.Item label="Usuario" name="username" rules={[{ required: true, message: 'Ingresa el usuario administrador' }]}>
            <Input prefix={<UserOutlined />} autoComplete="username" />
          </Form.Item>
          <Form.Item label="Contraseña" name="password" rules={[{ required: true, message: 'Ingresa la contraseña' }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={submitting} disabled={submitting}>
            Iniciar sesión
          </Button>
        </Form>
      </Card>
    </div>
  );
}
