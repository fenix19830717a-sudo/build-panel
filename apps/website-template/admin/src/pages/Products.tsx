import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  Form,
  Select,
  Upload,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Row,
  Col,
  Image,
  Typography,
  Tabs,
} from 'antd/es';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  EyeOutlined,
  UploadOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Product, ProductCategory } from '../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// 模拟产品数据
const mockProducts: Product[] = [
  {
    id: '1',
    name: '智能手表 Pro',
    description: '高端智能手表，支持健康监测和运动追踪',
    shortDescription: '高端智能手表',
    price: 1299,
    originalPrice: 1599,
    images: ['https://via.placeholder.com/100'],
    categoryId: '1',
    tags: ['智能穿戴', '新品'],
    stock: 100,
    sku: 'WATCH-001',
    isActive: true,
    seoTitle: '智能手表 Pro - 高端智能穿戴设备',
    seoDescription: '购买智能手表 Pro，体验先进的健康监测功能',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-05',
  },
  {
    id: '2',
    name: '无线蓝牙耳机',
    description: '降噪蓝牙耳机，音质出色，续航持久',
    shortDescription: '降噪蓝牙耳机',
    price: 399,
    images: ['https://via.placeholder.com/100'],
    categoryId: '2',
    tags: ['音频', '热销'],
    stock: 50,
    sku: 'AUDIO-001',
    isActive: true,
    createdAt: '2024-02-15',
    updatedAt: '2024-03-04',
  },
];

// 模拟分类数据
const mockCategories: ProductCategory[] = [
  { id: '1', name: '智能穿戴', sortOrder: 1, isActive: true },
  { id: '2', name: '音频设备', sortOrder: 2, isActive: true },
  { id: '3', name: '手机配件', sortOrder: 3, isActive: true },
];

const ProductManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('products');
  const [searchText, setSearchText] = useState('');

  const columns = [
    {
      title: '产品',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <Space>
          <Image src={record.images[0]} width={50} height={50} style={{ borderRadius: 4 }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.sku}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'category',
      render: (categoryId: string) => {
        const category = mockCategories.find(c => c.id === categoryId);
        return <Tag>{category?.name || '未分类'}</Tag>;
      },
    },
    {
      title: '价格',
      key: 'price',
      render: (record: Product) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600, color: '#cf1322' }}>¥{record.price}</span>
          {record.originalPrice && (
            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 12 }}>
              ¥{record.originalPrice}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <span style={{ color: stock < 20 ? '#cf1322' : 'inherit' }}>
          {stock} 件
        </span>
      ),
    },
    {
      title: '标签',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <Space size={4}>
          {tags.map(tag => (
            <Tag key={tag} size="small">{tag}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '已上架' : '已下架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Product) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确认删除？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    message.success('产品已删除');
  };

  const handleSave = (values: unknown) => {
    console.log('Save:', values);
    message.success(editingProduct ? '产品已更新' : '产品已创建');
    setIsModalOpen(false);
  };

  const handleAIGenerate = () => {
    const productName = form.getFieldValue('name');
    if (!productName) {
      message.warning('请先输入产品名称');
      return;
    }
    message.loading('AI 正在生成产品描述...', 2);
    setTimeout(() => {
      form.setFieldValue('description', `这是一款优质的${productName}，采用先进技术和高品质材料制造，为用户提供卓越的使用体验。产品特点包括：
1. 创新设计，外观时尚
2. 高性能配置，使用流畅
3. 优质材料，经久耐用
4. 完善售后，购买无忧`);
      message.success('产品描述已生成');
    }, 2000);
  };

  const filteredProducts = mockProducts.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>产品管理</Title>
            <Text type="secondary">管理您的产品和分类</Text>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              添加产品
            </Button>
          </Col>
        </Row>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab="产品列表" key="products">
          <Card>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="搜索产品名称或SKU"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="选择分类"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {mockCategories.map(c => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredProducts}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="分类管理" key="categories">
          <Card>
            <Row gutter={[16, 16]}>
              {mockCategories.map(category => (
                <Col xs={24} sm={12} lg={8} key={category.id}>
                  <Card
                    hoverable
                    actions={[
                      <EditOutlined key="edit" />,
                      <DeleteOutlined key="delete" />,
                    ]}
                  >
                    <Card.Meta
                      title={category.name}
                      description={
                        <Space>
                          <Tag color={category.isActive ? 'success' : 'default'}>
                            {category.isActive ? '启用' : '禁用'}
                          </Tag>
                          <span>排序: {category.sortOrder}</span>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
              <Col xs={24} sm={12} lg={8}>
                <Card
                  style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Button type="dashed" icon={<PlusOutlined />} block>
                    添加分类
                  </Button>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editingProduct ? '编辑产品' : '添加产品'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ isActive: true, stock: 0 }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                label="产品名称"
                name="name"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Input placeholder="输入产品名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="SKU"
                name="sku"
                rules={[{ required: true, message: '请输入SKU' }]}
              >
                <Input placeholder="输入SKU编码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="价格"
                name="price"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  prefix="¥"
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="原价" name="originalPrice">
                <InputNumber
                  style={{ width: '100%' }}
                  prefix="¥"
                  min={0}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="库存"
                name="stock"
                rules={[{ required: true, message: '请输入库存' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="分类"
            name="categoryId"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="选择分类">
              {mockCategories.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="产品描述" name="description">
            <TextArea rows={4} placeholder="输入产品描述" />
          </Form.Item>

          <Form.Item>
            <Button icon={<RobotOutlined />} onClick={handleAIGenerate}>
              AI 生成描述
            </Button>
          </Form.Item>

          <Form.Item label="产品图片">
            <Upload
              listType="picture-card"
              action="/api/upload"
              multiple
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            label="标签"
            name="tags"
          >
            <Select mode="tags" placeholder="输入标签" />
          </Form.Item>

          <Form.Item
            label="上架状态"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
