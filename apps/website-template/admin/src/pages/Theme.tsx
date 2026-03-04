import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  ColorPicker,
  Form,
  Input,
  Select,
  Upload,
  Button,
  Tabs,
  Radio,
  Space,
  Typography,
  Divider,
  message,
  Slider,
} from 'antd';
import {
  UploadOutlined,
  EyeOutlined,
  SaveOutlined,
  ReloadOutlined,
  LayoutOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
} from '@ant-design/icons';
import type { Color } from 'antd/es/color-picker';
import { useThemeStore } from '../stores';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 预设主题
const presetThemes = [
  {
    id: 'default',
    name: '默认蓝',
    primaryColor: '#1890ff',
    secondaryColor: '#52c41a',
    backgroundColor: '#ffffff',
    textColor: '#262626',
  },
  {
    id: 'purple',
    name: '优雅紫',
    primaryColor: '#722ed1',
    secondaryColor: '#eb2f96',
    backgroundColor: '#f9f0ff',
    textColor: '#1f1f1f',
  },
  {
    id: 'dark',
    name: '暗夜黑',
    primaryColor: '#177ddc',
    secondaryColor: '#49aa19',
    backgroundColor: '#141414',
    textColor: '#d9d9d9',
  },
  {
    id: 'warm',
    name: '温暖橙',
    primaryColor: '#fa8c16',
    secondaryColor: '#f5222d',
    backgroundColor: '#fff7e6',
    textColor: '#434343',
  },
  {
    id: 'nature',
    name: '自然绿',
    primaryColor: '#52c41a',
    secondaryColor: '#13c2c2',
    backgroundColor: '#f6ffed',
    textColor: '#262626',
  },
  {
    id: 'elegant',
    name: '商务灰',
    primaryColor: '#262626',
    secondaryColor: '#595959',
    backgroundColor: '#ffffff',
    textColor: '#1f1f1f',
  },
];

const fontOptions = [
  { value: 'system-ui', label: '系统默认' },
  { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: '"PingFang SC", "Microsoft YaHei", sans-serif', label: '苹方/微软雅黑' },
  { value: '"Noto Sans SC", sans-serif', label: '思源黑体' },
  { value: '"Noto Serif SC", serif', label: '思源宋体' },
];

const layoutOptions = [
  { value: 'default', label: '默认布局', icon: '□' },
  { value: 'sidebar', label: '侧边栏布局', icon: '▤' },
  { value: 'top', label: '顶部导航布局', icon: '▭' },
];

