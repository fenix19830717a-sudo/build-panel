import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';

// 作为独立应用渲染
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ChatWidget apiUrl="http://localhost:3000" />
    </React.StrictMode>,
  );
}

// 导出供外部使用
export { ChatWidget };
