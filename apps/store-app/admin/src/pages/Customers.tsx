import { Table, Button, Space, Tag } from 'antd';
import { EyeOutlined, MailOutlined } from '@ant-design/icons';

const Customers = () => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Orders', dataIndex: 'orders', key: 'orders' },
    { title: 'Total Spent', dataIndex: 'spent', key: 'spent', render: (s: number) => `$${s}` },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EyeOutlined />}>View</Button>
          <Button icon={<MailOutlined />}>Email</Button>
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', name: 'John Doe', email: 'john@example.com', orders: 12, spent: 1200, status: 'active' },
    { key: '2', name: 'Jane Smith', email: 'jane@example.com', orders: 8, spent: 890, status: 'active' },
    { key: '3', name: 'Bob Wilson', email: 'bob@example.com', orders: 3, spent: 230, status: 'inactive' },
  ];

  return (
    <div>
      <h1>Customers</h1>
      <Table columns={columns} dataSource={data} style={{ marginTop: 16 }} />
    </div>
  );
};

export default Customers;
