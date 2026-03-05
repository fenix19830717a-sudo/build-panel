import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, theme as antTheme } from 'antd/es';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  SkinOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  PictureOutlined,
  SettingOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  RobotOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useUIStore, useAuthStore } from '../stores';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/theme',
    icon: <SkinOutlined />,
    label: '主题配置',
  },
  {
    key: '/content',
    icon: <FileTextOutlined />,
    label: '内容管理',
  },
  {
    key: '/products',
    icon: <ShoppingOutlined />,
    label: '产品管理',
  },
  {
    key: '/pages',
    icon: <GlobalOutlined />,
    label: '页面管理',
  },
  {
    key: '/media',
    icon: <PictureOutlined />,
    label: '媒体库',
  },
  {
    key: '/seo',
    icon: <SearchOutlined />,
    label: 'SEO设置',
  },
  {
    key: '/ai-assistant',
    icon: <RobotOutlined />,
    label: 'AI助手',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const [notifications] = useState(3);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = antTheme.useToken();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账号设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              W
            </div>
            {!sidebarCollapsed && (
              <span style={{ fontWeight: 600, fontSize: 16, color: '#1f1f1f' }}>
                WebBuilder
              </span>
            )}
          </div>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            zIndex: 9,
          }}
        >
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button type="text" icon={<BellOutlined />}>
              <Badge count={notifications} size="small" offset={[0, 0]}>
                <span style={{ padding: '0 8px' }}>通知</span>
              </Badge>
            </Button>
            
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                <span style={{ fontWeight: 500 }}>{user?.name || '管理员'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
