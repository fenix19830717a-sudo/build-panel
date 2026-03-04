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
  DatePicker,
  Checkbox,
  message,
  Tooltip,
  Timeline,
  Progress,
  Alert,
  Descriptions,
} from 'antd'
import {
  PlusOutlined,
  RollbackOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { fetchBackups, fetchDatabases, fetchRestoreLogs, restoreBackup } from '../services/api'
import dayjs from 'dayjs'

const { Option } = Select
const { RangePicker } = DatePicker

const Restore: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: backups } = useQuery('backups', fetchBackups)
  const { data: databases } = useQuery('databases', fetchDatabases)
  const { data: restoreLogs, isLoading } = useQuery('restoreLogs', fetchRestoreLogs)

  const restoreMutation = useMutation(restoreBackup, {
    onSuccess: () => {
      message.success('Restore started successfully')
      queryClient.invalidateQueries('restoreLogs')
      setIsModalOpen(false)
      form.resetFields()
    },
    onError: () => {
      message.error('Failed to start restore')
    },
  })

  const handleSubmit = (values: any) => {
    restoreMutation.mutate({
      backupId: values.backupId,
      targetDatabaseId: values.targetDatabaseId,
      restoreMode: values.restoreMode,
      pitrTimestamp: values.pitrTimestamp?.toISOString(),
      includeTables: values.includeTables,
      excludeTables: values.excludeTables,
      dropBeforeRestore: values.dropBeforeRestore,
    })
  }

  const formatBytes = (bytes: number) => {
    if (!bytes) return '-'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const columns = [
    {
      title: 'Backup',
      dataIndex: ['backup', 'name'],
      key: 'backup',
      render: (text: string) => (
        <Space>
          <DatabaseOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Target Database',
      dataIndex: ['targetDatabase', 'name'],
      key: 'targetDatabase',
    },
    {
      title: 'Mode',
      dataIndex: 'restoreMode',
      key: 'restoreMode',
      render: (mode: string) => <Tag>{mode.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode }> = {
          completed: { color: 'success', icon: <CheckCircleOutlined /> },
          failed: { color: 'error', icon: <ExclamationCircleOutlined /> },
          running: { color: 'processing', icon: <LoadingOutlined spin /> },
          pending: { color: 'warning', icon: <LoadingOutlined /> },
        }
        const c = config[status] || { color: 'default', icon: null }
        return <Tag color={c.color}>{c.icon} {status.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_: any, record: any) => {
        if (record.status === 'running') {
          return <Progress percent={50} status="active" size="small" />
        }
        return '-'
      },
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => duration ? `${duration}s` : '-',
    },
    {
      title: 'Started',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
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
                setSelectedLog(record)
                setIsDetailModalOpen(true)
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Restore</h1>
        <Button
          type="primary"
          icon={<RollbackOutlined />}
          onClick={() => {
            form.resetFields()
            setIsModalOpen(true)
          }}
        >
          Start Restore
        </Button>
      </div>

      <Alert
        message="Restore Warning"
        description="Restoring a database will overwrite existing data. Make sure to backup current data before proceeding."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="Restore History" className="card-hover">
        <Table
          columns={columns}
          dataSource={restoreLogs || []}
          rowKey="id"
          loading={isLoading}
          className="data-table"
        />
      </Card>

      <Modal
        title="Restore Backup"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        confirmLoading={restoreMutation.isLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ restoreMode: 'full', dropBeforeRestore: false }}
        >
          <Form.Item
            name="backupId"
            label="Select Backup"
            rules={[{ required: true, message: 'Please select a backup' }]}
          >
            <Select placeholder="Choose a backup to restore">
              {backups?.filter((b: any) => b.status === 'completed' || b.status === 'verified').map((backup: any) => (
                <Option key={backup.id} value={backup.id}>
                  {backup.name} ({new Date(backup.createdAt).toLocaleString()})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="targetDatabaseId"
            label="Target Database"
            rules={[{ required: true, message: 'Please select target database' }]}
          >
            <Select placeholder="Select target database">
              {databases?.map((db: any) => (
                <Option key={db.id} value={db.id}>{db.name} ({db.type})</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="restoreMode" label="Restore Mode">
            <Select>
              <Option value="full">Full Restore</Option>
              <Option value="partial">Partial Restore (Select Tables)</Option>
              <Option value="pitr">Point-in-Time Recovery</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.restoreMode !== curr.restoreMode}
          >
            {({ getFieldValue }) => {
              if (getFieldValue('restoreMode') === 'pitr') {
                return (
                  <Form.Item
                    name="pitrTimestamp"
                    label="Point-in-Time"
                    rules={[{ required: true }]}
                  >
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                )
              }
              return null
            }}
          </Form.Item>

          <Form.Item name="dropBeforeRestore" valuePropName="checked">
            <Checkbox>
              Drop existing objects before restore (WARNING: This will delete existing data)
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Restore Details"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedLog && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID" span={2}>{selectedLog.id}</Descriptions.Item>
            <Descriptions.Item label="Backup">{selectedLog.backup?.name}</Descriptions.Item>
            <Descriptions.Item label="Target DB">{selectedLog.targetDatabase?.name}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag>{selectedLog.status.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mode">{selectedLog.restoreMode.toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="Duration">{selectedLog.duration ? `${selectedLog.duration}s` : '-'}</Descriptions.Item>
            <Descriptions.Item label="Rows Restored">{selectedLog.rowsRestored || '-'}</Descriptions.Item>
            <Descriptions.Item label="Created" span={2}>
              {new Date(selectedLog.createdAt).toLocaleString()}
            </Descriptions.Item>
            {selectedLog.errorMessage && (
              <Descriptions.Item label="Error" span={2}>
                <pre style={{ color: 'red' }}>{selectedLog.errorMessage}</pre>
              </Descriptions.Item>
            )}
            {selectedLog.logOutput && (
              <Descriptions.Item label="Log Output" span={2}>
                <pre style={{ maxHeight: 300, overflow: 'auto' }}>{selectedLog.logOutput}</pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Restore
