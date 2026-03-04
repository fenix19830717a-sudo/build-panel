import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Row, Col, Card, Statistic, Badge, Table, Tag, Spin } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  AlertOutlined,
} from '@ant-design/icons'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { dashboardApi } from '../services/monitors'
import dayjs from 'dayjs'

const COLORS = {
  up: '#52c41a',
  down: '#f5222d',
  pending: '#faad14',
  paused: '#d9d9d9',
}

const Dashboard: React.FC = () => {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApi.getOverview(),
  })

  const { data: statusDist, isLoading: distLoading } = useQuery({
    queryKey: ['dashboard', 'status-distribution'],
    queryFn: () => dashboardApi.getStatusDistribution(),
  })

  const { data: uptimeTrend, isLoading: trendLoading } = useQuery({
    queryKey: ['dashboard', 'uptime-trend'],
    queryFn: () => dashboardApi.getUptimeTrend(7),
  })

  const { data: recentAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['dashboard', 'recent-alerts'],
    queryFn: () => dashboardApi.getRecentAlerts(10),
  })

  if (overviewLoading || distLoading || trendLoading || alertsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  const stats = [
    {
      title: '总监控数',
      value: overview?.totalMonitors || 0,
      icon: <ThunderboltOutlined />,
      color: '#1677ff',
    },
    {
      title: '正常运行',
      value: overview?.upMonitors || 0,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
    },
    {
      title: '异常监控',
      value: overview?.downMonitors || 0,
      icon: <CloseCircleOutlined />,
      color: '#f5222d',
    },
    {
      title: '待处理告警',
      value: overview?.activeAlerts || 0,
      icon: <AlertOutlined />,
      color: '#faad14',
    },
  ]

  const alertColumns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '监控项',
      dataIndex: ['monitor', 'name'],
      key: 'monitor',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          down: { text: '服务宕机', color: 'red' },
          up: { text: '服务恢复', color: 'green' },
          ssl_expiring: { text: '证书过期', color: 'orange' },
          response_time: { text: '响应超时', color: 'yellow' },
        }
        const { text, color } = typeMap[type] || { text: type, color: 'default' }
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '级别',
      dataIndex: 'severity',
      key: 'severity',
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
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
  ]

  return (
    <div>
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<span style={{ color: stat.color, marginRight: 8 }}>{stat.icon}</span>}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="监控状态分布">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDist || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) => `${status}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {(statusDist || []).map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.status as keyof typeof COLORS] || '#8884d8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="7天可用率趋势 (%)">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uptimeTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => dayjs(value).format('MM-DD')}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(2)}%`, '可用率']}
                    labelFormatter={(label) => dayjs(label).format('YYYY-MM-DD')}
                  />
                  <Area
                    type="monotone"
                    dataKey="uptime"
                    stroke="#52c41a"
                    fill="#52c41a"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="最近告警">
            <Table
              dataSource={recentAlerts || []}
              columns={alertColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
