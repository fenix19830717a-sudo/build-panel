import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Upload,
  Button,
  Space,
  Modal,
  Image,
  Input,
  Select,
  Tabs,
  Empty,
  Typography,
  message,
  Spin,
  Pagination,
  Dropdown,
} from 'antd/es';
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  SearchOutlined,
  RobotOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FileOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { MediaItem } from '../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

// 模拟媒体数据
const mockMedia: MediaItem[] = [
  {
    id: '1',
    name: 'product-1.jpg',
    url: 'https://via.placeholder.com/300x300/1890ff/ffffff?text=Product+1',
    thumbnailUrl: 'https://via.placeholder.com/150x150/1890ff/ffffff?text=Product+1',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 1024000,
    width: 1200,
    height: 800,
    alt: '产品图片 1',
    createdAt: '2024-03-05',
  },
  {
    id: '2',
    name: 'banner-home.jpg',
    url: 'https://via.placeholder.com/300x300/52c41a/ffffff?text=Banner',
    thumbnailUrl: 'https://via.placeholder.com/150x150/52c41a/ffffff?text=Banner',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 2048000,
    width: 1920,
    height: 600,
    createdAt: '2024-03-04',
  },
  {
    id: '3',
    name: 'about-team.jpg',
    url: 'https://via.placeholder.com/300x300/fa8c16/ffffff?text=Team',
    thumbnailUrl: 'https://via.placeholder.com/150x150/fa8c16/ffffff?text=Team',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 1536000,
    width: 1600,
    height: 900,
    alt: '团队照片',
    createdAt: '2024-03-03',
  },
  {
    id: '4',
    name: 'intro-video.mp4',
    url: 'https://via.placeholder.com/300x300/722ed1/ffffff?text=Video',
    thumbnailUrl: 'https://via.placeholder.com/150x150/722ed1/ffffff?text=Video',
    type: 'video',
    mimeType: 'video/mp4',
    size: 10240000,
    createdAt: '2024-03-02',
  },
  {
    id: '5',
    name: 'brochure.pdf',
    url: '#',
    type: 'document',
    mimeType: 'application/pdf',
    size: 5120000,
    createdAt: '2024-03-01',
  },
];

