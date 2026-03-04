import { Table, Button, Space, Tag, Badge } from 'antd';
import { EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';

const Orders = () => {
  const columns = [
    { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (total: number) => `$${total}` },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          pending: 'orange',
          processing: 'blue',
          shipped: 'cyan',
          delivered: 'green',
          cancelled: 'red',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EyeOutlined />}>View</Button>
          <Button icon={<CheckCircleOutlined />} type="primary">Process</Button>
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', orderNumber: 'ORD-001', customer: 'John Doe', total: 150.00, status: 'pending', date: '2024-01-15' },
    { key: '2', orderNumber: 'ORD-002', customer: 'Jane Smith', total: 230.00, status: 'processing', date: '2024-01-14' },
    { key: '3', orderNumber: 'ORD-003', customer: 'Bob Wilson', total: 89.99, status: 'delivered', date: '2024-01-13' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Orders <Badge count={5} style={{ backgroundColor: '#1890ff' }} /></h1>
      </div>

      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default Orders;
