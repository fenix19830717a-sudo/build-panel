import React from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  DatePicker,
  Button,
  List,
  Avatar,
  Typography,
  Badge,
  Progress,
} from 'antd/es';
import {
  EyeOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  PictureOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  EditOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Column } from '@ant-design/charts';
import { useDashboardStats, useRecentActivities } from '../hooks/useApi';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 模拟数据 - 实际应从 API 获取
const mockStats = {
  totalVisits: 45231,
  uniqueVisitors: 12345,
  pageViews: 89321,
  avgSessionDuration: 245,
  bounceRate: 32.5,
  visitsGrowth: 12.5,
  visitorsGrowth: 8.3,
  pageViewsGrowth: -2.1,
  contentStats: {
    totalProducts: 48,
    totalPages: 12,
    totalMedia: 156,
    publishedPages: 10,
  },
};

const mockChartData = [
  { date: '03-01', visits: 3500, pageViews: 6800 },
  { date: '03-02', visits: 4200, pageViews: 7500 },
  { date: '03-03', visits: 3800, pageViews: 7200 },
  { date: '03-04', visits: 5100, pageViews: 8900 },
  { date: '03-05', visits: 4800, pageViews: 8500 },
  { date: '03-06', visits: 5600, pageViews: 9200 },
  { date: '03-07', visits: 6200, pageViews: 10500 },
];

const mockActivities = [
  { id: '1', action: '发布了新产品 "智能手表 Pro"', user: '张经理', time: '10分钟前', type: 'product' },
  { id: '2', action: '更新了关于我们页面', user: '李编辑', time: '30分钟前', type: 'content' },
  { id: '3', action: '使用AI生成了5张产品图片', user: '王设计', time: '1小时前', type: 'ai' },
  { id: '4', action: '修改了主题颜色配置', user: '张经理', time: '2小时前', type: 'theme' },
  { id: '5', action: '发布了新文章 "2024年趋势分析"', user: '李编辑', time: '3小时前', type: 'content' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const chartConfig = {
    data: mockChartData.flatMap(item => [
      { date: item.date, value: item.visits, type: '访问量' },
      { date: item.date, value: item.pageViews, type: '页面浏览' },
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    color: ['#1890ff', '#52c41a'],
    legend: {
      position: 'top',
    },
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <ShoppingOutlined style={{ color: '#52c41a' }} />;
      case 'content':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'ai':
        return <RobotOutlined style={{ color: '#722ed1' }} />;
      case 'theme':
        return <EditOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <UserOutlined />;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>仪表盘</Title>
            <Text type="secondary">欢迎回来，这里是您的网站数据概览</Text>
          </Col>
          <Col>
            <RangePicker style={{ marginRight: 8 }} />
            <Button type="primary">刷新数据</Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="总访问量"
              value={mockStats.totalVisits}
              prefix={<EyeOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> {mockStats.visitsGrowth}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="独立访客"
              value={mockStats.uniqueVisitors}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> {mockStats.visitorsGrowth}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="页面浏览"
              value={mockStats.pageViews}
              prefix={<FileTextOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#ff4d4f' }}>
                  <ArrowDownOutlined /> {Math.abs(mockStats.pageViewsGrowth)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="跳出率"
              value={mockStats.bounceRate}
              suffix="%"
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card
            title="访问趋势"
            extra={<Button type="link">查看详情</Button>}
          >
            <Column {...chartConfig} height={300} />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="内容统计">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text><ShoppingOutlined /> 产品数量</Text>
                <Text strong>{mockStats.contentStats.totalProducts}</Text>
              </div>
              <Progress percent={75} size="small" strokeColor="#52c41a" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text><FileTextOutlined /> 页面数量</Text>
                <Text strong>{mockStats.contentStats.totalPages}</Text>
              </div>
              <Progress percent={60} size="small" strokeColor="#1890ff" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text><PictureOutlined /> 媒体文件</Text>
                <Text strong>{mockStats.contentStats.totalMedia}</Text>
              </div>
              <Progress percent={85} size="small" strokeColor="#722ed1" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="最近活动"
            extra={<Button type="link">查看全部</Button>}
          >
            <List
              itemLayout="horizontal"
              dataSource={mockActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={getActivityIcon(item.type)} style={{ backgroundColor: '#f0f0f0' }} />
                    }
                    title={item.action}
                    description={
                      <div>
                        <Text type="secondary">{item.user}</Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>· {item.time}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="快速操作">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card.Grid
                  style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => navigate('/products/new')}
                >
                  <ShoppingOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                  <div>添加产品</div>
                </Card.Grid>
              </Col>
              <Col span={12}>
                <Card.Grid
                  style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => navigate('/pages/new')}
                >
                  <FileTextOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                  <div>新建页面</div>
                </Card.Grid>
              </Col>
              <Col span={12}>
                <Card.Grid
                  style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => navigate('/media')}
                >
                  <PictureOutlined style={{ fontSize: 24, color: '#722ed1', marginBottom: 8 }} />
                  <div>上传媒体</div>
                </Card.Grid>
              </Col>
              <Col span={12}>
                <Card.Grid
                  style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => navigate('/ai-assistant')}
                >
                  <RobotOutlined style={{ fontSize: 24, color: '#fa8c16', marginBottom: 8 }} />
                  <div>AI 助手</div>
                </Card.Grid>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
