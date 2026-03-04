import React from 'react'
import { Layout, Menu, Button } from 'antd'
import {
  DashboardOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  HistoryOutlined,
  SettingOutlined,
  CloudDownloadOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = React.useState(false)

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/databases',
      icon: <DatabaseOutlined />,
      label: 'Databases',
    },
    {
      key: '/backups',
      icon: <CloudUploadOutlined />,
      label: 'Backups',
    },
    {
      key: '/jobs',
      icon: <HistoryOutlined />,
      label: 'Backup Jobs',
    },
    {
      key: '/restore',
      icon: <CloudDownloadOutlined />,
      label: 'Restore',
    },
    {
      key: '/storage',
      icon: <DatabaseOutlined />,
      label: 'Storage',
    },
    {
      key: '/alerts',
      icon: <BellOutlined />,
      label: 'Alerts',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ]

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        background: '#001529',
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <img
          src="/logo.svg"
          alt="DBBackup"
          style={{
            height: 32,
            display: collapsed ? 'none' : 'block',
          }}
        />
        {!collapsed && (
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
            DBBackup
          </span>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0 }}
      />
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          color: '#fff',
        }}
      />
    </Sider>
  )
}

export default Sidebar
