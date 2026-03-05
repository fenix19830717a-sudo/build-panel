import React, { useState } from 'react';
import Card from 'antd/es/card';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Tabs from 'antd/es/tabs';
import Space from 'antd/es/space';
import Typography from 'antd/es/typography';
import message from 'antd/es/message';
import Progress from 'antd/es/progress';
import List from 'antd/es/list';
import Tag from 'antd/es/tag';
import Switch from 'antd/es/switch';
import Divider from 'antd/es/divider';
import Alert from 'antd/es/alert';
import Statistic from 'antd/es/statistic';
import {
  SaveOutlined,
  SearchOutlined,
  RobotOutlined,
  FileTextOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useSEOConfig, useAnalyzeSEO, useOptimizeSEO } from '../hooks/useApi';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// 模拟 SEO 分析数据
const mockSEOAnalysis = {
  score: 78,
  checks: [
    { name: '标题标签', status: 'pass', message: '标题长度合适，包含关键词' },
    { name: 'Meta 描述', status: 'pass', message: '描述已设置且长度合适' },
    { name: 'H1 标签', status: 'pass', message: '页面包含一个 H1 标签' },
    { name: '图片 Alt 文本', status: 'warning', message: '部分图片缺少 Alt 文本' },
    { name: '内部链接', status: 'pass', message: '内部链接结构良好' },
    { name: '移动适配', status: 'pass', message: '页面已适配移动设备' },
    { name: '页面速度', status: 'warning', message: '页面加载速度可以优化' },
    { name: 'SSL 证书', status: 'pass', message: '网站已启用 HTTPS' },
  ],
  suggestions: [
    '为所有图片添加描述性的 Alt 文本',
    '优化图片大小以提高页面加载速度',
    '增加更多内部链接到相关内容',
    '在内容中自然地使用更多关键词变体',
  ],
};

const SEOSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://your-site.com/sitemap.xml`);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<typeof mockSEOAnalysis | null>(null);

  const handleSave = () => {
    message.success('SEO 设置已保存');
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult(mockSEOAnalysis);
      setAnalyzing(false);
      message.success('SEO 分析完成');
    }, 2000);
  };

  const handleOptimize = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      message.success('SEO 优化建议已生成');
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    return '需改进';
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>SEO 设置</Title>
            <Text type="secondary">优化您的网站搜索引擎排名</Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<SearchOutlined />}
                loading={analyzing}
                onClick={handleAnalyze}
              >
                分析 SEO
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
              >
                保存设置
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Tabs type="card" defaultActiveKey="general">
            <TabPane
              tab={
                <span>
                  <GlobalOutlined /> 基础设置
                </span>
              }
              key="general"
            >
              <Card>
                <Form layout="vertical" form={form}>
                  <Form.Item
                    label="网站标题"
                    name="siteTitle"
                    rules={[{ required: true, message: '请输入网站标题' }]}
                    extra="显示在浏览器标签页和搜索引擎结果中"
                  >
                    <Input placeholder="输入网站标题" maxLength={60} showCount />
                  </Form.Item>

                  <Form.Item
                    label="网站描述"
                    name="siteDescription"
                    extra="搜索引擎显示的简短描述"
                  >
                    <TextArea
                      rows={3}
                      placeholder="输入网站描述"
                      maxLength={160}
                      showCount
                    />
                  </Form.Item>

                  <Form.Item
                    label="网站关键词"
                    name="siteKeywords"
                    extra="用逗号分隔多个关键词"
                  >
                    <Input placeholder="例如：产品, 服务, 解决方案" />
                  </Form.Item>

                  <Form.Item label="规范网址 (Canonical URL)" name="canonicalUrl">
                    <Input placeholder="https://your-site.com" />
                  </Form.Item>

                  <Divider />

                  <Form.Item
                    label="社交媒体图片 (OG Image)"
                    name="ogImage"
                    extra="分享到社交媒体时显示的图片"
                  >
                    <Input placeholder="图片 URL" />
                  </Form.Item>

                  <Form.Item label="Twitter 账号" name="twitterHandle">
                    <Input placeholder="@yourhandle" />
                  </Form.Item>
                </Form>
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <FileTextOutlined /> Robots.txt
                </span>
              }
              key="robots"
            >
              <Card>
                <Alert
                  message="关于 Robots.txt"
                  description="此文件告诉搜索引擎哪些页面可以抓取，哪些不应该抓取。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Input.TextArea
                  rows={12}
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <RocketOutlined /> Sitemap
                </span>
              }
              key="sitemap"
            >
              <Card>
                <Form layout="vertical">
                  <Form.Item>
                    <Switch
                      checkedChildren="已启用"
                      unCheckedChildren="已禁用"
                      defaultChecked
                    />
                    <span style={{ marginLeft: 8 }}>自动生成 Sitemap</span>
                  </Form.Item>

                  <Alert
                    message="Sitemap 信息"
                    description={
                      <div>
                        <p>您的 Sitemap 地址：</p>
                        <code>https://your-site.com/sitemap.xml</code>
                      </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />

                  <Button type="primary">重新生成 Sitemap</Button>
                </Form>
              </Card>
            </TabPane>
          </Tabs>
        </Col>

        <Col xs={24} lg={8}>
          {analysisResult ? (
            <Card title="SEO 分析结果">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Progress
                  type="circle"
                  percent={analysisResult.score}
                  strokeColor={getScoreColor(analysisResult.score)}
                  size={120}
                />
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ color: getScoreColor(analysisResult.score), fontSize: 18 }}>
                    {getScoreStatus(analysisResult.score)}
                  </Text>
                </div>
              </div>

              <List
                size="small"
                dataSource={analysisResult.checks}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      {item.status === 'pass' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : item.status === 'warning' ? (
                        <InfoCircleOutlined style={{ color: '#faad14' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      )}
                      <span>{item.name}</span>
                    </Space>
                  </List.Item>
                )}
              />

              <Divider />

              <div>
                <Text strong>优化建议：</Text>
                <List
                  size="small"
                  dataSource={analysisResult.suggestions}
                  renderItem={(item) => (
                    <List.Item>
                      <Text type="secondary">• {item}</Text>
                    </List.Item>
                  )}
                />
              </div>

              <Button
                type="primary"
                icon={<RobotOutlined />}
                block
                style={{ marginTop: 16 }}
                loading={optimizing}
                onClick={handleOptimize}
              >
                AI 一键优化
              </Button>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <SearchOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <Paragraph type="secondary" style={{ marginTop: 16 }}>
                  点击"分析 SEO"按钮获取网站优化建议
                </Paragraph>
              </div>
            </Card>
          )}

          <Card title="快速链接" style={{ marginTop: 16 }}>
            <List size="small">
              <List.Item>
                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                  Google Search Console →
                </a>
              </List.Item>
              <List.Item>
                <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer">
                  Bing Webmaster Tools →
                </a>
              </List.Item>
              <List.Item>
                <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer">
                  Schema Markup 验证 →
                </a>
              </List.Item>
            </List>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SEOSettings;
