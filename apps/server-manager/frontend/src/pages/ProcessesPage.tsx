import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Popconfirm, Input, message, Statistic, Row, Col } from 'antd';
import {
  ReloadOutlined, StopOutlined, SearchOutlined,
  DesktopOutlined, DatabaseOutlined
} from '@ant-design/icons';
import { processApi, systemApi } from '../utils/api';
import type { ProcessInfo, CpuInfo, MemoryInfo } from '../types';

const ProcessesPage: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cpuInfo, setCpuInfo] = useState<CpuInfo | null>(null);
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const [processRes, cpuRes, memRes] = await Promise.all([
        processApi.list(),
        systemApi.getCpu(),
        systemApi.getMemory()
      ]) as any;

      if (processRes.code === 0) {
        setProcesses(processRes.data);
      }
      if (cpuRes.code === 0) {
        setCpuInfo(cpuRes.data);
      }
      if (memRes.code === 0) {
        setMemoryInfo(memRes.data);
      }
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleKillProcess = async (pid: number) => {
    try {
      const response = await processApi.kill(pid) as any;
      if (response.code === 0) {
        message.success(`Process ${pid} terminated`);
        fetchProcesses();
      } else {
        message.error(response.message);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const filteredProcesses = processes.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'green';
      case 'sleeping': return 'blue';
      case 'stopped': return 'orange';
      case 'zombie': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'PID',
      dataIndex: 'pid',
      key: 'pid',
      sorter: (a: ProcessInfo, b: ProcessInfo) => a.pid - b.pid,
      width: 80
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: ProcessInfo, b: ProcessInfo) => a.name.localeCompare(b.name)
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 100
    },
    {
      title: 'CPU %',
      dataIndex: 'cpu',
      key: 'cpu',
      sorter: (a: ProcessInfo, b: ProcessInfo) => a.cpu - b.cpu,
      render: (cpu: number) => (
        <Tag color={cpu > 50 ? 'red' : cpu > 20 ? 'orange' : 'green'}>
          {cpu.toFixed(1)}%
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Memory %',
      dataIndex: 'memoryPercent',
      key: 'memoryPercent',
      sorter: (a: ProcessInfo, b: ProcessInfo) => a.memoryPercent - b.memoryPercent,
      render: (mem: number) => (
        <Tag color={mem > 10 ? 'red' : mem > 5 ? 'orange' : 'green'}>
          {mem.toFixed(1)}%
        </Tag>
      ),
      width: 110
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Command',
      dataIndex: 'command',
      key: 'command',
      ellipsis: true,
      width: 300
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ProcessInfo) => (
        <Popconfirm
          title={`Kill process ${record.name} (${record.pid})?`}
          onConfirm={() => handleKillProcess(record.pid)}
          okText="Kill"
          okButtonProps={{ danger: true }}
        >
          <Button
            danger
            icon={<StopOutlined />}
            size="small"
          >
            Kill
          </Button>
        </Popconfirm>
      ),
      width: 100
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="CPU Usage"
              value={cpuInfo?.usage || 0}
              suffix="%"
              prefix={<DesktopOutlined />}
              valueStyle={{ color: (cpuInfo?.usage || 0) > 80 ? '#cf1322' : '#3f8600' }}
            />
            <div style={{ marginTop: 8, color: '#8c8c8c' }}>
              {cpuInfo?.model} ({cpuInfo?.cores} cores)
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Memory Usage"
              value={memoryInfo?.usagePercent || 0}
              suffix="%"
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: (memoryInfo?.usagePercent || 0) > 80 ? '#cf1322' : '#3f8600' }}
            />
            <div style={{ marginTop: 8, color: '#8c8c8c' }}>
              Used: {((memoryInfo?.used || 0) / 1024 / 1024 / 1024).toFixed(2)} GB
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Processes"
              value={processes.length}
              prefix={<DesktopOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Process Manager"
        extra={
          <Space>
            <Input
              placeholder="Search processes..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: 200 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchProcesses}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={filteredProcesses}
          columns={columns}
          rowKey="pid"
          loading={loading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ProcessesPage;
