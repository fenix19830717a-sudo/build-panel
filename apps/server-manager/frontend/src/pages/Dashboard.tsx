import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Spin, Alert } from 'antd';
import {
  DesktopOutlined,
  CloudOutlined,
  DatabaseOutlined,
  SwapOutlined,
  WifiOutlined
} from '@ant-design/icons';
import { systemApi } from '../utils/api';
import { SystemInfo, DiskInfo, NetworkInfo } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cpuHistory, setCpuHistory] = useState<{ time: string; usage: number }[]>([]);

  const fetchSystemInfo = async () => {
    try {
      const response = await systemApi.getInfo();
      if (response.code === 0) {
        setSystemInfo(response.data);
        setCpuHistory(prev => {
          const newPoint = { time: new Date().toLocaleTimeString(), usage: response.data.cpu.usage };
          const newHistory = [...prev, newPoint].slice(-20);
          return newHistory;
        });
        setError(null);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const diskColumns = [
    { title: 'Filesystem', dataIndex: 'filesystem', key: 'filesystem' },
    { title: 'Mount Point', dataIndex: 'mountPoint', key: 'mountPoint' },
    {
      title: 'Usage',
      dataIndex: 'usagePercent',
      key: 'usagePercent',
      render: (percent: number) => (
        <Progress percent={percent} size="small" status={percent > 90 ? 'exception' : 'normal'} />
      )
    },
    {
      title: 'Used / Total',
      key: 'size',
      render: (_: any, record: DiskInfo) => `${formatBytes(record.used)} / ${formatBytes(record.size)}`
    }
  ];

  const networkColumns = [
    { title: 'Interface', dataIndex: 'interface', key: 'interface' },
    { title: 'IP Address', dataIndex: 'ip4', key: 'ip4' },
    { title: 'MAC Address', dataIndex: 'mac', key: 'mac' },
    {
      title: 'RX / TX',
      key: 'traffic',
      render: (_: any, record: NetworkInfo) =>
        `${formatBytes(record.rxBytes)} / ${formatBytes(record.txBytes)}`
    }
  ];

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  if (error) return <Alert message="Error" description={error} type="error" />;
  if (!systemInfo) return null;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hostname"
              value={systemInfo.hostname}
              prefix={<DesktopOutlined />}
            />
            <div style={{ marginTop: 8, color: '#8c8c8c' }}>
              {systemInfo.platform} {systemInfo.release}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="CPU Usage"
              value={systemInfo.cpu.usage}
              suffix="%"
              prefix={<CloudOutlined />}
              valueStyle={{ color: systemInfo.cpu.usage > 80 ? '#cf1322' : '#3f8600' }}
            />
            <div style={{ marginTop: 8, color: '#8c8c8c' }}>
              {systemInfo.cpu.model} ({systemInfo.cpu.cores} cores)
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Memory Usage"
              value={systemInfo.memory.usagePercent}
              suffix="%"
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: systemInfo.memory.usagePercent > 80 ? '#cf1322' : '#3f8600' }}
            />
            <div style={{ marginTop: 8, color: '#8c8c8c' }}>
              {formatBytes(systemInfo.memory.used)} / {formatBytes(systemInfo.memory.total)}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Uptime"
              value={formatDuration(systemInfo.uptime)}
              prefix={<SwapOutlined />}
            />
            <div style={{ marginTop: 8, color: '#8c8c8c' }}>
              Load: {systemInfo.loadAverage.map(l => l.toFixed(2)).join(', ')}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="CPU Usage History">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cpuHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#1890ff"
                  fill="#1890ff"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Memory Usage">
            <Progress
              type="circle"
              percent={Math.round(systemInfo.memory.usagePercent)}
              status={systemInfo.memory.usagePercent > 80 ? 'exception' : 'normal'}
              style={{ marginRight: 24 }}
            />
            <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
              <div>Total: {formatBytes(systemInfo.memory.total)}</div>
              <div>Used: {formatBytes(systemInfo.memory.used)}</div>
              <div>Free: {formatBytes(systemInfo.memory.free)}</div>
              <div>Cached: {formatBytes(systemInfo.memory.cached)}</div>
              <div>Buffers: {formatBytes(systemInfo.memory.buffers)}</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Disk Usage">
            <Table
              dataSource={systemInfo.disk}
              columns={diskColumns}
              rowKey="mountPoint"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Network Interfaces">
            <Table
              dataSource={systemInfo.network}
              columns={networkColumns}
              rowKey="interface"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
