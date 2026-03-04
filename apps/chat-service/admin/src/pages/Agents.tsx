import { useState } from 'react';
import { Card, Table, Button, Space, Tag, Avatar, Switch, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';

const { Option } = Select;

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: string;
  isActive: boolean;
  roles: string[];
  department?: string;
}

const mockAgents: Agent[] = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', status: 'online', isActive: true, roles: ['admin'], department: '技术部' },
  { id: '2', name: '李四', email: 'lisi@example.com', status: 'busy', isActive: true, roles: ['agent'], department: '客服部' },
  { id: '3', name: '王五', email: 'wangwu@example.com', status: 'offline', isActive: true, roles: ['agent'], department: '客服部' },
];

export default function Agents() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string) => <Avatar icon={<UserOutlined />} src={avatar} />
    },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = { online: 'green', away: 'orange', busy: 'red', offline: 'default' };
        const labels: Record<string, string> = { online: '在线', away: '离开', busy: '忙碌', offline: '离线' };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      }
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => roles.map(role => (
        <Tag key={role}>{role === 'admin' ? '管理员' : '客服'}</Tag>
      ))
    },
    { title: '部门', dataIndex: 'department', key: 'department' },
    {
      title: '启用',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => <Switch checked={isActive} />
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button icon={<EditOutlined />} size="small">编辑</Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>客服管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          添加客服
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={mockAgents} rowKey="id" />
      </Card>

      <Modal
        title="添加客服"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]} >
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]} >
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]} >
            <Input.Password />
          </Form.Item>
          <Form.Item name="roles" label="角色" rules={[{ required: true }]} >
            <Select mode="multiple">
              <Option value="admin">管理员</Option>
              <Option value="agent">客服</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
