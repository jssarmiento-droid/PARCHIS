import {
  BarChartOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  SoundOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App as AntdApp, Avatar, Badge, Dropdown, Layout, Menu, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
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
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { connected, devices, systemConfig } = useRealtime();
  const currentTime = useCurrentTime();
  const esp32 = devices.find((device) => device.kind === 'ESP32');
  const adminName = 'Administrador';
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  function closeSession() {
    localStorage.removeItem('accessToken');
    message.success('Sesion cerrada');
    navigate('/login', { replace: true });
  }

  return (
    <Layout className="app-shell">
      <Sider
        width={248}
        className="app-sider"
        collapsible
        collapsed={menuCollapsed}
        collapsedWidth={0}
        breakpoint="lg"
        trigger={null}
        onBreakpoint={setMenuCollapsed}
      >
        <div className="brand">
          {systemConfig?.logoUrl ? (
            <img className="brand-logo" src={systemConfig.logoUrl} alt="Logo del proyecto" />
          ) : <DatabaseOutlined />}
          <div>
            <Typography.Text className="brand-title">{systemConfig?.projectName || 'Parchís Educativo'}</Typography.Text>
            <Typography.Text className="brand-subtitle">Panel multisensorial</Typography.Text>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={({ key }) => {
            navigate(key);
            if (window.innerWidth < 992) setMenuCollapsed(true);
          }}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <div className="app-header-left">
            <button className="nav-toggle" type="button" onClick={() => setMenuCollapsed((current) => !current)} aria-label={menuCollapsed ? 'Abrir navegación' : 'Cerrar navegación'}>
              {menuCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <Space size="middle" className="app-header-status">
              <Badge status={connected ? 'success' : 'error'} text={connected ? 'Servidor conectado' : 'Servidor desconectado'} />
              <Tag color={esp32?.connected ? 'green' : 'red'}>{esp32?.connected ? 'ESP32 conectado' : 'ESP32 desconectado'}</Tag>
            </Space>
          </div>
          <Space size="middle" className="app-header-account">
            <span className="current-time"><FileTextOutlined />{currentTime.toLocaleString('es-EC')}</span>
            <Dropdown
              menu={{
                items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Cerrar sesión', danger: true }],
                onClick: ({ key }) => key === 'logout' && closeSession(),
              }}
              trigger={['click']}
            >
              <button className="account-menu" type="button" aria-label="Menú del administrador">
                <Avatar size={30} icon={<UserOutlined />} />
                <span>{adminName}</span>
              </button>
            </Dropdown>
          </Space>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
