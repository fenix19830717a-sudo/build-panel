import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Row,
  Col,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { articlesApi, categoriesApi, aiApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

export function ArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [form] = Form.useForm();
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await articlesApi.getAll({ limit: 100 });
      setArticles(res.data.items);
    } catch (error) {
      message.error('获取文章失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingArticle) {
        await articlesApi.update(editingArticle.id, values);
        message.success('文章更新成功');
      } else {
        await articlesApi.create(values);
        message.success('文章创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingArticle(null);
      fetchArticles();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await articlesApi.delete(id);
      message.success('文章删除成功');
      fetchArticles();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleGenerateSummary = async () => {
    const content = form.getFieldValue('content');
    if (!content) {
      message.warning('请先输入文章内容');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiApi.generateSummary(content, 200);
      form.setFieldValue('excerpt', res.data.summary);
      message.success('摘要生成成功');
    } catch (error) {
      message.error('生成失败');
    } finally {
      setAiLoading(false);
    }
  };

  const handleOptimizeSEO = async () => {
    const content = form.getFieldValue('content');
    const title = form.getFieldValue('title');
    if (!content) {
      message.warning('请先输入文章内容');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiApi.optimizeSEO(content, title);
      form.setFieldsValue({
        metaTitle: res.data.title,
        metaDescription: res.data.description,
        metaKeywords: res.data.keywords.join(', '),
      });
      message.success('SEO优化成功');
    } catch (error) {
      message.error('优化失败');
    } finally {
      setAiLoading(false);
    }
  };

  const columns = [
    {
      title: '封面',
      dataIndex: 'coverImage',
      key: 'coverImage',
      width: 80,
      render: (url: string) =>
        url ? (
          <Image src={url} width={60} height={40} style={{ objectFit: 'cover' }} />
        ) : (
          '<无>'
        ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (cat: any) => cat?.name || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          published: 'success',
          draft: 'default',
          archived: 'warning',
        };
        const labels: Record<string, string> = {
          published: '已发布',
          draft: '草稿',
          archived: '已归档',
        };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      },
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/article/${record.slug}`, '_blank')}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingArticle(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="确定删除这篇文章吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>文章管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingArticle(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          新建文章
        </Button>
      </div>

      <Table
        dataSource={articles}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingArticle ? '编辑文章' : '新建文章'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          setEditingArticle(null);
          form.resetFields();
        }}
        width={900}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="标题"
                rules={[{ required: true, message: '请输入标题' }]}
              >
                <Input placeholder="文章标题" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                initialValue="draft"
              >
                <Select>
                  <Option value="draft">草稿</Option>
                  <Option value="published">已发布</Option>
                  <Option value="archived">已归档</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="categoryId" label="分类">
            <Select placeholder="选择分类" allowClear>
              {categories.map((cat: any) => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                内容
                <Button
                  size="small"
                  icon={<RobotOutlined />}
                  onClick={handleGenerateSummary}
                  loading={aiLoading}
                >
                  生成摘要
                </Button>
                <Button
                  size="small"
                  icon={<RobotOutlined />}
                  onClick={handleOptimizeSEO}
                  loading={aiLoading}
                >
                  SEO优化
                </Button>
              </div>
            }
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea rows={10} placeholder="支持 Markdown 格式" />
          </Form.Item>

          <Form.Item name="excerpt" label="摘要">
            <TextArea rows={2} placeholder="文章摘要，留空将自动生成" />
          </Form.Item>

          <Form.Item name="coverImage" label="封面图片 URL">
            <Input placeholder="https://..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="metaTitle" label="SEO 标题">
                <Input placeholder="SEO 标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="metaKeywords" label="SEO 关键词">
                <Input placeholder="关键词1, 关键词2" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="metaDescription" label="SEO 描述">
            <TextArea rows={2} placeholder="SEO 描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
