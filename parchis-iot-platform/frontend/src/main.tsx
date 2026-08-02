import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntdApp, ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { BrowserRouter } from 'react-router-dom';
import App from './routes/App';
import { RealtimeProvider } from './hooks/useRealtime';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={esES}
      theme={{
        token: {
          colorPrimary: '#1f7a3d',
          colorInfo: '#2876b8',
          colorSuccess: '#2f8a48',
          colorWarning: '#c58c20',
          colorError: '#c84848',
          colorBgLayout: '#f6f7f2',
          colorText: '#152018',
          colorTextSecondary: '#647067',
          colorBorder: '#e3e7df',
          borderRadius: 8,
          fontFamily: 'Inter, Manrope, Segoe UI, sans-serif',
        },
        components: {
          Card: {
            borderRadiusLG: 10,
            paddingLG: 18,
          },
          Button: {
            borderRadius: 8,
            controlHeight: 38,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Table: {
            cellPaddingBlock: 9,
            cellPaddingInline: 12,
            headerBg: '#f7f9fb',
          },
        },
      }}
    >
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RealtimeProvider>
          <AntdApp>
            <App />
          </AntdApp>
        </RealtimeProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
