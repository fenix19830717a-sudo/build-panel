import { Table, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const Categories = () => {
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Products', dataIndex: 'productCount', key: 'productCount' },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} type="primary" ghost>Edit</Button>
          <Popconfirm title="Delete this category?">
            <Button icon={<DeleteOutlined />} danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', name: 'Electronics', slug: 'electronics', productCount: 45 },
    { key: '2', name: 'Clothing', slug: 'clothing', productCount: 120 },
    { key: '3', name: 'Home & Garden', slug: 'home-garden', productCount: 67 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Categories</h1>
        <Button type="primary" icon={<PlusOutlined />}>Add Category</Button>
      </div>

      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default Categories;
