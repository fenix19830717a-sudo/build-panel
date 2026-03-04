import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
}

const mockTickets: Ticket[] = [
  { id: '1', ticketNumber: 'TKT-001', title: '无法登录账户', status: 'open', priority: 'high', category: 'account', createdAt: '2024-01-15' },
  { id: '2', ticketNumber: 'TKT-002', title: '支付失败问题', status: 'in_progress', priority: 'urgent', category: 'billing', createdAt: '2024-01-14' },
  { id: '3', ticketNumber: 'TKT-003', title: '功能建议', status: 'waiting', priority: 'low', category: 'feature', createdAt: '2024-01-13' },
];

export default function Tickets() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: '工单号', dataIndex: 'ticketNumber', key: 'ticketNumber' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = { open: 'blue', in_progress: 'orange', waiting: 'gold', resolved: 'green', closed: 'default' };
        const labels: Record<string, string> = { open: '待处理', in_progress: '处理中', waiting: '待回复', resolved: '已解决', closed: '已关闭' };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors: Record<string, string> = { low: 'green', medium: 'blue', high: 'orange', urgent: 'red' };
        const labels: Record<string, string> = { low: '低', medium: '中', high: '高', urgent: '紧急' };
        return <Tag color={colors[priority]}>{labels[priority] || priority}</Tag>;
      }
    },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">查看</Button>
          <Button type="primary" size="small">处理</Button>
        </Space>
      )
    }
  ];

  const handleCreate = (values: any) => {
    console.log('创建工单:', values);
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>工单管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          创建工单
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="搜索工单" style={{ width: 200 }} />
          <Select placeholder="状态" style={{ width: 120 }} allowClear>
            <Option value="open">待处理</Option>
            <Option value="in_progress">处理中</Option>
            <Option value="resolved">已解决</Option>
          </Select>
          <Select placeholder="优先级" style={{ width: 120 }} allowClear>
            <Option value="low">低</Option>
            <Option value="medium">中</Option>
            <Option value="high">高</Option>
            <Option value="urgent">紧急</Option>
          </Select>
          <RangePicker />
        </Space>
      </Card>

      <Table columns={columns} dataSource={mockTickets} rowKey="id" />

      <Modal
        title="创建工单"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]} >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ required: true }]} >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]} >
            <Select>
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
