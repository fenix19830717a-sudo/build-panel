import React, { useEffect, useState } from 'react';
import {
  Card, Table, Button, Space, Breadcrumb, Input, Modal, Form,
  message, Popconfirm, Tag
} from 'antd';
import {
  FolderOutlined, FileOutlined, ArrowUpOutlined, ReloadOutlined,
  DeleteOutlined, EditOutlined, FolderAddOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { fileApi } from '../utils/api';
import type { FileInfo } from '../types';

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [mkdirModalVisible, setMkdirModalVisible] = useState(false);
  const [editingFile, setEditingFile] = useState<{ path: string; content: string } | null>(null);
  const [mkdirForm] = Form.useForm();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fileApi.list(currentPath) as any;
      if (response.code === 0) {
        setFiles(response.data);
      } else {
        message.error(response.message);
      }
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleNavigateUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath('/' + parts.join('/'));
  };

  const handleEditFile = async (file: FileInfo) => {
    try {
      const response = await fileApi.getContent(file.path) as any;
      if (response.code === 0) {
        setEditingFile({ path: file.path, content: response.data.content });
        setEditModalVisible(true);
      } else {
        message.error(response.message);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;
    try {
      const response = await fileApi.saveContent(editingFile.path, editingFile.content) as any;
      if (response.code === 0) {
        message.success('File saved successfully');
        setEditModalVisible(false);
      } else {
        message.error(response.message);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleDelete = async (file: FileInfo) => {
    try {
      const response = await fileApi.delete(file.path) as any;
      if (response.code === 0) {
        message.success('Deleted successfully');
        fetchFiles();
      } else {
        message.error(response.message);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleMkdir = async () => {
    try {
      const values = await mkdirForm.validateFields();
      const newPath = currentPath === '/' ? `/${values.name}` : `${currentPath}/${values.name}`;
      const response = await fileApi.mkdir(newPath) as any;
      if (response.code === 0) {
        message.success('Directory created');
        setMkdirModalVisible(false);
        mkdirForm.resetFields();
        fetchFiles();
      } else {
        message.error(response.message);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: FileInfo) => (
        <Space>
          {record.type === 'directory' ? (
            <FolderOutlined style={{ color: '#faad14' }} />
          ) : (
            <FileOutlined style={{ color: '#1890ff' }} />
          )}
          <Button
            type="link"
            onClick={() => {
              if (record.type === 'directory') {
                handleNavigate(record.path);
              } else {
                handleEditFile(record);
              }
            }}
          >
            {name}
          </Button>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'directory' ? 'orange' : 'blue'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number, record: FileInfo) =>
        record.type === 'directory' ? '-' : formatSize(size)
    },
    {
      title: 'Modified',
      dataIndex: 'modifiedTime',
      key: 'modifiedTime',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FileInfo) => (
        <Space>
          {record.type === 'file' && (
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditFile(record)}
            >
              Edit
            </Button>
          )}
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => handleDelete(record)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 构建面包屑
  const pathParts = currentPath.split('/').filter(Boolean);
  const breadcrumbItems = [
    {
      title: <HomeOutlined />,
      onClick: () => handleNavigate('/')
    },
    ...pathParts.map((part, index) => ({
      title: part,
      onClick: () => handleNavigate('/' + pathParts.slice(0, index + 1).join('/'))
    }))
  ];

  return (
    <Card
      title={
        <Breadcrumb items={breadcrumbItems} />
      }
      extra={
        <Space>
          <Button
            icon={<ArrowUpOutlined />}
            onClick={handleNavigateUp}
            disabled={currentPath === '/'}
          >
            Up
          </Button>
          <Button
            icon={<FolderAddOutlined />}
            onClick={() => setMkdirModalVisible(true)}
          >
            New Folder
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchFiles}
          >
            Refresh
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={files}
        columns={columns}
        rowKey="path"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />

      {/* 编辑文件模态框 */}
      <Modal
        title="Edit File"
        open={editModalVisible}
        onOk={handleSaveFile}
        onCancel={() => setEditModalVisible(false)}
        width={800}
      >
        <Input.TextArea
          value={editingFile?.content || ''}
          onChange={e => setEditingFile(prev => prev ? { ...prev, content: e.target.value } : null)}
          rows={20}
          style={{ fontFamily: 'monospace' }}
        />
      </Modal>

      {/* 新建目录模态框 */}
      <Modal
        title="Create New Directory"
        open={mkdirModalVisible}
        onOk={handleMkdir}
        onCancel={() => {
          setMkdirModalVisible(false);
          mkdirForm.resetFields();
        }}
      >
        <Form form={mkdirForm}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter directory name' }]}
          >
            <Input placeholder="Directory name" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default FilesPage;
