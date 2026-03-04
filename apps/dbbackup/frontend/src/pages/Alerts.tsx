import React from 'react'
import { Card, List, Tag, Badge, Button, Space, Typography, Timeline } from 'antd'
import {
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useQuery } from 'react-query'
import { fetchAlerts } from '../services/api'

const { Text, Title } = Typography

const Alerts: React.FC = () => {
  const { data: alerts, isLoading } = useQuery('alerts', fetchAlerts)

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
      case 'warning':
        return <AlertOutlined style={{ color: '#faad14', fontSize: 20 }} />
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'red'
      case 'warning':
        return 'orange'
      case 'success':
        return 'green'
      default:
        return 'blue'
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Alerts</h1>
        <Button type="primary">Mark All Read</Button>
      </div>

      <Card className="card-hover">
        <List
          loading={isLoading}
          itemLayout="horizontal"
          dataSource={alerts || []}
          renderItem={(alert: any) => (
            <List.Item
              actions={[
                <Button type="text" key="view">View</Button>,
                <Button type="text" key="dismiss">Dismiss</Button>,
              ]}
            >
              <List.Item.Meta
                avatar={getIcon(alert.type)}
                title={
                  <Space>
                    <span>{alert.title}</span>
                    <Tag color={getColor(alert.type)}>{alert.type.toUpperCase()}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text>{alert.message}</Text>
                    <Text type="secondary">
                      <ClockCircleOutlined /> {new Date(alert.timestamp).toLocaleString()}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default Alerts
