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
  message,
  Popconfirm,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  fetchBackupJobs,
  createBackupJob,
  updateBackupJob,
  deleteBackupJob,
  triggerBackupJob,
} from '../services/api'

const { Option } = Select

const BackupJobs: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<any>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: jobs, isLoading } = useQuery('backupJobs', fetchBackupJobs)

  const createMutation = useMutation(createBackupJob, {
    onSuccess: () => {
      message.success('Backup job created successfully')
      queryClient.invalidateQueries('backupJobs')
      setIsModalOpen(false)
      form.resetFields()
    },
    onError: () => {
      message.error('Failed to create backup job')
    },
  })

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => updateBackupJob(id, data),
    {
      onSuccess: () => {
        message.success('Backup job updated successfully')
        queryClient.invalidateQueries('backupJobs')
        setIsModalOpen(false)
        setEditingJob(null)
        form.resetFields()
      },
    }
  )

  const deleteMutation = useMutation(deleteBackupJob, {
    onSuccess: () => {
      message.success('Backup job deleted successfully')
      queryClient.invalidateQueries('backupJobs')
    },
  })

  const triggerMutation = useMutation(triggerBackupJob, {
    onSuccess: () => {
      message.success('Backup job triggered successfully')
      queryClient.invalidateQueries('backupJobs')
    },
  })

  const handleSubmit = (values: any) => {
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleEdit = (record: any) => {
    setEditingJob(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{text}</span>
          <span style={{ fontSize: 12, color: '#999' }}>{record.description}</span>
        </Space>
      ),
    },
    {
      title: 'Database',
      dataIndex: ['database', 'name'],
      key: 'database',
    },
    {
      title: 'Type',
      dataIndex: 'backupType',
      key: 'backupType',
      render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
    },
    {
      title: 'Schedule',
      dataIndex: 'cronExpression',
      key: 'cronExpression',
      render: (cron: string) => (
        <Tooltip title="Cron Expression">
          <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>
            {cron}
          </code>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'success',
          paused: 'warning',
          disabled: 'default',
          error: 'error',
        }
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRunAt',
      key: 'lastRunAt',
      render: (date: string) =>
        date ? (
          <Space>
            <ClockCircleOutlined />
            {new Date(date).toLocaleString()}
          </Space>
        ) : (
          'Never'
        ),
    },
    {
      title: 'Next Run',
      dataIndex: 'nextRunAt',
      key: 'nextRunAt',
      render: (date: string) =>
        date ? (
          <Space>
            <SyncOutlined />
            {new Date(date).toLocaleString()}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: 'Stats',
      key: 'stats',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Success">
            <Tag color="success"><CheckCircleOutlined /> {record.successCount}</Tag>
          </Tooltip>
          <Tooltip title="Failed">
            <Tag color="error">{record.failureCount}</Tag>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Run Now">
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => triggerMutation.mutate(record.id)}
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
            title="Delete Job"
            description="Are you sure you want to delete this backup job?"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Backup Jobs</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingJob(null)
            form.resetFields()
            setIsModalOpen(true)
          }}
        >
          Create Job
        </Button>
      </div>

      <Card className="card-hover">
        <Table
          columns={columns}
          dataSource={jobs || []}
          rowKey="id"
          loading={isLoading}
          className="data-table"
        />
      </Card>

      <Modal
        title={editingJob ? 'Edit Backup Job' : 'Create Backup Job'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingJob(null)
          form.resetFields()
        }}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            backupType: 'full',
            cronExpression: '0 2 * * *',
            retentionValue: 7,
            retentionUnit: 'days',
            encryptBackup: true,
            compressBackup: true,
            verifyBackup: true,
            status: 'active',
          }}
        >
          <Form.Item
            name="name"
            label="Job Name"
            rules={[{ required: true, message: 'Please enter a job name' }]}
          >
            <Input placeholder="Daily Full Backup" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional description" />
          </Form.Item>

          <Form.Item
            name="databaseId"
            label="Target Database"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select database">
              <Option value="1">Production DB</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cronExpression"
            label="Schedule (Cron Expression)"
            rules={[{ required: true }]}
          >
            <Input placeholder="0 2 * * * (Daily at 2 AM)" />
          </Form.Item>

          <Form.Item name="backupType" label="Backup Type">
            <Select>
              <Option value="full">Full Backup</Option>
              <Option value="incremental">Incremental</Option>
              <Option value="differential">Differential</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Retention Policy">
            <Space>
              <Form.Item name="retentionValue" noStyle>
                <Input type="number" style={{ width: 100 }} />
              </Form.Item>
              <Form.Item name="retentionUnit" noStyle>
                <Select style={{ width: 120 }}>
                  <Option value="days">Days</Option>
                  <Option value="weeks">Weeks</Option>
                  <Option value="months">Months</Option>
                  <Option value="years">Years</Option>
                </Select>
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item name="encryptBackup" valuePropName="checked">
            <Switch checkedChildren="Encrypted" unCheckedChildren="Not Encrypted" />
          </Form.Item>

          <Form.Item name="compressBackup" valuePropName="checked">
            <Switch checkedChildren="Compressed" unCheckedChildren="Not Compressed" />
          </Form.Item>

          <Form.Item name="verifyBackup" valuePropName="checked">
            <Switch checkedChildren="Verify Enabled" unCheckedChildren="Verify Disabled" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BackupJobs
