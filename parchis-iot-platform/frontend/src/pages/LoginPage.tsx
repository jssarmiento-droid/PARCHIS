import { ArrowLeftOutlined, CheckCircleOutlined, ExperimentOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { App as AntdApp, Button, Form, Input, Typography } from 'antd';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OfficialBoard } from '../components/OfficialBoard';
import { api } from '../services/api';

const loginPieces = [
  { color: 'BLUE' as const, tile: 4, label: 'Jugador azul' },
  { color: 'RED' as const, tile: 9, label: 'Jugador rojo' },
  { color: 'GREEN' as const, tile: 14, label: 'Jugador verde' },
  { color: 'YELLOW' as const, tile: 19, label: 'Jugador amarillo' },
];

export function LoginPage() {
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(values: { username: string; password: string }) {
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', values);
      localStorage.setItem('accessToken', data.accessToken);
      message.success('Sesión iniciada correctamente');
      navigate('/dashboard');
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        message.error('No fue posible conectar con el servidor. Espera un momento y vuelve a intentarlo.');
        return;
      }
      message.error('Usuario o contraseña incorrectos');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Acceso administrativo">
        <aside className="login-identity">
          <button className="login-brand" type="button" onClick={() => navigate('/')} aria-label="Volver al inicio">
            <span><ExperimentOutlined /></span>
            <div><strong>Parchís Inclusivo</strong><small>Plataforma educativa IoT</small></div>
          </button>
          <div className="login-identity-copy">
            <Typography.Text>Sistema multisensorial</Typography.Text>
            <Typography.Title level={1}>Tecnología accesible para aprender jugando.</Typography.Title>
          </div>
          <div className="login-board-preview"><OfficialBoard compact pieces={loginPieces} /></div>
          <ul className="login-capabilities">
            <li><CheckCircleOutlined />28 casillas sensorizadas</li>
            <li><CheckCircleOutlined />Navegación mediante audio</li>
            <li><CheckCircleOutlined />Monitoreo en tiempo real</li>
          </ul>
        </aside>

        <div className="login-form-panel">
          <button className="login-back" type="button" onClick={() => navigate('/')}>
            <ArrowLeftOutlined /> Volver al inicio
          </button>
          <div className="login-form-heading">
            <Typography.Text>Panel administrativo</Typography.Text>
            <Typography.Title level={2}>Bienvenido</Typography.Title>
            <Typography.Paragraph>Accede para supervisar el tablero y administrar las partidas.</Typography.Paragraph>
          </div>
          <Form layout="vertical" onFinish={handleLogin} initialValues={{ username: 'admin', password: 'admin123' }} requiredMark={false}>
            <Form.Item label="Usuario" name="username" rules={[{ required: true, message: 'Ingresa el usuario administrador' }]}>
              <Input prefix={<UserOutlined />} autoComplete="username" placeholder="Usuario administrador" />
            </Form.Item>
            <Form.Item label="Contraseña" name="password" rules={[{ required: true, message: 'Ingresa la contraseña' }]}>
              <Input.Password prefix={<LockOutlined />} autoComplete="current-password" placeholder="Contraseña" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={submitting} disabled={submitting}>
              Iniciar sesión
            </Button>
          </Form>
          <p className="login-support">Acceso exclusivo para el administrador del proyecto.</p>
        </div>
      </section>
    </main>
  );
}