const ThemeConfig: React.FC = () => {
  const { currentTheme, updateTheme, setTheme } = useThemeStore();
  const [form] = Form.useForm();
  const [previewMode, setPreviewMode] = useState(false);

  const handleColorChange = (color: Color, field: string) => {
    updateTheme({ [field]: color.toHexString() });
  };

  const handleThemeSelect = (theme: typeof presetThemes[0]) => {
    setTheme({
      ...currentTheme,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
    });
    message.success(`已切换到 ${theme.name} 主题`);
  };

  const handleSave = () => {
    message.success('主题配置已保存');
  };

  const handleReset = () => {
    const defaultTheme = presetThemes[0];
    setTheme({
      ...currentTheme,
      ...defaultTheme,
    });
    message.info('已重置为默认主题');
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>主题配置</Title>
            <Text type="secondary">自定义您的网站外观和风格</Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<EyeOutlined />}
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? '退出预览' : '实时预览'}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                保存配置
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={previewMode ? 12 : 24}>
          <Tabs defaultActiveKey="themes" type="card">
            <TabPane
              tab={
                <span>
                  <LayoutOutlined /> 主题选择
                </span>
              }
              key="themes"
            >
              <Card title="预设主题" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  {presetThemes.map((theme) => (
                    <Col xs={12} sm={8} md={6} key={theme.id}>
                      <Card
                        hoverable
                        onClick={() => handleThemeSelect(theme)}
                        style={{
                          cursor: 'pointer',
                          border:
                            currentTheme.primaryColor === theme.primaryColor
                              ? '2px solid #1890ff'
                              : '1px solid #f0f0f0',
                        }}
                        bodyStyle={{ padding: 16 }}
                      >
                        <div
                          style={{
                            height: 80,
                            background: theme.backgroundColor,
                            borderRadius: 8,
                            marginBottom: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              background: theme.primaryColor,
                              borderRadius: 4,
                            }}
                          />
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              background: theme.secondaryColor,
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <Text strong>{theme.name}</Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>

              <Card title="布局设置">
                <Radio.Group
                  value={currentTheme.layout}
                  onChange={(e) => updateTheme({ layout: e.target.value })}
                >
                  <Space direction="vertical">
                    {layoutOptions.map((layout) => (
                      <Radio key={layout.value} value={layout.value}>
                        <Space>
                          <span style={{ fontSize: 20 }}>{layout.icon}</span>
                          <span>{layout.label}</span>
                        </Space>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <BgColorsOutlined /> 颜色配置
                </span>
              }
              key="colors"
            >
              <Form layout="vertical" form={form}>
                <Card title="主题色" style={{ marginBottom: 16 }}>
                  <Row gutter={24}>
                    <Col xs={24} sm={12}>
                      <Form.Item label="主色调">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <ColorPicker
                            value={currentTheme.primaryColor}
                            onChange={(color) => handleColorChange(color, 'primaryColor')}
                            showText
                          />
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="辅助色">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <ColorPicker
                            value={currentTheme.secondaryColor}
                            onChange={(color) => handleColorChange(color, 'secondaryColor')}
                            showText
                          />
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                <Card title="背景与文字">
                  <Row gutter={24}>
                    <Col xs={24} sm={12}>
                      <Form.Item label="背景色">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <ColorPicker
                            value={currentTheme.backgroundColor}
                            onChange={(color) => handleColorChange(color, 'backgroundColor')}
                            showText
                          />
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label="文字颜色">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <ColorPicker
                            value={currentTheme.textColor}
                            onChange={(color) => handleColorChange(color, 'textColor')}
                            showText
                          />
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Form>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <FontSizeOutlined /> 字体与Logo
                </span>
              }
              key="typography"
            >
              <Card title="字体设置" style={{ marginBottom: 16 }}>
                <Form layout="vertical">
                  <Form.Item label="字体族">
                    <Select
                      value={currentTheme.fontFamily}
                      onChange={(value) => updateTheme({ fontFamily: value })}
                      options={fontOptions}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                  
                  <Form.Item label="字体预览">
                    <div
                      style={{
                        padding: 16,
                        background: '#f5f5f5',
                        borderRadius: 8,
                        fontFamily: currentTheme.fontFamily,
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 8 }}>字体预览示例</div>
                      <div style={{ fontSize: 14 }}>
                        The quick brown fox jumps over the lazy dog.
                        1234567890
                      </div>
                    </div>
                  </Form.Item>
                </Form>
              </Card>

              <Card title="品牌标识">
                <Form layout="vertical">
                  <Form.Item label="网站Logo">
                    <Upload
                      name="logo"
                      listType="picture-card"
                      showUploadList={false}
                      action="/api/upload"
                    >
                      {currentTheme.logo ? (
                        <img
                          src={currentTheme.logo}
                          alt="logo"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>上传Logo</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                  
                  <Form.Item label="浏览器图标 (Favicon)">
                    <Upload
                      name="favicon"
                      listType="picture-card"
                      showUploadList={false}
                      action="/api/upload"
                    >
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>上传 Favicon</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Form>
              </Card>
            </TabPane>
          </Tabs>
        </Col>

        {previewMode && (
          <Col xs={24} lg={12}>
            <Card
              title="实时预览"
              bodyStyle={{ padding: 0 }}
              style={{ position: 'sticky', top: 24 }}
            >
              <div
                style={{
                  height: 600,
                  background: currentTheme.backgroundColor,
                  color: currentTheme.textColor,
                  fontFamily: currentTheme.fontFamily,
                  overflow: 'auto',
                  padding: 24,
                }}
              >
                {/* 模拟网站头部 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 0',
                    borderBottom: `1px solid ${currentTheme.textColor}20`,
                    marginBottom: 32,
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>品牌名称</div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {['首页', '产品', '关于', '联系'].map((item) => (
                      <span key={item} style={{ cursor: 'pointer' }}>{item}</span>
                    ))}
                  </div>
                </div>

                {/* 模拟Hero区域 */}
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <h1 style={{ fontSize: 48, marginBottom: 16 }}>欢迎来到我们的网站</h1>
                  <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 32 }}>
                    这是一个使用您自定义主题配置的预览示例
                  </p>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <button
                      style={{
                        padding: '12px 32px',
                        background: currentTheme.primaryColor,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 16,
                        cursor: 'pointer',
                      }}
                    >
                      主按钮
                    </button>
                    <button
                      style={{
                        padding: '12px 32px',
                        background: 'transparent',
                        color: currentTheme.secondaryColor,
                        border: `2px solid ${currentTheme.secondaryColor}`,
                        borderRadius: 6,
                        fontSize: 16,
                        cursor: 'pointer',
                      }}
                    >
                      次要按钮
                    </button>
                  </div>
                </div>

                {/* 模拟内容卡片 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 48 }}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        padding: 24,
                        background: `${currentTheme.textColor}08`,
                        borderRadius: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          background: currentTheme.primaryColor,
                          borderRadius: 8,
                          marginBottom: 16,
                        }}
                      />
                      <h3 style={{ marginBottom: 8 }}>功能标题 {i}</h3>
                      <p style={{ opacity: 0.7 }}>这是一段示例文字，展示了您的主题配置效果。</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ThemeConfig;
