import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  Table,
  Input,
  Select,
  DatePicker,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  message,
  Popover,
  Badge,
} from 'antd'
import { SearchOutlined, ReloadOutlined, InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { logsApi, sourcesApi } from '../services/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

const Logs = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [sources, setSources] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchForm] = Form.useForm()
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedLog, setSelectedLog] = useState<any>(null)

  const fetchLogs = useCallback(async (params?: any) => {
    setLoading(true)
    try {
      const { data } = await logsApi.search({
        page,
        limit: pageSize,
        ...params,
      })
      setLogs(data.items)
      setTotal(data.total)
    } catch (error) {
      message.error('获取日志失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  const fetchSources = async () => {
    try {
      const { data } = await sourcesApi.getAll()
      setSources(data)
    } catch (error) {
      console.error('Failed to fetch sources:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchSources()
  }, [fetchLogs])

  const handleSearch = (values: any) => {
    const params: any = {}
    
    if (values.search) params.search = values.search
    if (values.level) params.level = values.level
    if (values.sourceId) params.sourceId = values.sourceId
    if (values.timeRange?.length === 2) {
      params.startTime = values.timeRange[0].toISOString()
      params.endTime = values.timeRange[1].toISOString()
    }
    
    setPage(1)
    fetchLogs(params)
  }

  const handleReset = () => {
    searchForm.resetFields()
    setPage(1)
    fetchLogs()
  }

  const showDetail = (log: any) => {
    setSelectedLog(log)
    setDetailModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await logsApi.delete(id)
      message.success('删除成功')
      fetchLogs()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      debug: 'default',
      info: 'blue',
      warn: 'orange',
      error: 'red',
      fatal: 'purple',
    }
    return colors[level] || 'default'
  }

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 90,
      render: (level: string) => (
        <Tag color={getLevelColor(level)} style={{ textTransform: 'uppercase' }}>{level}</Tag>
      ),
    },
    {
      title: '来源',
      dataIndex: 'sourceId',
      key: 'sourceId',
      width: 150,
      render: (sourceId: string) => {
        const source = sources.find(s => s.id === sourceId)
        return source?.name || sourceId?.slice(0, 8)
      },
    },
    {
      title: '主机',
      dataIndex: 'host',
      key: 'host',
      width: 150,
      render: (host: string) => host || '-',
    },
    {
      title: '服务',
      dataIndex: 'service',
      key: 'service',
      width: 120,
      render: (service: string) => service || '-',
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<InfoCircleOutlined />} 
            onClick={() => showDetail(record)}
          />
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div className="slide-up">
      <Card title="日志查询" style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="search">
            <Input 
              placeholder="搜索日志内容" 
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
          </Form.Item>
          
          <Form.Item name="level">
            <Select placeholder="日志级别" allowClear style={{ width: 120 }}>
              <Option value="debug">Debug</Option>
              <Option value="info">Info</Option>
              <Option value="warn">Warn</Option>
              <Option value="error">Error</Option>
              <Option value="fatal">Fatal</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="sourceId">
            <Select placeholder="日志源" allowClear style={{ width: 150 }}>
              {sources.map(s => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="timeRange">
            <RangePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">搜索</Button>
          </Form.Item>
          
          <Form.Item>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <div>
            <p><strong>ID:</strong> {selectedLog.id}</p>
            <p><strong>时间:</strong> {dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p><strong>级别:</strong> <Tag color={getLevelColor(selectedLog.level)}>{selectedLog.level}</Tag></p>
            <p><strong>来源:</strong> {selectedLog.sourceId}</p>
            <p><strong>主机:</strong> {selectedLog.host || '-'}</p>
            <p><strong>服务:</strong> {selectedLog.service || '-'}</p>
            <p><strong>消息:</strong></p>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>{selectedLog.message}</pre>
            <p><strong>元数据:</strong></p>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Logs
