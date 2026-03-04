import { useState, useEffect } from 'react';
import {
  Card,
  Upload,
  Button,
  Image,
  Space,
  Modal,
  message,
  Row,
  Col,
  Typography,
  Tooltip,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { mediaApi } from '../services/api';

const { Text } = Typography;

export function MediaPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await mediaApi.getAll({ limit: 100 });
      setFiles(res.data.items);
    } catch (error) {
      message.error('获取媒体文件失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await mediaApi.upload(formData);
      onSuccess?.(res.data);
      message.success('上传成功');
      fetchMedia();
    } catch (error) {
      onError?.(error);
      message.error('上传失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await mediaApi.delete(id);
      message.success('删除成功');
      fetchMedia();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success('链接已复制');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (type: string) => type.startsWith('image/');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>媒体库</h2>
        <Upload
          customRequest={handleUpload}
          showUploadList={false}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        >
          <Button type="primary" icon={<UploadOutlined />}>
            上传文件
          </Button>
        </Upload>
      </div>

      <Row gutter={[16, 16]}>
        {files.map((file) => (
          <Col xs={12} sm={8} md={6} lg={4} key={file.id}>
            <Card
              hoverable
              cover={
                isImage(file.mimeType) ? (
                  <Image
                    src={file.url}
                    alt={file.originalName}
                    style={{ height: 150, objectFit: 'cover' }}
                    preview={false}
                  />
                ) : (
                  <div
                    style={{
                      height: 150,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5',
                    }}
                  >
                    <Text type="secondary">{file.mimeType}</Text>
                  </div>
                )
              }
              actions={[
                <Tooltip title="预览" key="preview">
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setPreviewImage(file.url);
                      setPreviewVisible(true);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="复制链接" key="copy">
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyUrl(file.url)}
                  />
                </Tooltip>,
                <Tooltip title="删除" key="delete">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(file.id)}
                  />
                </Tooltip>,
              ]}
            >
              <Card.Meta
                title={<Text ellipsis={{ tooltip: file.originalName }}>{file.originalName}</Text>}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatFileSize(file.size)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(file.createdAt).toLocaleDateString('zh-CN')}
                    </Text>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
}
