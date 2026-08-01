import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
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
          colorPrimary: '#2f8a3a',
          colorInfo: '#2f8a3a',
          colorSuccess: '#2f8a3a',
          colorBgLayout: '#f3f5f7',
          colorText: '#111827',
          borderRadius: 4,
          fontFamily: 'Inter, system-ui, Segoe UI, sans-serif',
        },
        components: {
          Card: {
            borderRadiusLG: 4,
            paddingLG: 18,
          },
          Button: {
            borderRadius: 4,
            controlHeight: 34,
          },
          Input: {
            borderRadius: 4,
            controlHeight: 34,
          },
          Select: {
            borderRadius: 4,
            controlHeight: 34,
          },
          Table: {
            cellPaddingBlock: 9,
            cellPaddingInline: 12,
            headerBg: '#f7f9fb',
          },
        },
      }}
    >
      <BrowserRouter>
        <RealtimeProvider>
          <App />
        </RealtimeProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
