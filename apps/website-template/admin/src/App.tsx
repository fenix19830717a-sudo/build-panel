import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd/es';
import zhCN from 'antd/locale/zh_CN';

// 布局
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// 页面
import Dashboard from './pages/Dashboard';
import Theme from './pages/Theme';
import Content from './pages/Content';
import Products from './pages/Products';
import Pages from './pages/Pages';
import Media from './pages/Media';
import SEO from './pages/SEO';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';

// 创建 Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 认证守卫组件
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('auth-token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          },
        }}
      >
        <Router>
          <Routes>
            {/* 认证路由 */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* 受保护路由 */}
            <Route
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/theme" element={<Theme />} />
              <Route path="/content" element={<Content />} />
              <Route path="/products" element={<Products />} />
              <Route path="/pages" element={<Pages />} />
              <Route path="/media" element={<Media />} />
              <Route path="/seo" element={<SEO />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/settings" element={<div>系统设置</div>} />
            </Route>

            {/* 默认重定向 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
