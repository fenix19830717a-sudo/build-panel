import { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

interface Article {
  id: string;
  title: string;
  category: string;
  viewCount: number;
  helpfulCount: number;
  isPublished: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  articleCount: number;
}

const mockArticles: Article[] = [
  { id: '1', title: '如何重置密码', category: '账户', viewCount: 1200, helpfulCount: 85, isPublished: true, createdAt: '2024-01-10' },
  { id: '2', title: '支付流程说明', category: '计费', viewCount: 800, helpfulCount: 92, isPublished: true, createdAt: '2024-01-08' },
  { id: '3', title: '常见问题解答', category: 'FAQ', viewCount: 2000, helpfulCount: 150, isPublished: true, createdAt: '2024-01-05' },
];

const mockCategories: Category[] = [
  { id: '1', name: '账户', articleCount: 5 },
  { id: '2', name: '计费', articleCount: 3 },
  { id: '3', name: 'FAQ', articleCount: 10 },
];

export default function Knowledge() {
  const [activeTab, setActiveTab] = useState('articles');
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [articleForm] = Form.useForm();
  const [categoryForm] = Form.useForm();

  const articleColumns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '浏览量', dataIndex: 'viewCount', key: 'viewCount' },
    { title: '有帮助', dataIndex: 'helpfulCount', key: 'helpfulCount' },
    {
      title: '状态',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? 'green' : 'orange'}>
          {isPublished ? '已发布' : '草稿'}
        </Tag>
      )
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} size="small">编辑</Button>
          <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
        </Space>
      )
    }
  ];

  const categoryColumns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '文章数', dataIndex: 'articleCount', key: 'articleCount' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} size="small">编辑</Button>
          <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>知识库</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => activeTab === 'articles' ? setIsArticleModalOpen(true) : setIsCategoryModalOpen(true)}
        >
          {activeTab === 'articles' ? '新建文章' : '新建分类'}
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="文章管理" key="articles">
          <Table columns={articleColumns} dataSource={mockArticles} rowKey="id" />
        </TabPane>
        <TabPane tab="分类管理" key="categories">
          <Table columns={categoryColumns} dataSource={mockCategories} rowKey="id" />
        </TabPane>
      </Tabs>

      <Modal
        title="新建文章"
        open={isArticleModalOpen}
        onCancel={() => setIsArticleModalOpen(false)}
        onOk={() => articleForm.submit()}
      >
        <Form form={articleForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]} >
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]} >
            <Select>
              {mockCategories.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]} >
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建分类"
        open={isCategoryModalOpen}
        onCancel={() => setIsCategoryModalOpen(false)}
        onOk={() => categoryForm.submit()}
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]} >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
