import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Tabs,
  Space,
  Typography,
  message,
  Upload,
  List,
  Switch,
  Select,
} from 'antd/es';
import {
  SaveOutlined,
  UploadOutlined,
  RobotOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DragOutlined,
} from '@ant-design/icons';
import { useContentSections, useGenerateContent } from '../hooks/useApi';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// 模拟内容数据
const mockSections = [
  {
    id: '1',
    type: 'hero',
    title: '首页横幅',
    content: '欢迎来到我们的网站，为您提供最优质的服务',
    isVisible: true,
    order: 1,
  },
  {
    id: '2',
    type: 'about',
    title: '关于我们',
    content: '我们是一家专注于创新与品质的公司...',
    isVisible: true,
    order: 2,
  },
  {
    id: '3',
    type: 'services',
    title: '我们的服务',
    content: '提供全方位的专业服务解决方案',
    isVisible: true,
    order: 3,
  },
];

const ContentEditor: React.FC<{ value?: string; onChange?: (value: string) => void }> = ({ value, onChange }) => {
  return (
    <TextArea
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      rows={12}
      style={{ fontFamily: 'monospace' }}
      placeholder="支持 HTML 格式"
    />
  );
};

const ContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [form] = Form.useForm();
  const [sections, setSections] = useState(mockSections);
  const [editingSection, setEditingSection] = useState<typeof mockSections[0] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSave = () => {
    message.success('内容已保存');
  };

  const handleAIGenerate = async () => {
    setAiLoading(true);
    setTimeout(() => {
      message.success('AI 内容生成完成');
      setAiLoading(false);
    }, 2000);
  };

  const handleSectionUpdate = (id: string, updates: Partial<typeof mockSections[0]>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>内容管理</Title>
            <Text type="secondary">管理网站各页面的内容区块</Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<RobotOutlined />}
                loading={aiLoading}
                onClick={handleAIGenerate}
              >
                AI 生成内容
              </Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                保存更改
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="内容区块" style={{ marginBottom: 16 }}>
            <List
              dataSource={sections}
              renderItem={(section) => (
                <List.Item
                  actions={[
                    <Switch
                      checked={section.isVisible}
                      onChange={(checked) => handleSectionUpdate(section.id, { isVisible: checked })}
                      size="small"
                    />,
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => setEditingSection(section)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={section.title}
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {section.type === 'hero' && '首页横幅'}
                        {section.type === 'about' && '关于我们'}
                        {section.type === 'services' && '服务介绍'}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            <TabPane tab="首页横幅" key="hero">
              <Card>
                <Form layout="vertical" form={form}>
                  <Form.Item label="主标题" name="heroTitle">
                    <Input placeholder="输入主标题" size="large" />
                  </Form.Item>
                  
                  <Form.Item label="副标题" name="heroSubtitle">
                    <Input placeholder="输入副标题" />
                  </Form.Item>
                  
                  <Form.Item label="背景图片">
                    <Upload.Dragger name="files" action="/upload.do">
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                      </p>
                      <p className="ant-upload-text">点击或拖拽上传背景图片</p>
                      <p className="ant-upload-hint">支持 JPG, PNG, WEBP 格式</p>
                    </Upload.Dragger>
                  </Form.Item>
                  
                  <Form.Item label="按钮文字" name="ctaText">
                    <Input placeholder="例如：立即了解" />
                  </Form.Item>
                  
                  <Form.Item label="按钮链接" name="ctaLink">
                    <Input placeholder="例如：/about" />
                  </Form.Item>
                </Form>
              </Card>
            </TabPane>

            <TabPane tab="关于我们" key="about">
              <Card>
                <Form layout="vertical">
                  <Form.Item label="页面标题" name="aboutTitle">
                    <Input placeholder="输入页面标题" />
                  </Form.Item>
                  
                  <Form.Item label="公司简介" name="aboutContent">
                    <ContentEditor />
                  </Form.Item>
                  
                  <Form.Item label="公司图片">
                    <Upload
                      listType="picture-card"
                      action="/api/upload"
                    >
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>上传图片</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Form>
              </Card>
            </TabPane>

            <TabPane tab="服务介绍" key="services">
              <Card>
                <Form layout="vertical">
                  <Form.Item label="区块标题" name="servicesTitle">
                    <Input placeholder="输入区块标题" />
                  </Form.Item>
                  
                  <Form.Item label="服务列表">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {[1, 2, 3].map((i) => (
                        <Card key={i} size="small" title={`服务 ${i}`}>
                          <Form.Item label="服务名称" style={{ marginBottom: 8 }}>
                            <Input placeholder="服务名称" />
                          </Form.Item>
                          <Form.Item label="服务描述" style={{ marginBottom: 8 }}>
                            <TextArea rows={2} placeholder="服务描述" />
                          </Form.Item>
                          <Form.Item label="图标">
                            <Select placeholder="选择图标" style={{ width: '100%' }}>
                              <Select.Option value="setting">设置</Select.Option>
                              <Select.Option value="team">团队</Select.Option>
                              <Select.Option value="star">收藏</Select.Option>
                            </Select>
                          </Form.Item>
                        </Card>
                      ))}
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default ContentManagement;
