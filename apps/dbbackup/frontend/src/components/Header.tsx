import React from 'react'
import { Layout, Badge, Avatar, Dropdown, Space, Typography } from 'antd'
import {
  BellOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'

const { Header: AntHeader } = Layout
const { Text } = Typography

const Header: React.FC = () => {
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ]

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}
    >
      <div>
        <Text type="secondary">Database Backup Management Platform</Text>
      </div>
      
      <Space size={24}>
        <Badge count={5} size="small">
          <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
        </Badge>
        
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <Text>Admin</Text>
            <DownOutlined />
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

export default Header
