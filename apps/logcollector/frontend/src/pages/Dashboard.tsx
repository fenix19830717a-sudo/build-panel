import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd'
import { 
  FileTextOutlined, 
  CloudServerOutlined, 
  WarningOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons'
import { Column } from '@ant-design/charts'
import { logsApi } from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await logsApi.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      debug: 'gray',
      info: 'blue',
      warn: 'orange',
      error: 'red',
      fatal: 'purple',
    }
    return colors[level] || 'default'
  }

  const columns = [
    { title: '时间', dataIndex: 'timestamp', key: 'timestamp', width: 180 },
    { 
      title: '级别', 
      dataIndex: 'level', 
      key: 'level', 
      width: 80,
      render: (level: string) => (
        <Tag color={getLevelColor(level)} style={{ textTransform: 'uppercase' }}>{level}</Tag>
      )
    },
    { title: '消息', dataIndex: 'message', key: 'message', ellipsis: true },
  ]

  const chartData = stats?.hourlyStats?.map((item: any) => ({
    hour: new Date(item.hour).toLocaleString('zh-CN', { hour: '2-digit', day: 'numeric' }),
    count: parseInt(item.count),
  })) || []

  const chartConfig = {
    data: chartData,
    xField: 'hour',
    yField: 'count',
    columnStyle: {
      fill: '#1677ff',
    },
    label: {
      position: 'top',
    },
  }

  if (loading) {
    return (<div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>)
  }

  const levelCounts = stats?.levelStats?.reduce((acc: any, item: any) => {
    acc[item.level] = parseInt(item.count)
    return acc
  }, {}) || {}

  return (
    <div className="slide-up">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总日志数"
              value={stats?.totalCount || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="错误日志"
              value={levelCounts.error || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="信息日志"
              value={levelCounts.info || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="日志源"
              value={0}
              prefix={<CloudServerOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="24小时日志趋势">
            {chartData.length > 0 ? (
              <Column {...chartConfig} height={250} />
            ) : (
              <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>暂无数据</div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="日志级别分布">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats?.levelStats?.map((item: any) => (
                <div key={item.level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color={getLevelColor(item.level)} style={{ textTransform: 'uppercase' }}>{item.level}</Tag>
                  <span style={{ fontWeight: 'bold' }}>{parseInt(item.count).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="最近日志" style={{ marginTop: 16 }}>
        <Table 
          dataSource={stats?.recentLogs || []} 
          columns={columns} 
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}

export default Dashboard
