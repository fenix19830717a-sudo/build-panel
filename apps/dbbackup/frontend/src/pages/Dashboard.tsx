import React from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Button, Space } from 'antd'
import {
  DatabaseOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { useQuery } from 'react-query'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { fetchDashboardStats, fetchBackupTrend, fetchRecentBackups, fetchAlerts } from '../services/api'

const Dashboard: React.FC = () => {
  const { data: stats } = useQuery('dashboardStats', fetchDashboardStats)
  const { data: trend } = useQuery('backupTrend', () => fetchBackupTrend(7))
  const { data: recentBackups } = useQuery('recentBackups', () => fetchRecentBackups(5))
  const { data: alerts } = useQuery('alerts', fetchAlerts)

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Database',
      dataIndex: ['database', 'name'],
      key: 'database',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          completed: 'success',
          failed: 'error',
          running: 'processing',
          pending: 'warning',
          verifying: 'processing',
          verified: 'success',
        }
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>
      },
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatBytes(size),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ]

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <Button type="primary" icon={<CloudUploadOutlined />}>
          Create Backup
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Backups"
              value={stats?.backups?.total || 0}
              prefix={<CloudUploadOutlined />}
              valueStyle={{ color: '#fff' }}
            />
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)' }}>
              <ArrowUpOutlined /> {stats?.backups?.last24h || 0} in last 24h
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card success">
            <Statistic
              title="Success Rate"
              value={stats?.backups?.successRate || 100}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#fff' }}
            />
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)' }}>
              Last 24 hours
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card warning">
            <Statistic
              title="Active Jobs"
              value={stats?.jobs?.active || 0}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#fff' }}
            />
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)' }}>
              {stats?.jobs?.total || 0} total jobs
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card info">
            <Statistic
              title="Storage Used"
              value={formatBytes(stats?.storage?.totalSize || 0)}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)' }}>
              {stats?.storage?.totalCount || 0} backups
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Backup Trend (7 Days)"
            className="card-hover"
          >
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Backups"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Recent Alerts"
            className="card-hover"
            extra={<Button type="link">View All</Button>}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {alerts?.slice(0, 5).map((alert: any, index: number) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ExclamationCircleOutlined
                    style={{
                      color: alert.type === 'error' ? '#ff4d4f' : '#faad14',
                      fontSize: 16,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>{alert.title}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )) || <Text type="secondary">No alerts</Text>}
            </Space>
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title="Recent Backups"
            className="card-hover"
            extra={<Button type="link">View All</Button>}
          >
            <Table
              columns={columns}
              dataSource={recentBackups || []}
              rowKey="id"
              pagination={false}
              className="data-table"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
