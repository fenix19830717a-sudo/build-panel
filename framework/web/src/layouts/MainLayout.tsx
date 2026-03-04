import { Layout, Menu, Button, Avatar, Dropdown } from 'antd'
import {
  DashboardOutlined,
  CloudServerOutlined,
  AppstoreOutlined,
  KeyOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  OrderedListOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

const { Header, Sider, Content } = Layout

export function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, clearAuth } = useAuthStore()

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/servers', icon: <CloudServerOutlined />, label: 'Servers' },
    { key: '/apps', icon: <AppstoreOutlined />, label: 'Apps' },
    { key: '/tasks', icon: <OrderedListOutlined />, label: 'Tasks' },
    { key: '/api-keys', icon: <KeyOutlined />, label: 'API Keys' },
    { key: '/users', icon: <UserOutlined />, label: 'Users' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
  ]

  const userMenuItems = [
    { key: 'profile', label: 'Profile' },
    { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, danger: true },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      clearAuth()
      navigate('/login')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" collapsedWidth={64}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
          BuildAI
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-between' }}>
          <h2 style={{ flex: 1, margin: 0 }}>{menuItems.find(item => item.key === location.pathname)?.label || 'BuildAI'}</h2>
          
          <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight">
            <Button type="text">
              <Avatar size="small" icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>{user?.name || 'User'}</span>
            </Button>
          </Dropdown>
        </Header>
        
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
