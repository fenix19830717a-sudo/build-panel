import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Timeline,
  Spin,
  Button,
  Descriptions,
  Table,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { monitorsApi, checkResultsApi } from '../services/monitors'
import dayjs from 'dayjs'

const MonitorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: monitor, isLoading: monitorLoading } = useQuery({
    queryKey: ['monitor', id],
    queryFn: () => monitorsApi.getById(id!),
    enabled: !!id,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['monitor-stats', id],
    queryFn: () => checkResultsApi.getStats(id!, 24),
    enabled: !!id,
  })

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ['monitor-trend', id],
    queryFn: () => checkResultsApi.getTrend(id!, 24, 60),
    enabled: !!id,
  })

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['monitor-history', id],
    queryFn: () => checkResultsApi.getByMonitor(id!, 1, 20),
    enabled: !!id,
  })

  if (monitorLoading || !monitor) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  const statusColor = {
    up: 'success',
    down: 'error',
    pending: 'processing',
    paused: 'default',
  }

  const statusText = {
    up: '正常',
    down: '异常',
    pending: '待检测',
    paused: '暂停',
  }

  const historyColumns = [
    {
      title: '时间',
      dataIndex: 'checkedAt',
      key: 'checkedAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'up' ? 'success' : 'error'}>
          {status === 'up' ? '正常' : '异常'}
        </Tag>
      ),
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time: number) => `${time}ms`,
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      key: 'statusCode',
      render: (code: number) => code || '-',
    },
    {
      title: '错误信息',
      dataIndex: 'errorMessage',
      key: 'errorMessage',
      ellipsis: true,
    },
  ]

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/monitors')}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row align="middle" gutter={16}>
              <Col flex="auto">
                <h2 style={{ margin: 0 }}>{monitor.name}
                  <Tag
                    color={statusColor[monitor.status]}
                    style={{ marginLeft: 12 }}
                  >
                    {statusText[monitor.status]}
                  </Tag>
                </h2>
                <p style={{ margin: '8px 0 0', color: '#666' }}>{monitor.url}</p>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="24小时可用率"
              value={monitor.uptime24h}
              suffix="%"
              precision={2}
              valueStyle={{ color: monitor.uptime24h >= 99 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="7天可用率"
              value={monitor.uptime7d}
              suffix="%"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="30天可用率"
              value={monitor.uptime30d}
              suffix="%"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={stats?.avgResponseTime || 0}
              suffix="ms"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="响应时间趋势（24小时）">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => dayjs(value).format('HH:mm')}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`${value}ms`, '平均响应时间']}
                    labelFormatter={(label) => dayjs(label).format('HH:mm')}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgResponseTime"
                    stroke="#1677ff"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="监控配置">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="类型">{monitor.type.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="检查间隔">{monitor.interval} 秒</Descriptions.Item>
              <Descriptions.Item label="超时时间">{monitor.timeout} 毫秒</Descriptions.Item>
              <Descriptions.Item label="重试次数">{monitor.retries}</Descriptions.Item>
              <Descriptions.Item label="SSL检查">{monitor.sslCheck ? '是' : '否'}</Descriptions.Item>
              {monitor.keyword && (
                <Descriptions.Item label="关键字">{monitor.keyword}</Descriptions.Item>
              )}
              {monitor.expectedStatusCode && (
                <Descriptions.Item label="期望状态码">{monitor.expectedStatusCode}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="检查历史">
            <Table
              dataSource={history?.data || []}
              columns={historyColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default MonitorDetail
