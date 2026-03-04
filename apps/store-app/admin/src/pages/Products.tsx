import { Table, Button, Space, Tag, Popconfirm, Input } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, RobotOutlined } from '@ant-design/icons';
import { useState } from 'react';

const Products = () => {
  const [searchText, setSearchText] = useState('');

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (price: number) => `$${price}` },
    { title: 'Stock', dataIndex: 'stock', key: 'stock' },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} type="primary" ghost>Edit</Button>
          <Button icon={<RobotOutlined />}>AI Desc</Button>
          <Popconfirm title="Delete this product?">
            <Button icon={<DeleteOutlined />} danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', name: 'Product A', price: 99.99, stock: 100, isActive: true },
    { key: '2', name: 'Product B', price: 149.99, stock: 50, isActive: true },
    { key: '3', name: 'Product C', price: 79.99, stock: 0, isActive: false },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Products</h1>
        <Button type="primary" icon={<PlusOutlined />}>Add Product</Button>
      </div>

      <Input.Search
        placeholder="Search products..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 300 }}
      />

      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default Products;
