import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();

  async function handleLogin(values: { username: string; password: string }) {
    try {
      const { data } = await api.post('/auth/login', values);
      localStorage.setItem('accessToken', data.accessToken);
      navigate('/dashboard');
    } catch {
      message.error('Usuario o contraseña incorrectos');
    }
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <Typography.Title level={2}>Parchis Inclusivo</Typography.Title>
        <Typography.Paragraph>Acceso del administrador del sistema IoT</Typography.Paragraph>
        <Form layout="vertical" onFinish={handleLogin} initialValues={{ username: 'admin', password: 'admin123' }}>
          <Form.Item label="Usuario" name="username" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item label="Contraseña" name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Iniciar sesión
          </Button>
        </Form>
      </Card>
    </div>
  );
}
