import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Tabs,
  Space,
  Typography,
  message,
  Spin,
  Tag,
} from 'antd';
import {
  RobotOutlined,
  CopyOutlined,
  FileTextOutlined,
  TagOutlined,
  FileSearchOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { aiApi } from '../services/api';

const { TextArea } = Input;
const { Title, Text } = Typography;

export function AiPage() {
  const [activeTab, setActiveTab] = useState('write');
  const [loading, setLoading] = useState(false);

  // Write Article
  const [writePrompt, setWritePrompt] = useState('');
  const [writeResult, setWriteResult] = useState<{ title?: string; content?: string }>({});
  const [writeOptions, setWriteOptions] = useState({
    tone: 'professional',
    length: 'medium',
    language: 'zh',
  });

  // Summary
  const [summaryContent, setSummaryContent] = useState('');
  const [summaryResult, setSummaryResult] = useState('');

  // SEO
  const [seoContent, setSeoContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoResult, setSeoResult] = useState<any>({});

  // Tags
  const [tagsContent, setTagsContent] = useState('');
  const [tagsResult, setTagsResult] = useState<string[]>([]);

  // Improve
  const [improveContent, setImproveContent] = useState('');
  const [improveType, setImproveType] = useState<'grammar' | 'style' | 'clarity'>('clarity');
  const [improveResult, setImproveResult] = useState('');

  const handleWriteArticle = async () => {
    if (!writePrompt.trim()) {
      message.warning('请输入写作提示');
      return;
    }
    setLoading(true);
    try {
      const res = await aiApi.writeArticle(writePrompt, writeOptions);
      setWriteResult(res.data);
      message.success('文章生成成功');
    } catch (error) {
      message.error('生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!summaryContent.trim()) {
      message.warning('请输入文章内容');
      return;
    }
    setLoading(true);
    try {
      const res = await aiApi.generateSummary(summaryContent, 200);
      setSummaryResult(res.data.summary);
      message.success('摘要生成成功');
    } catch (error) {
      message.error('生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeSEO = async () => {
    if (!seoContent.trim()) {
      message.warning('请输入文章内容');
      return;
    }
    setLoading(true);
    try {
      const res = await aiApi.optimizeSEO(seoContent, seoTitle);
      setSeoResult(res.data);
      message.success('SEO优化成功');
    } catch (error) {
      message.error('优化失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTags = async () => {
    if (!tagsContent.trim()) {
      message.warning('请输入文章内容');
      return;
    }
    setLoading(true);
    try {
      const res = await aiApi.suggestTags(tagsContent);
      setTagsResult(res.data.tags);
      message.success('标签推荐成功');
    } catch (error) {
      message.error('推荐失败');
    } finally {
      setLoading(false);
    }
  };

  const handleImproveWriting = async () => {
    if (!improveContent.trim()) {
      message.warning('请输入需要改进的内容');
      return;
    }
    setLoading(true);
    try {
      const res = await aiApi.improveWriting(improveContent, improveType);
      setImproveResult(res.data.improved);
      message.success('内容改进成功');
    } catch (error) {
      message.error('改进失败');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  const items = [
    {
      key: 'write',
      label: (
        <span>
          <FileTextOutlined /> AI写文章
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card title="写作提示" size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Input
                  placeholder="输入文章主题或要求..."
                  value={writePrompt}
                  onChange={(e) => setWritePrompt(e.target.value)}
                />
                <Space>
                  <Input
                    placeholder="语气"
                    value={writeOptions.tone}
                    onChange={(e) => setWriteOptions({ ...writeOptions, tone: e.target.value })}
                    style={{ width: 100 }}
                  />
                  <Input
                    placeholder="长度"
                    value={writeOptions.length}
                    onChange={(e) => setWriteOptions({ ...writeOptions, length: e.target.value })}
                    style={{ width: 100 }}
                  />
                </Space>

                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={handleWriteArticle}
                  loading={loading}
                  block
                >
                  生成文章
                </Button>
              </Space>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title="生成结果"
              size="small"
              extra={
                writeResult.content && (
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(writeResult.content || '')}
                  >
                    复制
                  </Button>
                )
              }
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                  <p>AI正在创作中...\u003c/p>
                </div>
              ) : writeResult.content ? (
                <div>
                  {writeResult.title && (
                    <Title level={4}>{writeResult.title}</Title>
                  )}
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {writeResult.content}
                  </pre>
                </div>
              ) : (
                <Text type="secondary">生成结果将显示在这里</Text>
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'summary',
      label: (
        <span>
          <FileSearchOutlined /> 生成摘要
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card title="文章内容" size="small">
              <TextArea
                rows={10}
                placeholder="输入文章内容..."
                value={summaryContent}
                onChange={(e) => setSummaryContent(e.target.value)}
              />
              <Button
                type="primary"
                icon={<RobotOutlined />}
                onClick={handleGenerateSummary}
                loading={loading}
                style={{ marginTop: 16 }}
                block
              >
                生成摘要
              </Button>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title="摘要结果"
              size="small"
              extra={
                summaryResult && (
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(summaryResult)}
                  >
                    复制
                  </Button>
                )
              }
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : summaryResult ? (
                <Text>{summaryResult}</Text>
              ) : (
                <Text type="secondary">摘要将显示在这里</Text>
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'seo',
      label: (
        <span>
          <FileSearchOutlined /> SEO优化
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card title="输入内容" size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Input
                  placeholder="当前标题（可选）"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
                <TextArea
                  rows={8}
                  placeholder="输入文章内容..."
                  value={seoContent}
                  onChange={(e) => setSeoContent(e.target.value)}
                />

                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={handleOptimizeSEO}
                  loading={loading}
                  block
                >
                  优化SEO
                </Button>
              </Space>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="SEO建议" size="small">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : seoResult.title ? (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <Text type="secondary">SEO标题</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text copyable>{seoResult.title}</Text>
                    </div>
                  </div>
                  
                  <div>
                    <Text type="secondary">SEO描述</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text copyable>{seoResult.description}</Text>
                    </div>
                  </div>
                  
                  <div>
                    <Text type="secondary">关键词</Text>
                    <div style={{ marginTop: 8 }}>
                      {seoResult.keywords?.map((kw: string) => (
                        <Tag key={kw} color="blue">{kw}</Tag>
                      ))}
                    </div>
                  </div>
                </Space>
              ) : (
                <Text type="secondary">SEO优化建议将显示在这里</Text>
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'tags',
      label: (
        <span>
          <TagOutlined /> 推荐标签
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card title="文章内容" size="small">
              <TextArea
                rows={10}
                placeholder="输入文章内容..."
                value={tagsContent}
                onChange={(e) => setTagsContent(e.target.value)}
              />
              <Button
                type="primary"
                icon={<RobotOutlined />}
                onClick={handleSuggestTags}
                loading={loading}
                style={{ marginTop: 16 }}
                block
              >
                推荐标签
              </Button>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="推荐标签" size="small">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : tagsResult.length > 0 ? (
                <div>
                  {tagsResult.map((tag) => (
                    <Tag key={tag} color="blue" style={{ margin: 4 }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              ) : (
                <Text type="secondary">标签推荐将显示在这里</Text>
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'improve',
      label: (
        <span>
          <EditOutlined /> 改进写作
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card title="原始内容" size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Input
                  value={improveType}
                  onChange={(e) => setImproveType(e.target.value as any)}
                  placeholder="grammar | style | clarity"
                />
                <TextArea
                  rows={8}
                  placeholder="输入需要改进的内容..."
                  value={improveContent}
                  onChange={(e) => setImproveContent(e.target.value)}
                />

                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={handleImproveWriting}
                  loading={loading}
                  block
                >
                  改进内容
                </Button>
              </Space>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              title="改进结果"
              size="small"
              extra={
                improveResult && (
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(improveResult)}
                  >
                    复制
                  </Button>
                )
              }
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : improveResult ? (
                <Text>{improveResult}</Text>
              ) : (
                <Text type="secondary">改进后的内容将显示在这里</Text>
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>AI 助手</Title>
      <Text type="secondary">
        利用 AI 辅助内容创作，提升写作效率
      </Text>

      <Card style={{ marginTop: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
        />
      </Card>
    </div>
  );
}
