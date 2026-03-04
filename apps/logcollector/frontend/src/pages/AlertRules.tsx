import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Popconfirm,
  message,
  InputNumber,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, BellOutlined } from '@ant-design/icons'
import { alertRulesApi } from '../services/api'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const AlertRules = () => {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)
  const [form] = Form.useForm()

  const fetchRules = async () => {
    setLoading(true)
    try {
      const { data } = await alertRulesApi.getAll()
      setRules(data)
    } catch (error) {
      message.error('获取告警规则失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const handleSubmit = async (values: any) => {
    try {
      if (editingRule) {
        await alertRulesApi.update(editingRule.id, values)
        message.success('更新成功')
      } else {
        await alertRulesApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      form.resetFields()
      setEditingRule(null)
      fetchRules()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await alertRulesApi.delete(id)
      message.success('删除成功')
      fetchRules()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const openEditModal = (rule: any) => {
    setEditingRule(rule)
    form.setFieldsValue({
      ...rule,
      notifications: rule.notifications || {},
    })
    setModalVisible(true)
  }

  const openCreateModal = () => {
    setEditingRule(null)
    form.resetFields()
    form.setFieldsValue({
      threshold: 1,
      timeWindow: 60,
      severity: 'medium',
    })
    setModalVisible(true)
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'blue',
      medium: 'orange',
      high: 'red',
      critical: 'purple',
    }
    return colors[severity] || 'default'
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default'
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { 
      title: '字段', 
      dataIndex: 'field', 
      key: 'field',
      render: (field: string, record: any) => (
        <span>{field} {record.operator} "{record.value}"</span>
      ),
    },
    { 
      title: '严重级别', 
      dataIndex: 'severity', 
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>{severity.toUpperCase()}</Tag>
      ),
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    { 
      title: '触发次数', 
      dataIndex: 'alertCount', 
      key: 'alertCount',
    },
    { 
      title: '最后触发', 
      dataIndex: 'lastTriggeredAt', 
      key: 'lastTriggeredAt',
      render: (date: string) => date ? dayjs(date).format('MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => openEditModal(record)}
          >编辑</Button>
          <Popconfirm
            title="确定删除此告警规则吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="slide-up">
      <Card
        title={<span><BellOutlined /> 告警规则管理</span>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            添加告警规则
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingRule ? '编辑告警规则' : '添加告警规则'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false)
          setEditingRule(null)
          form.resetFields()
        }}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="例如: 错误日志告警" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={2} placeholder="可选描述" />
          </Form.Item>

          <Form.Item
            name="field"
            label="监控字段"
            rules={[{ required: true, message: '请输入字段' }]}
          >
            <Select placeholder="选择监控字段">
              <Option value="message">消息内容 (message)</Option>
              <Option value="level">日志级别 (level)</Option>
              <Option value="host">主机 (host)</Option>
              <Option value="service">服务 (service)</Option>
            </Select>
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="operator"
              label="操作符"
              rules={[{ required: true, message: '请选择操作符' }]}
              style={{ width: 200 }}
            >
              <Select placeholder="选择操作符">
                <Option value="contains">包含 (contains)</Option>
                <Option value="equals">等于 (equals)</Option>
                <Option value="regex">正则匹配 (regex)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="value"
              label="匹配值"
              rules={[{ required: true, message: '请输入匹配值' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="例如: ERROR" />
            </Form.Item>
          </Space>

          <Form.Item
            name="severity"
            label="严重级别"
            rules={[{ required: true }]}
          >
            <Select placeholder="选择严重级别">
              <Option value="low">低 (Low)</Option>
              <Option value="medium">中 (Medium)</Option>
              <Option value="high">高 (High)</Option>
              <Option value="critical">紧急 (Critical)</Option>
            </Select>
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="threshold"
              label="阈值 (次)"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} placeholder="触发阈值" />
            </Form.Item>

            <Form.Item
              name="timeWindow"
              label="时间窗口 (秒)"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} placeholder="时间窗口" />
            </Form.Item>
          </Space>

          <Form.Item
            name={['notifications', 'email']}
            label="通知邮箱"
          >
            <Select
              mode="tags"
              placeholder="输入邮箱地址，按回车添加"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name={['notifications', 'webhook']}
            label="Webhook URL"
          >
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AlertRules