const MediaLibrary: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <PictureOutlined style={{ fontSize: 48, color: '#1890ff' }} />;
      case 'video':
        return <VideoCameraOutlined style={{ fontSize: 48, color: '#722ed1' }} />;
      default:
        return <FileOutlined style={{ fontSize: 48, color: '#8c8c8c' }} />;
    }
  };

  const handleUpload = (info: { file: { status?: string; name?: string } }) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  };

  const handleDelete = (id: string) => {
    message.success('媒体文件已删除');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success('链接已复制到剪贴板');
  };

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) {
      message.warning('请输入图片描述');
      return;
    }
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      setIsAIModalOpen(false);
      message.success('AI 图片生成完成');
    }, 3000);
  };

  const filteredMedia = mockMedia.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesType =
      activeTab === 'all'
        ? true
        : activeTab === 'images'
        ? item.type === 'image'
        : activeTab === 'videos'
        ? item.type === 'video'
        : activeTab === 'documents'
        ? item.type === 'document'
        : true;
    return matchesSearch && matchesType;
  });

  const mediaMenuItems = (item: MediaItem) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: '查看',
      onClick: () => {
        setSelectedMedia(item);
        setIsModalOpen(true);
      },
    },
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: '复制链接',
      onClick: () => handleCopyUrl(item.url),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => handleDelete(item.id),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>媒体库</Title>
            <Text type="secondary">管理图片、视频和其他媒体文件</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<RobotOutlined />} onClick={() => setIsAIModalOpen(true)}>
                AI 生成图片
              </Button>
              <Upload
                action="/api/upload"
                multiple
                showUploadList={false}
                onChange={handleUpload}
              >
                <Button type="primary" icon={<UploadOutlined />}>
                  上传文件
                </Button>
              </Upload>
            </Space>
          </Col>
        </Row>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="搜索媒体文件"
              allowClear
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={16} lg={18}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
              size="small"
            >
              <TabPane
                tab={
                  <span>
                    <PictureOutlined /> 全部
                  </span>
                }
                key="all"
              />
              <TabPane
                tab={
                  <span>
                    <PictureOutlined /> 图片
                  </span>
                }
                key="images"
              />
              <TabPane
                tab={
                  <span>
                    <VideoCameraOutlined /> 视频
                  </span>
                }
                key="videos"
              />
              <TabPane
                tab={
                  <span>
                    <FileOutlined /> 文档
                  </span>
                }
                key="documents"
              />
            </Tabs>
          </Col>
        </Row>

        {filteredMedia.length === 0 ? (
          <Empty
            description="暂无媒体文件"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Upload action="/api/upload" multiple>
              <Button type="primary" icon={<UploadOutlined />}>
                上传文件
              </Button>
            </Upload>
          </Empty>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {filteredMedia.map((item) => (
                <Col xs={12} sm={8} md={6} lg={4} key={item.id}>
                  <Card
                    hoverable
                    cover={
                      item.type === 'image' ? (
                        <div style={{ position: 'relative', paddingTop: '100%' }}>
                          <Image
                            src={item.thumbnailUrl || item.url}
                            preview={false}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            paddingTop: '100%',
                            position: 'relative',
                            background: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            {getMediaIcon(item.type)}
                          </div>
                        </div>
                      )
                    }
                    bodyStyle={{ padding: '12px' }}
                    actions={[
                      <EyeOutlined
                        key="view"
                        onClick={() => {
                          setSelectedMedia(item);
                          setIsModalOpen(true);
                        }}
                      />,
                      <CopyOutlined key="copy" onClick={() => handleCopyUrl(item.url)} />,
                      <Dropdown
                        key="more"
                        menu={{ items: mediaMenuItems(item) }}
                        placement="bottomRight"
                      >
                        <MoreOutlined />
                      </Dropdown>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Text ellipsis={{ tooltip: item.name }} style={{ width: '100%' }}>
                          {item.name}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatFileSize(item.size)}
                          </Text>
                          {item.width && item.height && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {item.width} × {item.height}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Pagination total={filteredMedia.length} pageSize={24} showSizeChanger />
            </div>
          </>
        )}
      </Card>

      {/* 媒体详情模态框 */}
      <Modal
        title="媒体详情"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={() => selectedMedia && handleCopyUrl(selectedMedia.url)}>
            复制链接
          </Button>,
          <Button key="delete" danger icon={<DeleteOutlined />} onClick={() => selectedMedia && handleDelete(selectedMedia.id)}>
            删除
          </Button>,
        ]}
        width={800}
      >
        {selectedMedia && (
          <Row gutter={24}>
            <Col span={16}>
              {selectedMedia.type === 'image' ? (
                <Image src={selectedMedia.url} style={{ width: '100%' }} />
              ) : (
                <div
                  style={{
                    height: 300,
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getMediaIcon(selectedMedia.type)}
                </div>
              )}
            </Col>
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">文件名</Text>
                  <div>{selectedMedia.name}</div>
                </div>
                <div>
                  <Text type="secondary">类型</Text>
                  <div>{selectedMedia.mimeType}</div>
                </div>
                <div>
                  <Text type="secondary">大小</Text>
                  <div>{formatFileSize(selectedMedia.size)}</div>
                </div>
                {selectedMedia.width && selectedMedia.height && (
                  <div>
                    <Text type="secondary">尺寸</Text>
                    <div>
                      {selectedMedia.width} × {selectedMedia.height}
                    </div>
                  </div>
                )}
                <div>
                  <Text type="secondary">上传时间</Text>
                  <div>{selectedMedia.createdAt}</div>
                </div>
                <div>
                  <Text type="secondary">替代文本</Text>
                  <Input
                    defaultValue={selectedMedia.alt}
                    placeholder="输入替代文本"
                  />
                </div>
              </Space>
            </Col>
          </Row>
        )}
      </Modal>

      {/* AI 生成图片模态框 */}
      <Modal
        title="AI 生成图片"
        open={isAIModalOpen}
        onOk={handleAIGenerate}
        onCancel={() => setIsAIModalOpen(false)}
        confirmLoading={aiLoading}
        okText="生成"
        width={600}
      >
        <Spin spinning={aiLoading} tip="AI 正在生成图片...">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text>描述您想要的图片</Text>
              <Input.TextArea
                rows={4}
                placeholder="例如：一个现代科技感的办公空间，明亮的光线，简约的家具，绿植装饰..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>

            <div>
              <Text>图片风格</Text>
              <Select style={{ width: '100%' }} defaultValue="realistic">
                <Select.Option value="realistic">写实风格</Select.Option>
                <Select.Option value="cartoon">卡通风格</Select.Option>
                <Select.Option value="artistic">艺术风格</Select.Option>
                <Select.Option value="minimal">简约风格</Select.Option>
              </Select>
            </div>

            <div>
              <Text>图片比例</Text>
              <Select style={{ width: '100%' }} defaultValue="1:1">
                <Select.Option value="1:1">1:1 正方形</Select.Option>
                <Select.Option value="16:9">16:9 宽屏</Select.Option>
                <Select.Option value="4:3">4:3 标准</Select.Option>
                <Select.Option value="9:16">9:16 竖屏</Select.Option>
              </Select>
            </div>
          </Space>
        </Spin>
      </Modal>
    </div>
  );
};

export default MediaLibrary;
