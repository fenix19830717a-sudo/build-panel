import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { monitorsApi, Monitor, CreateMonitorData } from '../services/monitors'
import dayjs from 'dayjs'

const { Option } = Select

const Monitors: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['monitors'],
    queryFn: () => monitorsApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateMonitorData) => monitorsApi.create(data),
    onSuccess: () => {
      message.success('创建成功')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['monitors'] })
    },
    onError: (error: Error) => {
      message.error(`创建失败: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMonitorData> }) =>
      monitorsApi.update(id, data),
    onSuccess: () => {
      message.success('更新成功')
      setIsModalOpen(false)
      setEditingMonitor(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['monitors'] })
    },
    onError: (error: Error) => {
      message.error(`更新失败: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => monitorsApi.delete(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['monitors'] })
    },
    onError: (error: Error) => {
      message.error(`删除失败: ${error.message}`)
    },
  })

  const checkMutation = useMutation({
    mutationFn: (id: string) => monitorsApi.checkNow(id),
    onSuccess: (result: any) => {
      if (result.success) {
        message.success(`检查完成: ${result.data.status}`)
      } else {
        message.error(`检查失败: ${result.message}`)
      }
      queryClient.invalidateQueries({ queryKey: ['monitors'] })
    },
  })

  const handleSubmit = (values: any) => {
    const data: CreateMonitorData = {
      ...values,
      interval: values.interval || 60,
      timeout: values.timeout || 5000,
      retries: values.retries || 3,
    }

    if (editingMonitor) {
      updateMutation.mutate({ id: editingMonitor.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (monitor: Monitor) => {
    setEditingMonitor(monitor)
    form.setFieldsValue({
      ...monitor,
    })
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingMonitor(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const columns = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { icon: React.ReactNode; color: string; text: string }> = {
          up: { icon: <CheckCircleOutlined />, color: 'success', text: '正常' },
          down: { icon: <CloseCircleOutlined />, color: 'error', text: '异常' },
          pending: { icon: <ReloadOutlined />, color: 'processing', text: '待检测' },
          paused: { icon: <PauseCircleOutlined />, color: 'default', text: '暂停' },
        }
        const { icon, color, text } = statusMap[status] || statusMap.pending
        return <Tag icon={icon} color={color}>{text}</Tag>
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Monitor) => (
        <a onClick={() => navigate(`/monitors/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => type.toUpperCase(),
    },
    {
      title: '24h可用率',
      dataIndex: 'uptime24h',
      key: 'uptime24h',
      width: 120,
      render: (uptime: number) => `${uptime.toFixed(2)}%`,
    },
    {
      title: '最后检查',
      dataIndex: 'lastCheckedAt',
      key: 'lastCheckedAt',
      width: 180,
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Monitor) => (
        <Space size="small">
          <Tooltip title="立即检查">
            <Button
              icon={<ReloadOutlined />}
              size="small"
              loading={checkMutation.isPending}
              onClick={() => checkMutation.mutate(record.id)}
            />
          </Tooltip>
          <Tooltip title="查看详情">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/monitors/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个监控吗？"
              onConfirm={() => deleteMutation.mutate(record.id)}
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>监控管理</h2>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建监控
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingMonitor ? '编辑监控' : '新建监控'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingMonitor(null)
          form.resetFields()
        }}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'https',
            interval: 60,
            timeout: 5000,
            retries: 3,
            isActive: true,
            sslCheck: false,
            sslExpiryDays: 7,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="监控名称"
                rules={[{ required: true, message: '请输入监控名称' }]}
              >
                <Input placeholder="例如：Google Homepage" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="监控类型"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="http">HTTP</Option>
                  <Option value="https">HTTPS</Option>
                  <Option value="tcp">TCP</Option>
                  <Option value="ping">Ping</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="url"
            label="监控URL"
            rules={[{ required: true, message: '请输入监控URL' }]}
          >
            <Input placeholder="https://www.example.com" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="interval"
                label="检查间隔（秒）"
                rules={[{ required: true }]}
              >
                <InputNumber min={30} max={86400} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="timeout"
                label="超时时间（毫秒）"
                rules={[{ required: true }]}
              >
                <InputNumber min={1000} max={60000} step={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="retries"
                label="重试次数"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expectedStatusCode"
                label="期望状态码"
              >
                <Input placeholder="200,201" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="keyword"
                label="页面关键字"
              >
                <Input placeholder="页面应包含的文字" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sslCheck"
                valuePropName="checked"
              >
                <Switch checkedChildren="检查SSL" unCheckedChildren="不检查SSL" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sslExpiryDays"
                label="SSL过期提醒（天）"
              >
                <InputNumber min={1} max={90} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Monitors
