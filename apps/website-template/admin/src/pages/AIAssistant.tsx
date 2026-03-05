import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Steps,
  Progress,
  List,
  Tag,
  message,
  Tabs,
  Input,
  Select,
  Divider,
  Timeline,
  Result,
  Spin,
  Form,
} from 'antd/es';
import {
  RobotOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  FileTextOutlined,
  PictureOutlined,
  TranslationOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { AIGenerationTask } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// 模拟任务数据
const mockTasks: AIGenerationTask[] = [
  {
    id: '1',
    type: 'content',
    status: 'completed',
    prompt: '生成首页关于我们文案',
    result: '已生成',
    createdAt: '2024-03-05 10:00',
    completedAt: '2024-03-05 10:02',
  },
  {
    id: '2',
    type: 'product',
    status: 'completed',
    prompt: '为智能手表生成5个产品描述',
    result: '已生成',
    createdAt: '2024-03-05 09:30',
    completedAt: '2024-03-05 09:35',
  },
  {
    id: '3',
    type: 'image',
    status: 'processing',
    prompt: '生成产品展示背景图',
    createdAt: '2024-03-05 11:00',
  },
];

const AIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [batchMode, setBatchMode] = useState(false);
  const [generationType, setGenerationType] = useState('content');
  const [prompt, setPrompt] = useState('');
  const [tasks, setTasks] = useState<AIGenerationTask[]>(mockTasks);

  const generationTypes = [
    {
      value: 'content',
      label: '网站内容',
      icon: <FileTextOutlined />,
      description: '生成首页、关于我们、服务介绍等页面内容',
    },
    {
      value: 'product',
      label: '产品描述',
      icon: <GlobalOutlined />,
      description: '为产品生成吸引人的描述和卖点',
    },
    {
      value: 'seo',
      label: 'SEO 优化',
      icon: <ThunderboltOutlined />,
      description: '优化标题、描述和关键词',
    },
    {
      value: 'image',
      label: '图片生成',
      icon: <PictureOutlined />,
      description: '生成产品图、banner、背景图等',
    },
    {
      value: 'translate',
      label: '批量翻译',
      icon: <TranslationOutlined />,
      description: '将内容翻译成多种语言',
    },
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) {
      message.warning('请输入生成提示');
      return;
    }
    setGenerating(true);
    setCurrentStep(1);
    setProgress(0);

    // 模拟生成进度
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          setCurrentStep(2);
          message.success('生成完成！');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleBatchGenerate = () => {
    message.loading('开始批量生成任务...', 2);
    setTimeout(() => {
      message.success('批量任务已创建，将在后台执行');
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'processing':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'processing';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    const found = generationTypes.find((t) => t.value === type);
    return found?.label || type;
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <RobotOutlined /> AI 助手
            </Title>
            <Text type="secondary">智能生成内容、图片和优化建议</Text>
          </Col>
        </Row>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane
          tab={
            <span>
              <ThunderboltOutlined /> 一键生成
            </span>
          }
          key="generate"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card>
                {!generating && currentStep !== 2 ? (
                  <>
                    <div style={{ marginBottom: 24 }}>
                      <Title level={5}>选择生成类型</Title>
                      <Row gutter={[16, 16]}>
                        {generationTypes.map((type) => (
                          <Col xs={24} sm={12} md={8} key={type.value}>
                            <Card
                              hoverable
                              onClick={() => setGenerationType(type.value)}
                              style={{
                                cursor: 'pointer',
                                border:
                                  generationType === type.value
                                    ? '2px solid #1890ff'
                                    : '1px solid #f0f0f0',
                              }}
                            >
                              <div style={{ textAlign: 'center' }}>
                                <div
                                  style={{
                                    fontSize: 32,
                                    color:
                                      generationType === type.value
                                        ? '#1890ff'
                                        : '#8c8c8c',
                                    marginBottom: 8,
                                  }}
                                >
                                  {type.icon}
                                </div>
                                <Text strong>{type.label}</Text>
                                <Paragraph
                                  type="secondary"
                                  style={{ fontSize: 12, marginTop: 8 }}
                                >
                                  {type.description}
                                </Paragraph>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <Title level={5}>输入生成提示</Title>
                      <TextArea
                        rows={4}
                        placeholder="描述您想要生成的内容，例如：为科技产品公司生成一个专业的首页介绍文案，突出创新和品质..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>

                    <div>
                      <Space>
                        <Button
                          type="primary"
                          size="large"
                          icon={<RobotOutlined />}
                          onClick={handleGenerate}
                        >
                          开始生成
                        </Button>
                        <Button
                          size="large"
                          icon={<ThunderboltOutlined />}
                          onClick={handleBatchGenerate}
                        >
                          批量生成
                        </Button>
                      </Space>
                    </div>
                  </>
                ) : currentStep === 2 ? (
                  <Result
                    status="success"
                    title="生成完成！"
                    subTitle="AI 已成功生成内容，您可以选择应用或重新生成"
                    extra={[
                      <Button
                        type="primary"
                        key="apply"
                        onClick={() => {
                          setCurrentStep(0);
                          message.success('内容已应用到网站');
                        }}
                      >
                        应用内容
                      </Button>,
                      <Button
                        key="regenerate"
                        onClick={() => {
                          setCurrentStep(0);
                          setProgress(0);
                        }}
                      >
                        重新生成
                      </Button>,
                    ]}
                  >
                    <Card title="生成结果预览">
                      <Paragraph>
                        这是一段由 AI 生成的示例内容。实际使用时，这里会显示生成的具体内容。
                        内容根据您的提示进行创作，确保与您的品牌和网站风格一致。
                      </Paragraph>
                    </Card>
                  </Result>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 24 }}>
                      <Title level={4}>AI 正在生成内容...</Title>
                      <Progress percent={progress} style={{ maxWidth: 400, margin: '24px auto' }} />
                      <Paragraph type="secondary">
                        {progress < 30 && '正在分析您的需求...'}
                        {progress >= 30 && progress < 60 && '正在生成内容...'}
                        {progress >= 60 && progress < 90 && '正在优化和调整...'}
                        {progress >= 90 && '即将完成...'}
                      </Paragraph>
                    </div>
                  </div>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="智能推荐">
                <List
                  size="small"
                  dataSource={[
                    {
                      title: '生成完整首页内容',
                      description: '包含 Hero、About、Services 等区块',
                    },
                    {
                      title: '优化现有产品描述',
                      description: '为所有产品生成更吸引人的文案',
                    },
                    {
                      title: '创建 SEO 友好内容',
                      description: '优化标题和描述以提高搜索排名',
                    },
                    {
                      title: '生成多语言版本',
                      description: '将内容翻译成英文、日文等',
                    },
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button type="link" size="small">
                          执行
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={item.title}
                        description={
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.description}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>

              <Card title="使用提示" style={{ marginTop: 16 }}>
                <Timeline
                  items={[
                    {
                      dot: <BulbOutlined style={{ color: '#faad14' }} />,
                      children: '描述越详细，生成效果越好',
                    },
                    {
                      children: '可以指定风格，如"专业"、"活泼"、"简约"',
                    },
                    {
                      children: '支持批量生成，提高效率',
                    },
                    {
                      children: '生成内容可以进一步编辑调整',
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <TranslationOutlined /> 批量翻译
            </span>
          }
          key="translate"
        >
          <Card>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form layout="vertical">
                  <Form.Item label="源语言">
                    <Select defaultValue="zh">
                      <Select.Option value="zh">中文</Select.Option>
                      <Select.Option value="en">English</Select.Option>
                      <Select.Option value="ja">日本語</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="要翻译的内容">
                    <TextArea
                      rows={8}
                      placeholder="输入要翻译的内容..."
                    />
                  </Form.Item>
                </Form>
              </Col>

              <Col xs={24} md={12}>
                <Form layout="vertical">
                  <Form.Item label="目标语言">
                    <Select defaultValue="en" mode="multiple">
                      <Select.Option value="en">English</Select.Option>
                      <Select.Option value="ja">日本語</Select.Option>
                      <Select.Option value="ko">한국어</Select.Option>
                      <Select.Option value="fr">Français</Select.Option>
                      <Select.Option value="de">Deutsch</Select.Option>
                      <Select.Option value="es">Español</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="翻译结果">
                    <TextArea
                      rows={8}
                      placeholder="翻译结果将显示在这里..."
                      readOnly
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button type="primary" icon={<TranslationOutlined />} size="large">
                开始翻译
              </Button>
            </div>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <FileTextOutlined /> 任务历史
            </span>
          }
          key="history"
        >
          <Card>
            <List
              dataSource={tasks}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Tag color={getStatusColor(task.status)}>
                      {task.status === 'completed'
                        ? '已完成'
                        : task.status === 'processing'
                        ? '处理中'
                        : task.status === 'failed'
                        ? '失败'
                        : '待处理'}
                    </Tag>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={getStatusIcon(task.status)}
                    title={
                      <Space>
                        <Text>{task.prompt}</Text>
                        <Tag size="small">{getTypeLabel(task.type)}</Tag>
                      </Space>
                    }
                    description={
                      <Space split={<Divider type="vertical" />}>
                        <Text type="secondary">创建: {task.createdAt}</Text>
                        {task.completedAt && (
                          <Text type="secondary">完成: {task.completedAt}</Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AIAssistant;
