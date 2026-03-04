import { Row, Col, Card, Statistic } from 'antd'
import {
  CloudServerOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

export function DashboardPage() {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Servers"
              value={12}
              prefix={<CloudServerOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Applications"
              value={8}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Tasks"
              value={3}
              prefix={<OrderedListOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={98}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity">
            <p>Dashboard content coming soon...</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="System Status">
            <p>All systems operational</p>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
