import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  CodeOutlined,
  FolderOutlined,
  DesktopOutlined,
  ToolOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import TerminalPage from './pages/TerminalPage';
import FilesPage from './pages/FilesPage';
import ProcessesPage from './pages/ProcessesPage';
import ServicesPage from './pages/ServicesPage';

const { Header, Content, Sider } = Layout;

type PageKey = 'dashboard' | 'terminal' | 'files' | 'processes' | 'services';

const App: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<PageKey>('dashboard');
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'terminal', icon: <CodeOutlined />, label: 'Terminal' },
    { key: 'files', icon: <FolderOutlined />, label: 'Files' },
    { key: 'processes', icon: <DesktopOutlined />, label: 'Processes' },
    { key: 'services', icon: <ToolOutlined />, label: 'Services' }
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'terminal':
        return <TerminalPage />;
      case 'files':
        return <FilesPage />;
      case 'processes':
        return <ProcessesPage />;
      case 'services':
        return <ServicesPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 24 }}>
          ServerManager
        </div>
        <div style={{ color: '#fff', fontSize: 14, opacity: 0.8 }}>
          Remote Server Management
        </div>
      </Header>
      
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key as PageKey)}
          />
        </Sider>
        
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
