import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  Progress,
  Tooltip,
  message,
  Popconfirm,
  Badge,
  Descriptions,
} from 'antd'
import {
  PlusOutlined,
  DownloadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  fetchBackups,
  fetchBackupJobs,
  createBackup,
  deleteBackup,
  downloadBackup,
  verifyBackup,
  createBackupJob,
  updateBackupJob,
  deleteBackupJob,
} from '../services/api'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select

const Backups: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'backups' | 'jobs'>('backups')
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<any>(null)
  const [backupForm] = Form.useForm()
  const [jobForm] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: backups, isLoading: backupsLoading } = useQuery('backups', fetchBackups)
  const { data: jobs, isLoading: jobsLoading } = useQuery('backupJobs', fetchBackupJobs)

  const createBackupMutation = useMutation(createBackup, {
    onSuccess: () => {
      message.success('Backup started successfully')
      queryClient.invalidateQueries('backups')
      setIsBackupModalOpen(false)
      backupForm.resetFields()
    },
    onError: () => {
      message.error('Failed to start backup')
    },
  })

  const deleteBackupMutation = useMutation(deleteBackup, {
    onSuccess: () => {
      message.success('Backup deleted successfully')
      queryClient.invalidateQueries('backups')
    },
    onError: () => {
      message.error('Failed to delete backup')
    },
  })

  const verifyBackupMutation = useMutation(verifyBackup, {
    onSuccess: (result) => {
      if (result.valid) {
        message.success(result.message)
      } else {
        message.error(result.message)
      }
      queryClient.invalidateQueries('backups')
    },
  })

  const createJobMutation = useMutation(createBackupJob, {
    onSuccess: () => {
      message.success('Backup job created successfully')
      queryClient.invalidateQueries('backupJobs')
      setIsJobModalOpen(false)
      jobForm.resetFields()
    },
  })

  const deleteJobMutation = useMutation(deleteBackupJob, {
    onSuccess: () => {
      message.success('Backup job deleted successfully')
      queryClient.invalidateQueries('backupJobs')
    },
  })

  const handleCreateBackup = (values: any) => {
    createBackupMutation.mutate(values)
  }

  const handleCreateJob = (values: any) => {
    createJobMutation.mutate(values)
  }

  const handleDownload = async (id: string, filename: string) => {
    try {
      const blob = await downloadBackup(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      message.error('Failed to download backup')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const backupColumns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Database',
      dataIndex: ['database', 'name'],
      key: 'database',
    },
    {
      title: 'Type',
      dataIndex: 'isManual',
      key: 'type',
      render: (isManual: boolean) => (
        <Tag color={isManual ? 'blue' : 'green'}>
          {isManual ? 'Manual' : 'Scheduled'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode }> = {
          completed: { color: 'success', icon: <CheckCircleOutlined /> },
          verified: { color: 'success', icon: <CheckCircleOutlined /> },
          failed: { color: 'error', icon: <DeleteOutlined /> },
          running: { color: 'processing', icon: <SyncOutlined spin /> },
          pending: { color: 'warning', icon: <PlayCircleOutlined /> },
          verifying: { color: 'processing', icon: <SyncOutlined spin /> },
        }
        const c = config[status] || { color: 'default', icon: null }
        return <Tag color={c.color}>{c.icon} {status.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatBytes(size),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => duration ? `${duration}s` : '-',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedBackup(record)
                setIsDetailModalOpen(true)
              }}
            />
          </Tooltip>
          {(record.status === 'completed' || record.status === 'verified') && (
            <>
              <Tooltip title="Download">
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(record.id, record.fileName)}
                />
              </Tooltip>
              <Tooltip title="Verify">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  onClick={() => verifyBackupMutation.mutate(record.id)}
                  loading={verifyBackupMutation.isLoading && verifyBackupMutation.variables === record.id}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title="Delete Backup"
            description="Are you sure you want to delete this backup?"
            onConfirm={() => deleteBackupMutation.mutate(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const jobColumns: ColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
      render: (cron: string) => <code>{cron}</code>,
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
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRunAt',
      key: 'lastRunAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : 'Never',
    },
    {
      title: 'Next Run',
      dataIndex: 'nextRunAt',
      key: 'nextRunAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} />
          <Popconfirm
            title="Delete Job"
            description="Are you sure you want to delete this backup job?"
            onConfirm={() => deleteJobMutation.mutate(record.id)}
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
        <h1 className="page-title">Backups</h1>
        <Space>
          <Button
            type={activeTab === 'backups' ? 'primary' : 'default'}
            onClick={() => setActiveTab('backups')}
          >
            Backups
          </Button>
          <Button
            type={activeTab === 'jobs' ? 'primary' : 'default'}
            onClick={() => setActiveTab('jobs')}
          >
            Backup Jobs
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => activeTab === 'backups' ? setIsBackupModalOpen(true) : setIsJobModalOpen(true)}
          >
            {activeTab === 'backups' ? 'Create Backup' : 'Create Job'}
          </Button>
        </Space>
      </div>

      <Card className="card-hover">
        {activeTab === 'backups' ? (
          <Table
            columns={backupColumns}
            dataSource={backups || []}
            rowKey="id"
            loading={backupsLoading}
            className="data-table"
          />
        ) : (
          <Table
            columns={jobColumns}
            dataSource={jobs || []}
            rowKey="id"
            loading={jobsLoading}
            className="data-table"
          />
        )}
      </Card>

      {/* Create Backup Modal */}
      <Modal
        title="Create Backup"
        open={isBackupModalOpen}
        onOk={() => backupForm.submit()}
        onCancel={() => {
          setIsBackupModalOpen(false)
          backupForm.resetFields()
        }}
        confirmLoading={createBackupMutation.isLoading}
      >
        <Form
          form={backupForm}
          layout="vertical"
          onFinish={handleCreateBackup}
          initialValues={{ backupType: 'full', encryptBackup: true, compressBackup: true }}
        >
          <Form.Item
            name="databaseId"
            label="Database"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select database">
              <Option value="1">Production DB</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="backupType" label="Backup Type">
            <Select>
              <Option value="full">Full Backup</Option>
              <Option value="incremental">Incremental</Option>
            </Select>
          </Form.Item>

          <Form.Item name="encryptBackup" valuePropName="checked">
            <Select>
              <Option value={true}>Encrypt Backup</Option>
              <Option value={false}>No Encryption</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Job Modal */}
      <Modal
        title="Create Backup Job"
        open={isJobModalOpen}
        onOk={() => jobForm.submit()}
        onCancel={() => {
          setIsJobModalOpen(false)
          jobForm.resetFields()
        }}
        confirmLoading={createJobMutation.isLoading}
        width={700}
      >
        <Form
          form={jobForm}
          layout="vertical"
          onFinish={handleCreateJob}
          initialValues={{
            backupType: 'full',
            cronExpression: '0 2 * * *',
            retentionValue: 7,
            retentionUnit: 'days',
            encryptBackup: true,
            compressBackup: true,
            verifyBackup: true,
          }}
        >
          <Form.Item
            name="name"
            label="Job Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Daily Full Backup" />
          </Form.Item>

          <Form.Item
            name="databaseId"
            label="Database"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select database">
              <Option value="1">Production DB</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cronExpression"
            label="Schedule (Cron)"
            rules={[{ required: true }]}
          >
            <Input placeholder="0 2 * * *" />
          </Form.Item>

          <Form.Item name="backupType" label="Backup Type">
            <Select>
              <Option value="full">Full Backup</Option>
              <Option value="incremental">Incremental</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Backup Detail Modal */}
      <Modal
        title="Backup Details"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedBackup && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID" span={2}>{selectedBackup.id}</Descriptions.Item>
            <Descriptions.Item label="Name">{selectedBackup.name}</Descriptions.Item>
            <Descriptions.Item label="Filename">{selectedBackup.fileName}</Descriptions.Item>
            <Descriptions.Item label="Database">{selectedBackup.database?.name}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag>{selectedBackup.status.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Size">{formatBytes(selectedBackup.size)}</Descriptions.Item>
            <Descriptions.Item label="Checksum">{selectedBackup.checksum || '-'}</Descriptions.Item>
            <Descriptions.Item label="Created" span={2}>
              {new Date(selectedBackup.createdAt).toLocaleString()}
            </Descriptions.Item>
            {selectedBackup.errorMessage && (
              <Descriptions.Item label="Error" span={2}>
                <pre style={{ color: 'red' }}>{selectedBackup.errorMessage}</pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Backups
