import {
  BarChartOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  HistoryOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  SoundOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Badge, Layout, Menu, Space, Tag, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useRealtime } from '../hooks/useRealtime';
import { useCurrentTime } from '../hooks/useCurrentTime';

const { Sider, Header, Content } = Layout;

const items = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/nueva-partida', icon: <PlusCircleOutlined />, label: 'Nueva partida' },
  { key: '/monitoreo', icon: <ControlOutlined />, label: 'Monitoreo vivo' },
  { key: '/preguntas', icon: <QuestionCircleOutlined />, label: 'Preguntas' },
  { key: '/audios', icon: <SoundOutlined />, label: 'Audios' },
  { key: '/historial', icon: <HistoryOutlined />, label: 'Historial' },
  { key: '/reportes', icon: <BarChartOutlined />, label: 'Reportes' },
  { key: '/diagnostico', icon: <ToolOutlined />, label: 'Diagnóstico' },
  { key: '/configuracion', icon: <SettingOutlined />, label: 'Configuración' },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { connected, devices, systemConfig } = useRealtime();
  const currentTime = useCurrentTime();
  const esp32 = devices.find((device) => device.kind === 'ESP32');

  return (
    <Layout className="app-shell">
      <Sider width={280} className="app-sider">
        <div className="brand">
          {systemConfig?.logoUrl ? (
            <img className="brand-logo" src={systemConfig.logoUrl} alt="Logo del proyecto" />
          ) : <DatabaseOutlined />}
          <div>
            <Typography.Text className="brand-title">{systemConfig?.projectName || 'Parchís Educativo'}</Typography.Text>
            <Typography.Text className="brand-subtitle">Panel multisensorial</Typography.Text>
          </div>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={items} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Space size="middle" wrap>
            <Badge status={connected ? 'success' : 'error'} text={connected ? 'Servidor conectado' : 'Servidor desconectado'} />
            <Tag color={esp32?.connected ? 'green' : 'red'}>{esp32?.connected ? 'ESP32 conectado' : 'ESP32 desconectado'}</Tag>
          </Space>
          <Space>
            <FileTextOutlined />
            <Typography.Text strong>{currentTime.toLocaleString('es-EC')}</Typography.Text>
          </Space>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
