import { Card, Col, Row, Statistic } from 'antd';
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={1234}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={856}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={2341}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={45231}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Recent Orders">
            <p>Order #1234 - $150.00</p>
            <p>Order #1235 - $230.00</p>
            <p>Order #1236 - $89.99</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Low Stock Products">
            <p>Product A - 5 left</p>
            <p>Product B - 3 left</p>
            <p>Product C - 2 left</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
