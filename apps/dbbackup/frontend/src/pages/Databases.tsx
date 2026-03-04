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
  Badge,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { fetchDatabases, createDatabase, updateDatabase, deleteDatabase, testConnection } from '../services/api'

const { Option } = Select

const Databases: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [editingDatabase, setEditingDatabase] = useState<any>(null)
  const [testForm] = Form.useForm()
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: databases, isLoading } = useQuery('databases', fetchDatabases)

  const createMutation = useMutation(createDatabase, {
    onSuccess: () => {
      message.success('Database created successfully')
      queryClient.invalidateQueries('databases')
      setIsModalOpen(false)
      form.resetFields()
    },
    onError: () => {
      message.error('Failed to create database')
    },
  })

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => updateDatabase(id, data),
    {
      onSuccess: () => {
        message.success('Database updated successfully')
        queryClient.invalidateQueries('databases')
        setIsModalOpen(false)
        setEditingDatabase(null)
        form.resetFields()
      },
      onError: () => {
        message.error('Failed to update database')
      },
    }
  )

  const deleteMutation = useMutation(deleteDatabase, {
    onSuccess: () => {
      message.success('Database deleted successfully')
      queryClient.invalidateQueries('databases')
    },
    onError: () => {
      message.error('Failed to delete database')
    },
  })

  const testMutation = useMutation(testConnection, {
    onSuccess: (result) => {
      if (result.success) {
        message.success(`Connection successful: ${result.message}`)
      } else {
        message.error(`Connection failed: ${result.message}`)
      }
    },
    onError: () => {
      message.error('Connection test failed')
    },
  })

  const handleSubmit = (values: any) => {
    if (editingDatabase) {
      updateMutation.mutate({ id: editingDatabase.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleEdit = (record: any) => {
    setEditingDatabase(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const handleTest = (values: any) => {
    testMutation.mutate(values)
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <span>{text}</span>
          {!record.isActive && <Tag>Inactive</Tag>}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      render: (host: string, record: any) => `${host}:${record.port}`,
    },
    {
      title: 'Database',
      dataIndex: 'database',
      key: 'database',
    },
    {
      title: 'Status',
      dataIndex: 'connectionStatus',
      key: 'connectionStatus',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
          connected: { color: 'success', icon: <CheckCircleOutlined /> },
          disconnected: { color: 'default', icon: <CloseCircleOutlined /> },
          error: { color: 'error', icon: <CloseCircleOutlined /> },
          testing: { color: 'processing', icon: <SyncOutlined spin /> },
        }
        const config = statusConfig[status] || statusConfig.disconnected
        return (
          <Tag icon={config.icon} color={config.color}>
            {status.toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Test Connection">
            <Button
              type="text"
              icon={<SyncOutlined />}
              onClick={() => {
                testForm.setFieldsValue(record)
                setIsTestModalOpen(true)
              }}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {}}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Database"
            description="Are you sure you want to delete this database configuration?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Databases</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingDatabase(null)
            form.resetFields()
            setIsModalOpen(true)
          }}
        >
          Add Database
        </Button>
      </div>

      <Card className="card-hover">
        <Table
          columns={columns}
          dataSource={databases || []}
          rowKey="id"
          loading={isLoading}
          className="data-table"
        />
      </Card>

      <Modal
        title={editingDatabase ? 'Edit Database' : 'Add Database'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingDatabase(null)
          form.resetFields()
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ port: 5432, sslEnabled: false, isActive: true }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="Production Database" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Database Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="postgresql">PostgreSQL</Option>
              <Option value="mysql">MySQL</Option>
              <Option value="mongodb">MongoDB</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="host"
            label="Host"
            rules={[{ required: true }]}
          >
            <Input placeholder="localhost" />
          </Form.Item>

          <Form.Item
            name="port"
            label="Port"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="database"
            label="Database Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: !editingDatabase }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item name="sslEnabled" valuePropName="checked">
            <Switch checkedChildren="SSL On" unCheckedChildren="SSL Off" />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Test Connection"
        open={isTestModalOpen}
        onOk={() => testForm.submit()}
        onCancel={() => setIsTestModalOpen(false)}
        confirmLoading={testMutation.isLoading}
      >
        <Form form={testForm} layout="vertical" onFinish={handleTest}>
          <Form.Item name="type" label="Type">
            <Select disabled>
              <Option value="postgresql">PostgreSQL</Option>
              <Option value="mysql">MySQL</Option>
              <Option value="mongodb">MongoDB</Option>
            </Select>
          </Form.Item>
          <Form.Item name="host" label="Host">
            <Input disabled />
          </Form.Item>
          <Form.Item name="port" label="Port">
            <Input type="number" disabled />
          </Form.Item>
          <Form.Item name="database" label="Database">
            <Input disabled />
          </Form.Item>
          <Form.Item name="username" label="Username">
            <Input disabled />
          </Form.Item>
          <Form.Item name="password" label="Password">
            <Input.Password disabled />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Databases
