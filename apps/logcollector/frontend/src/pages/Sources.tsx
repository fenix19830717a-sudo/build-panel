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
  Descriptions,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { sourcesApi } from '../services/api'
import dayjs from 'dayjs'

const { Option } = Select

const Sources = () => {
  const [sources, setSources] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingSource, setEditingSource] = useState<any>(null)
  const [selectedSource, setSelectedSource] = useState<any>(null)
  const [form] = Form.useForm()

  const fetchSources = async () => {
    setLoading(true)
    try {
      const { data } = await sourcesApi.getAll()
      setSources(data)
    } catch (error) {
      message.error('获取日志源失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const handleSubmit = async (values: any) => {
    try {
      if (editingSource) {
        await sourcesApi.update(editingSource.id, values)
        message.success('更新成功')
      } else {
        await sourcesApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      form.resetFields()
      setEditingSource(null)
      fetchSources()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await sourcesApi.delete(id)
      message.success('删除成功')
      fetchSources()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const openEditModal = (source: any) => {
    setEditingSource(source)
    form.setFieldsValue({
      ...source,
    })
    setModalVisible(true)
  }

  const openCreateModal = () => {
    setEditingSource(null)
    form.resetFields()
    setModalVisible(true)
  }

  const openDetailModal = (source: any) => {
    setSelectedSource(source)
    setDetailModalVisible(true)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'success',
      inactive: 'default',
      error: 'error',
    }
    return colors[status] || 'default'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      syslog: 'Syslog',
      filebeat: 'Filebeat',
      fluentd: 'Fluentd',
      http: 'HTTP',
      tcp: 'TCP',
      udp: 'UDP',
    }
    return labels[type] || type
  }

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => getTypeLabel(type),
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
      title: '日志数', 
      dataIndex: 'logCount', 
      key: 'logCount',
      render: (count: number) => count.toLocaleString(),
    },
    { 
      title: '最后接收', 
      dataIndex: 'lastReceivedAt', 
      key: 'lastReceivedAt',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => openDetailModal(record)}
          >查看</Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => openEditModal(record)}
          >编辑</Button>
          <Popconfirm
            title="确定删除此日志源吗？"
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
        title="日志源管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            添加日志源
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={sources}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingSource ? '编辑日志源' : '添加日志源'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false)
          setEditingSource(null)
          form.resetFields()
        }}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="例如: Production Server" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="选择日志源类型">
              <Option value="syslog">Syslog</Option>
              <Option value="filebeat">Filebeat</Option>
              <Option value="fluentd">Fluentd</Option>
              <Option value="http">HTTP</Option>
              <Option value="tcp">TCP</Option>
              <Option value="udp">UDP</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={2} placeholder="可选描述" />
          </Form.Item>

          <Form.Item
            name="host"
            label="主机地址"
          >
            <Input placeholder="例如: 192.168.1.100" />
          </Form.Item>

          <Form.Item
            name="port"
            label="端口"
          >
            <Input type="number" placeholder="例如: 514" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="日志源详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>关闭</Button>,
        ]}
        width={700}
      >
        {selectedSource && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID" span={2}>{selectedSource.id}</Descriptions.Item>
            <Descriptions.Item label="名称">{selectedSource.name}</Descriptions.Item>
            <Descriptions.Item label="类型">{getTypeLabel(selectedSource.type)}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={getStatusColor(selectedSource.status)}>{selectedSource.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="日志数">{selectedSource.logCount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="主机">{selectedSource.host || '-'}</Descriptions.Item>
            <Descriptions.Item label="端口">{selectedSource.port || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {dayjs(selectedSource.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="最后接收" span={2}>
              {selectedSource.lastReceivedAt 
                ? dayjs(selectedSource.lastReceivedAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{selectedSource.description || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Sources
