import { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  CloudServerOutlined,
  ToolOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Logs from './pages/Logs'
import Sources from './pages/Sources'
import Parsers from './pages/Parsers'
import AlertRules from './pages/AlertRules'

const { Header, Sider, Content } = Layout

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  
  const location = useLocation()

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: <Link to="/">仪表盘</Link> },
    { key: '/logs', icon: <FileTextOutlined />, label: <Link to="/logs">日志查询</Link> },
    { key: '/sources', icon: <CloudServerOutlined />, label: <Link to="/sources">日志源</Link> },
    { key: '/parsers', icon: <ToolOutlined />, label: <Link to="/parsers">解析规则</Link> },
    { key: '/alerts', icon: <BellOutlined />, label: <Link to="/alerts">告警规则</Link> },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h1 style={{ color: '#fff', margin: 0, fontSize: collapsed ? 16 : 20, fontWeight: 'bold' }}>
            {collapsed ? 'LC' : 'LogCollector'}
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>
            日志收集与分析平台
          </h2>
        </Header>
        
        <Content style={{ 
          margin: 24, 
          padding: 24, 
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          overflow: 'auto'
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/parsers" element={<Parsers />} />
            <Route path="/alerts" element={<AlertRules />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
