import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Typography,
} from 'antd';
import {
  FileTextOutlined,
  EyeOutlined,
  FolderOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { articlesApi, categoriesApi, tagsApi } from '../services/api';

const { Title } = Typography;

export function DashboardPage() {
  const [stats, setStats] = useState({
    articles: 0,
    views: 0,
    categories: 0,
    tags: 0,
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
          articlesApi.getAll({ limit: 1 }),
          categoriesApi.getAll(),
          tagsApi.getAll(),
        ]);

        const articles = articlesRes.data.items;
        const totalViews = articles.reduce((sum: number, a: any) => sum + (a.views || 0), 0);

        setStats({
          articles: articlesRes.data.total,
          views: totalViews,
          categories: categoriesRes.data.length,
          tags: tagsRes.data.length,
        });

        // Get recent articles
        const recentRes = await articlesApi.getAll({ limit: 5, orderBy: 'createdAt', order: 'DESC' });
        setRecentArticles(recentRes.data.items);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
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
  ];

  return (
    <div>
      <Title level={2}>仪表盘</Title>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="文章总数"
              value={stats.articles}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={stats.views}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="分类数量"
              value={stats.categories}
              prefix={<FolderOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="标签数量"
              value={stats.tags}
              prefix={<TagsOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近文章" style={{ marginTop: 24 }} loading={loading}>
        <Table
          dataSource={recentArticles}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
