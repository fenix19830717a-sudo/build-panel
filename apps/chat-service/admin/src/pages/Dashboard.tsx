import { Row, Col, Card, Statistic } from 'antd';
import { TeamOutlined, MessageOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';

export default function Dashboard() {
  return (
    <div>
      <h2>概览</h2>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="在线访客" 
              value={12} 
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="待回复会话" 
              value={5} 
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="待处理工单" 
              value={8} 
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="平均响应时间" 
              value="2m 30s" 
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="今日会话趋势">
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              图表区域
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近活动">
            <ul style={{ paddingLeft: 20 }}>
              <li>访客 #1234 发起了新会话</li>
              <li>工单 TKT-ABC123 已分配给 张三</li>
              <li>客服 李四 上线</li>
              <li>访客 #1235 关闭了会话</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
