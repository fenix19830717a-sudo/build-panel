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
  Switch,
  Tabs,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { alertChannelsApi } from '../services/monitors'
import dayjs from 'dayjs'

const { Option } = Select
const { TabPane } = Tabs

const AlertChannels: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<any | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['alert-channels'],
    queryFn: () => alertChannelsApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => alertChannelsApi.create(data),
    onSuccess: () => {
      message.success('创建成功')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['alert-channels'] })
    },
    onError: (error: Error) => {
      message.error(`创建失败: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      alertChannelsApi.update(id, data),
    onSuccess: () => {
      message.success('更新成功')
      setIsModalOpen(false)
      setEditingChannel(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['alert-channels'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => alertChannelsApi.delete(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['alert-channels'] })
    },
  })

  const testMutation = useMutation({
    mutationFn: (id: string) => alertChannelsApi.test(id),
    onSuccess: (result: any) => {
      if (result.success) {
        message.success('测试消息发送成功')
      } else {
        message.error(`测试失败: ${result.message}`)
      }
    },
  })

  const handleSubmit = (values: any) => {
    if (editingChannel) {
      updateMutation.mutate({ id: editingChannel.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleEdit = (channel: any) => {
    setEditingChannel(channel)
    form.setFieldsValue(channel)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingChannel(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          email: '邮件',
          webhook: 'Webhook',
          telegram: 'Telegram',
          dingtalk: '钉钉',
          weixin: '微信',
          slack: 'Slack',
          discord: 'Discord',
        }
        return typeMap[type] || type
      },
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '失败次数',
      dataIndex: 'failureCount',
      key: 'failureCount',
      width: 100,
      render: (count: number) => (
        count > 0 ? <Tag color="warning">{count}</Tag> : count
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            icon={<SendOutlined />}
            size="small"
            onClick={() => testMutation.mutate(record.id)}
            loading={testMutation.isPending}
          >
            测试
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个告警渠道吗？"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const channelType = Form.useWatch('type', form)

  const renderChannelConfig = () => {
    switch (channelType) {
      case 'email':
        return (
          <>
            <Form.Item
              name="emailTo"
              label="收件人"
              rules={[{ required: true, message: '请输入收件人邮箱' }]}
            >
              <Input placeholder="admin@example.com, ops@example.com" />
            </Form.Item>
            <Form.Item name="emailCc" label="抄送">
              <Input placeholder="manager@example.com" />
            </Form.Item>
          </>
        )
      case 'webhook':
        return (
          <>
            <Form.Item
              name="webhookUrl"
              label="Webhook URL"
              rules={[{ required: true }]}
            >
              <Input placeholder="https://hooks.example.com/webhook" />
            </Form.Item>
            <Form.Item name="webhookHeaders" label="自定义请求头">
              <Input.TextArea
                rows={3}
                placeholder='{"Authorization": "Bearer xxx"}'
              />
            </Form.Item>
            <Form.Item name="webhookBodyTemplate" label="请求体模板">
              <Input.TextArea
                rows={5}
                placeholder={`{\n  "message": "{{message}}",\n  "monitor": "{{monitor.name}}"\n}`}
              />
            </Form.Item>
          </>
        )
      case 'telegram':
        return (
          <>
            <Form.Item
              name="telegramBotToken"
              label="Bot Token"
              rules={[{ required: true }]}
            >
              <Input placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
            </Form.Item>
            <Form.Item
              name="telegramChatId"
              label="Chat ID"
              rules={[{ required: true }]}
            >
              <Input placeholder="@channelname 或 123456789" />
            </Form.Item>
          </>
        )
      case 'dingtalk':
        return (
          <>
            <Form.Item
              name="dingtalkWebhook"
              label="Webhook URL"
              rules={[{ required: true }]}
            >
              <Input placeholder="https://oapi.dingtalk.com/robot/send?access_token=xxx" />
            </Form.Item>
            <Form.Item name="dingtalkSecret" label="Secret">
              <Input placeholder="签名密钥（可选）" />
            </Form.Item>
          </>
        )
      case 'slack':
        return (
          <Form.Item
            name="slackWebhookUrl"
            label="Webhook URL"
            rules={[{ required: true }]}
          >
            <Input placeholder="https://hooks.slack.com/services/xxx/yyy/zzz" />
          </Form.Item>
        )
      case 'discord':
        return (
          <Form.Item
            name="discordWebhookUrl"
            label="Webhook URL"
            rules={[{ required: true }]}
          >
            <Input placeholder="https://discord.com/api/webhooks/xxx/yyy" />
          </Form.Item>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>告警渠道</h2>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建渠道
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
        title={editingChannel ? '编辑告警渠道' : '新建告警渠道'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingChannel(null)
          form.resetFields()
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true, type: 'email' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="渠道名称"
                rules={[{ required: true }]}
              >
                <Input placeholder="例如：邮件告警" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="渠道类型"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="email">邮件</Option>
                  <Option value="webhook">Webhook</Option>
                  <Option value="telegram">Telegram</Option>
                  <Option value="dingtalk">钉钉</Option>
                  <Option value="slack">Slack</Option>
                  <Option value="discord">Discord</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <div style={{ marginTop: 16 }}>{renderChannelConfig()}</div>
        </Form>
      </Modal>
    </div>
  )
}

export default AlertChannels
