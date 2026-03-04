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
  Switch,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { parsersApi } from '../services/api'

const { Option } = Select
const { TextArea } = Input

const Parsers = () => {
  const [parsers, setParsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [testModalVisible, setTestModalVisible] = useState(false)
  const [editingParser, setEditingParser] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [form] = Form.useForm()
  const [testForm] = Form.useForm()

  const fetchParsers = async () => {
    setLoading(true)
    try {
      const { data } = await parsersApi.getAll()
      setParsers(data)
    } catch (error) {
      message.error('获取解析规则失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParsers()
  }, [])

  const handleSubmit = async (values: any) => {
    try {
      if (editingParser) {
        await parsersApi.update(editingParser.id, values)
        message.success('更新成功')
      } else {
        await parsersApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      form.resetFields()
      setEditingParser(null)
      fetchParsers()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await parsersApi.delete(id)
      message.success('删除成功')
      fetchParsers()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleTest = async (values: any) => {
    try {
      const parser = editingParser || form.getFieldsValue()
      const result = { parsed: true, fields: {} }
      
      if (parser.type === 'json') {
        try {
          result.fields = JSON.parse(values.testMessage)
        } catch {
          result.parsed = false
        }
      } else if (parser.type === 'regex') {
        const regex = new RegExp(parser.pattern)
        const match = values.testMessage.match(regex)
        if (match) {
          result.fields = match.groups || { fullMatch: match[0] }
        } else {
          result.parsed = false
        }
      }
      
      setTestResult(result)
    } catch (error) {
      setTestResult({ parsed: false, error: '解析失败' })
    }
  }

  const openEditModal = (parser: any) => {
    setEditingParser(parser)
    form.setFieldsValue({
      ...parser,
    })
    setModalVisible(true)
  }

  const openCreateModal = () => {
    setEditingParser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const openTestModal = (parser: any) => {
    setEditingParser(parser)
    setTestModalVisible(true)
    setTestResult(null)
    testForm.resetFields()
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      json: 'blue',
      regex: 'green',
      grok: 'purple',
      csv: 'orange',
      syslog: 'cyan',
    }
    return colors[type] || 'default'
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{type.toUpperCase()}</Tag>
      ),
    },
    { 
      title: '状态', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>{isActive ? '启用' : '禁用'}</Tag>
      ),
    },
    { 
      title: '优先级', 
      dataIndex: 'priority', 
      key: 'priority',
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<PlayCircleOutlined />} 
            onClick={() => openTestModal(record)}
          >测试</Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => openEditModal(record)}
          >编辑</Button>
          <Popconfirm
            title="确定删除此解析规则吗？"
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
        title="解析规则管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            添加解析规则
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={parsers}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <div>
                <p><strong>模式:</strong></p>
                <code style={{ background: '#f5f5f5', padding: 8, display: 'block', borderRadius: 4 }}>
                  {record.pattern}
                </code>
                {record.description && (
                  <>
                    <p style={{ marginTop: 12 }}><strong>描述:</strong></p>
                    <p>{record.description}</p>
                  </>
                )}
              </div>
            ),
          }}
        />
      </Card>

      <Modal
        title={editingParser ? '编辑解析规则' : '添加解析规则'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false)
          setEditingParser(null)
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
            <Input placeholder="例如: JSON Parser" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="选择解析类型">
              <Option value="json">JSON</Option>
              <Option value="regex">正则表达式</Option>
              <Option value="grok">Grok</Option>
              <Option value="csv">CSV</Option>
              <Option value="syslog">Syslog</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="pattern"
            label="模式"
            rules={[{ required: true, message: '请输入模式' }]}
          >
            <TextArea rows={4} placeholder={
              form.getFieldValue('type') === 'json' 
                ? '例如: {"level": "info", "message": "..."}' 
                : '例如: ^(?<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)'
            } />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={2} placeholder="可选描述" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
          >
            <Input type="number" placeholder="数字越大优先级越高" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="启用"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="测试解析规则"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={testForm} layout="vertical" onFinish={handleTest}>
          <Form.Item
            name="testMessage"
            label="测试消息"
            rules={[{ required: true, message: '请输入测试消息' }]}
          >
            <TextArea rows={4} placeholder="输入要测试的日志消息..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">测试解析</Button>
          </Form.Item>
        </Form>

        {testResult && (
          <div style={{ marginTop: 24 }}>
            <h4>解析结果:</h4>
            {testResult.parsed ? (
              <pre style={{ 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f',
                padding: 12, 
                borderRadius: 4 
              }}>
                {JSON.stringify(testResult.fields, null, 2)}
              </pre>
            ) : (
              <pre style={{ 
                background: '#fff2f0', 
                border: '1px solid #ffccc7',
                padding: 12, 
                borderRadius: 4,
                color: '#ff4d4f'
              }}>
                解析失败
              </pre>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Parsers
