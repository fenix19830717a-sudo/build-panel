import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ConfigProvider>
);
