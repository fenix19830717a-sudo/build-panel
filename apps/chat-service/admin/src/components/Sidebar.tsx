import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Badge } from 'antd';
import {
  DashboardOutlined,
  MessageOutlined,
  FileTextOutlined,
  BookOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '概览' },
  { key: '/chat', icon: <MessageOutlined />, label: '实时聊天' },
  { key: '/tickets', icon: <FileTextOutlined />, label: '工单管理' },
  { key: '/knowledge', icon: <BookOutlined />, label: '知识库' },
  { key: '/agents', icon: <TeamOutlined />, label: '客服管理' },
  { key: '/settings', icon: <SettingOutlined />, label: '设置' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={setCollapsed}
      theme="light"
      style={{ 
        boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        zIndex: 10 
      }}
    >
      <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <Avatar size={collapsed ? 40 : 64} icon={<MessageOutlined />} style={{ background: '#1890ff' }} />
        {!collapsed && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 600 }}>ChatService</div>
            <Badge status="success" text="在线" style={{ fontSize: 12 }} />
          </div>
        )}
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
}
