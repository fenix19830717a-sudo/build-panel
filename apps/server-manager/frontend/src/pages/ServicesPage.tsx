import React, { useEffect, useState } from 'react';
import {
  Card, Table, Button, Space, Tag, message, Input, Modal, Spin
} from 'antd';
import {
  ReloadOutlined, PlayCircleOutlined, StopOutlined,
  RedoOutlined, SearchOutlined, FileTextOutlined,
  CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { serviceApi } from '../utils/api';
import type { ServiceInfo } from '../types';

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await serviceApi.list() as any;
      if (response.code === 0) {
        setServices(response.data);
      } else {
        message.error(response.message);
      }
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleServiceAction = async (action: string, serviceName: string) => {
    try {
      let response;
      switch (action) {
        case 'start':
          response = await serviceApi.start(serviceName) as any;
          break;
        case 'stop':
          response = await serviceApi.stop(serviceName) as any;
          break;
        case 'restart':
          response = await serviceApi.restart(serviceName) as any;
          break;
        case 'enable':
          response = await serviceApi.enable(serviceName) as any;
          break;
        case 'disable':
          response = await serviceApi.disable(serviceName) as any;
          break;
        default:
          return;
      }

      if (response.code === 0) {
        message.success(response.message);
        fetchServices();
      } else {
        message.error(response.message);
      }
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleViewLogs = async (service: ServiceInfo) => {
    setSelectedService(service);
    setLogsModalVisible(true);
    setLogsLoading(true);

    try {
      const response = await serviceApi.logs(service.name, 100) as any;
      if (response.code === 0) {
        setLogs(response.data.logs);
      } else {
        message.error(response.message);
      }
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLogsLoading(false);
    }
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'failed': return 'error';
      default: return 'warning';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: ServiceInfo, b: ServiceInfo) => a.name.localeCompare(b.name)
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Failed', value: 'failed' }
      ],
      onFilter: (value: any, record: ServiceInfo) => record.status === value,
      width: 120
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        enabled ? (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        )
      ),
      width: 100
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ServiceInfo) => (
        <Space>
          {record.status !== 'active' && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="small"
              onClick={() => handleServiceAction('start', record.name)}
            >
              Start
            </Button>
          )}
          {record.status === 'active' && (
            <Button
              danger
              icon={<StopOutlined />}
              size="small"
              onClick={() => handleServiceAction('stop', record.name)}
            >
              Stop
            </Button>
          )}
          <Button
            icon={<RedoOutlined />}
            size="small"
            onClick={() => handleServiceAction('restart', record.name)}
          >
            Restart
          </Button>
          <Button
            icon={<FileTextOutlined />}
            size="small"
            onClick={() => handleViewLogs(record)}
          >
            Logs
          </Button>
        </Space>
      ),
      width: 300
    }
  ];

  return (
    <Card
      title="Service Manager"
      extra={
        <Space>
          <Input
            placeholder="Search services..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchServices}
          >
            Refresh
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={filteredServices}
        columns={columns}
        rowKey="name"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={`Logs: ${selectedService?.name}`}
        open={logsModalVisible}
        onCancel={() => {
          setLogsModalVisible(false);
          setLogs([]);
        }}
        width={900}
        footer={[
          <Button key="close" onClick={() => setLogsModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {logsLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <div
            style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: 16,
              borderRadius: 4,
              maxHeight: 500,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: 12
            }}
          >
            {logs.length === 0 ? (
              <div style={{ color: '#666' }}>No logs available</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: 2, whiteSpace: 'pre-wrap' }}>
                  {log}
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default ServicesPage;
