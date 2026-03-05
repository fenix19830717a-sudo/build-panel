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
  Tree,
  Switch,
  message,
  Popconfirm,
  Row,
  Col,
  Typography,
  Tabs,
  Select,
} from 'antd/es';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DragOutlined,
  GlobalOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import type { Page, NavMenuItem } from '../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// 模拟页面数据
const mockPages: Page[] = [
  {
    id: '1',
    title: '首页',
    slug: '/',
    content: '欢迎来到我们的网站...',
    isPublished: true,
    isInMenu: true,
    menuOrder: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-03-05',
  },
  {
    id: '2',
    title: '关于我们',
    slug: '/about',
    content: '关于我们公司的介绍...',
    isPublished: true,
    isInMenu: true,
    menuOrder: 2,
    seoTitle: '关于我们 - 了解我们的故事',
    seoDescription: '了解更多关于我们公司的历史和使命',
    createdAt: '2024-01-02',
    updatedAt: '2024-03-04',
  },
  {
    id: '3',
    title: '产品服务',
    slug: '/services',
    content: '我们提供的产品和服务...',
    isPublished: true,
    isInMenu: true,
    menuOrder: 3,
    createdAt: '2024-01-03',
    updatedAt: '2024-03-03',
  },
  {
    id: '4',
    title: '隐私政策',
    slug: '/privacy',
    content: '隐私政策内容...',
    isPublished: true,
    isInMenu: false,
    menuOrder: 0,
    createdAt: '2024-01-04',
    updatedAt: '2024-02-01',
  },
];

// 模拟导航菜单
const mockNavMenu: NavMenuItem[] = [
  {
    id: '1',
    title: '首页',
    path: '/',
    order: 1,
  },
  {
    id: '2',
    title: '关于我们',
    path: '/about',
    order: 2,
  },
  {
    id: '3',
    title: '产品服务',
    path: '/services',
    order: 3,
    children: [
      {
        id: '3-1',
        title: '产品列表',
        path: '/products',
        order: 1,
      },
      {
        id: '3-2',
        title: '解决方案',
        path: '/solutions',
        order: 2,
      },
    ],
  },
  {
    id: '4',
    title: '联系我们',
    path: '/contact',
    order: 4,
  },
];

const PageManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('pages');
  const [searchText, setSearchText] = useState('');

  const columns = [
    {
      title: '页面标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Page) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            /{record.slug}
          </Text>
        </div>
      ),
    },
    {
      title: 'SEO 信息',
      key: 'seo',
      render: (record: Page) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>标题: {record.seoTitle || '-'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            描述: {record.seoDescription?.slice(0, 30) || '-'}...
          </Text>
        </Space>
      ),
    },
    {
      title: '菜单',
      dataIndex: 'isInMenu',
      key: 'isInMenu',
      render: (isInMenu: boolean) => (
        <Tag color={isInMenu ? 'blue' : 'default'}>
          {isInMenu ? '导航菜单' : '隐藏'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? 'success' : 'warning'}>
          {isPublished ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Page) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/${record.slug}`, '_blank')}
          >
            预览
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    form.setFieldsValue(page);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPage(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    message.success('页面已删除');
  };

  const handleSave = (values: unknown) => {
    console.log('Save:', values);
    message.success(editingPage ? '页面已更新' : '页面已创建');
    setIsModalOpen(false);
  };

  const filteredPages = mockPages.filter(p =>
    p.title.toLowerCase().includes(searchText.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchText.toLowerCase())
  );

  const treeData = mockNavMenu.map(item => ({
    key: item.id,
    title: (
      <Space>
        <DragOutlined style={{ cursor: 'grab', color: '#999' }} />
        <span>{item.title}</span>
        <Text type="secondary" style={{ fontSize: 12 }}>({item.path})</Text>
      </Space>
    ),
    children: item.children?.map(child => ({
      key: child.id,
      title: (
        <Space>
          <span style={{ marginLeft: 24 }}>{child.title}</span>
          <Text type="secondary" style={{ fontSize: 12 }}>({child.path})</Text>
        </Space>
      ),
    })),
  }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>页面管理</Title>
            <Text type="secondary">管理网站页面和导航菜单</Text>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建页面
            </Button>
          </Col>
        </Row>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane
          tab={
            <span>
              <GlobalOutlined /> 页面列表
            </span>
          }
          key="pages"
        >
          <Card>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="搜索页面标题"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredPages}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <MenuOutlined /> 导航菜单
            </span>
          }
          key="menu"
        >
          <Card title="导航菜单配置">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card type="inner" title="菜单结构">
                  <Tree
                    treeData={treeData}
                    draggable
                    showLine
                    defaultExpandAll
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card type="inner" title="添加菜单项">
                  <Form layout="vertical">
                    <Form.Item label="菜单名称" required>
                      <Input placeholder="输入菜单名称" />
                    </Form.Item>
                    
                    <Form.Item label="链接路径" required>
                      <Input placeholder="例如：/about" />
                    </Form.Item>
                    
                    <Form.Item label="上级菜单">
                      <Select placeholder="选择上级菜单（可选）" allowClear>
                        <Select.Option value="home">首页</Select.Option>
                        <Select.Option value="about">关于我们</Select.Option>
                        <Select.Option value="services">产品服务</Select.Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" icon={<PlusOutlined />}>
                        添加菜单项
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editingPage ? '编辑页面' : '新建页面'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        width={900}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ isPublished: false, isInMenu: true }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                label="页面标题"
                name="title"
                rules={[{ required: true, message: '请输入页面标题' }]}
              >
                <Input placeholder="输入页面标题" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="URL 别名"
                name="slug"
                rules={[{ required: true, message: '请输入URL别名' }]}
              >
                <Input placeholder="例如：about-us" addonBefore="/" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="页面内容" name="content">
            <TextArea rows={10} placeholder="输入页面内容（支持HTML）" />
          </Form.Item>

          <Card title="SEO 设置" size="small" style={{ marginBottom: 16 }}>
            <Form.Item label="SEO 标题" name="seoTitle">
              <Input placeholder="输入SEO标题" maxLength={60} showCount />
            </Form.Item>

            <Form.Item label="SEO 描述" name="seoDescription">
              <TextArea
                rows={2}
                placeholder="输入SEO描述"
                maxLength={160}
                showCount
              />
            </Form.Item>

            <Form.Item label="SEO 关键词" name="seoKeywords">
              <Input placeholder="输入关键词，用逗号分隔" />
            </Form.Item>
          </Card>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="发布状态"
                name="isPublished"
                valuePropName="checked"
              >
                <Switch checkedChildren="已发布" unCheckedChildren="草稿" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="显示在导航菜单"
                name="isInMenu"
                valuePropName="checked"
              >
                <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default PageManagement;
