import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Tooltip,
  Tabs,
  Alert,
  Progress,
  Statistic,
  Row,
  Col,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloudOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  HddOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  fetchStorageConfigs,
  createStorageConfig,
  updateStorageConfig,
  deleteStorageConfig,
  testStorageConnection,
} from '../services/api'

const { Option } = Select
const { TabPane } = Tabs

const Storage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<any>(null)
  const [activeProvider, setActiveProvider] = useState('s3')
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: configs, isLoading } = useQuery('storageConfigs', fetchStorageConfigs)

  const createMutation = useMutation(createStorageConfig, {
    onSuccess: () => {
      message.success('Storage configuration created successfully')
      queryClient.invalidateQueries('storageConfigs')
      setIsModalOpen(false)
      form.resetFields()
    },
  })

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => updateStorageConfig(id, data),
    {
      onSuccess: () => {
        message.success('Storage configuration updated successfully')
        queryClient.invalidateQueries('storageConfigs')
        setIsModalOpen(false)
        setEditingConfig(null)
        form.resetFields()
      },
    }
  )

  const deleteMutation = useMutation(deleteStorageConfig, {
    onSuccess: () => {
      message.success('Storage configuration deleted successfully')
      queryClient.invalidateQueries('storageConfigs')
    },
  })

  const testMutation = useMutation(testStorageConnection, {
    onSuccess: (result) => {
      if (result.success) {
        message.success('Connection test successful')
      } else {
        message.error(`Connection test failed: ${result.message}`)
      }
    },
  })

  const handleSubmit = (values: any) => {
    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleEdit = (record: any) => {
    setEditingConfig(record)
    setActiveProvider(record.provider)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      render: (provider: string) => {
        const icons: Record<string, React.ReactNode> = {
          local: <HddOutlined />,
          s3: <CloudOutlined />,
          minio: <DatabaseOutlined />,
          sftp: <DatabaseOutlined />,
        }
        return (
          <Tag icon={icons[provider] || <CloudOutlined />}>
            {provider.toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Default',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean) =>
        isDefault ? <Tag color="blue">Default</Tag> : '-',
    },
    {
      title: 'Bucket/Path',
      dataIndex: 'bucket',
      key: 'bucket',
      render: (_: any, record: any) => record.bucket || record.localPath || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Test Connection">
            <Button
              type="text"
              icon={<ExperimentOutlined />}
              onClick={() => testMutation.mutate(record.id)}
              loading={testMutation.isLoading && testMutation.variables === record.id}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Configuration"
            description="Are you sure you want to delete this storage configuration?"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Storage</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingConfig(null)
            form.resetFields()
            setIsModalOpen(true)
          }}
        >
          Add Storage
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Configurations"
              value={configs?.length || 0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Storages"
              value={configs?.filter((c: any) => c.isActive).length || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Default Storage"
              value={configs?.find((c: any) => c.isDefault)?.provider?.toUpperCase() || 'None'}
              prefix={<CloudOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="card-hover">
        <Table
          columns={columns}
          dataSource={configs || []}
          rowKey="id"
          loading={isLoading}
          className="data-table"
        />
      </Card>

      <Modal
        title={editingConfig ? 'Edit Storage Configuration' : 'Add Storage Configuration'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingConfig(null)
          form.resetFields()
        }}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ provider: 's3', isActive: true, useSSL: true }}
        >
          <Form.Item
            name="name"
            label="Configuration Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Production S3 Storage" />
          </Form.Item>

          <Form.Item name="provider" label="Storage Provider">
            <Select onChange={(value) => setActiveProvider(value)}>
              <Option value="local">Local Storage</Option>
              <Option value="s3">Amazon S3</Option>
              <Option value="minio">MinIO</Option>
              <Option value="sftp">SFTP</Option>
            </Select>
          </Form.Item>

          {activeProvider === 'local' && (
            <Form.Item
              name="localPath"
              label="Local Path"
              rules={[{ required: true }]}
            >
              <Input placeholder="/app/backups" />
            </Form.Item>
          )}

          {(activeProvider === 's3' || activeProvider === 'minio') && (
            <>
              <Form.Item name="endpoint" label="Endpoint">
                <Input placeholder={activeProvider === 's3' ? 's3.amazonaws.com' : 'localhost:9000'} />
              </Form.Item>
              <Form.Item name="region" label="Region">
                <Input placeholder="us-east-1" />
              </Form.Item>
              <Form.Item name="bucket" label="Bucket" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="accessKeyId" label="Access Key ID" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="secretAccessKey" label="Secret Access Key" rules={[{ required: true }]}>
                <Input.Password />
              </Form.Item>
              <Form.Item name="useSSL" valuePropName="checked">
                <Switch checkedChildren="SSL On" unCheckedChildren="SSL Off" />
              </Form.Item>
            </>
          )}

          {activeProvider === 'sftp' && (
            <>
              <Form.Item name="sftpHost" label="Host" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="sftpPort" label="Port">
                <Input type="number" placeholder="22" />
              </Form.Item>
              <Form.Item name="sftpUsername" label="Username" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="sftpPassword" label="Password">
                <Input.Password />
              </Form.Item>
              <Form.Item name="sftpRemotePath" label="Remote Path">
                <Input placeholder="/backups" />
              </Form.Item>
            </>
          )}

          <Form.Item name="isActive" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item name="isDefault" valuePropName="checked">
            <Switch checkedChildren="Default" unCheckedChildren="Not Default" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Storage
