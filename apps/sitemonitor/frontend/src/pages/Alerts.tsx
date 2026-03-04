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
  Select,
  Badge,
} from 'antd'
import {
  CheckCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { alertsApi } from '../services/monitors'
import dayjs from 'dayjs'

const { Option } = Select

const Alerts: React.FC = () => {
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [severity, setSeverity] = useState<string | undefined>(undefined)
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['alerts', status, severity],
    queryFn: () => alertsApi.getAll(1, 50, status, severity),
  })

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => alertsApi.acknowledge(id),
    onSuccess: () => {
      message.success('告警已确认')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => alertsApi.resolve(id),
    onSuccess: () => {
      message.success('告警已解决')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => alertsApi.delete(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const columns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '监控项',
      dataIndex: ['monitor', 'name'],
      key: 'monitor',
      render: (text: string, record: any) => text || record.monitorId,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          down: { text: '服务宕机', color: 'red' },
          up: { text: '服务恢复', color: 'green' },
          ssl_expiring: { text: '证书过期', color: 'orange' },
          response_time: { text: '响应超时', color: 'yellow' },
          keyword_mismatch: { text: '关键字不匹配', color: 'purple' },
          status_code_mismatch: { text: '状态码不匹配', color: 'blue' },
        }
        const { text, color } = typeMap[type] || { text: type, color: 'default' }
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '级别',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => {
        const severityMap: Record<string, { text: string; color: string }> = {
          critical: { text: '严重', color: 'red' },
          warning: { text: '警告', color: 'orange' },
          info: { text: '信息', color: 'blue' },
        }
        const { text, color } = severityMap[severity] || { text: severity, color: 'default' }
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          pending: { text: '待处理', color: 'orange' },
          sent: { text: '已发送', color: 'blue' },
          acknowledged: { text: '已确认', color: 'cyan' },
          resolved: { text: '已解决', color: 'green' },
          failed: { text: '失败', color: 'red' },
        }
        const { text, color } = statusMap[status] || { text: status, color: 'default' }
        return <Tag color={color}>{text}</Tag>
      },
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
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          {record.status === 'pending' && (
            <Button
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => acknowledgeMutation.mutate(record.id)}
            >
              确认
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'acknowledged') && (
            <Button
              size="small"
              type="primary"
              onClick={() => resolveMutation.mutate(record.id)}
            >
              解决
            </Button>
          )}
          <Popconfirm
            title="确定要删除这个告警吗？"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2>告警管理</h2>
        </Col>
        <Col>
          <Space>
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 120 }}
              onChange={setStatus}
              value={status}
            >
              <Option value="pending">待处理</Option>
              <Option value="sent">已发送</Option>
              <Option value="acknowledged">已确认</Option>
              <Option value="resolved">已解决</Option>
            </Select>
            <Select
              placeholder="级别筛选"
              allowClear
              style={{ width: 120 }}
              onChange={setSeverity}
              value={severity}
            >
              <Option value="critical">严重</Option>
              <Option value="warning">警告</Option>
              <Option value="info">信息</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              刷新
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
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  )
}

export default Alerts
