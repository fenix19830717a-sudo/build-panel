import { Table, Button, Tag, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery } from 'react-query'
import { serversApi } from '../services/api'

export function ServersPage() {
  const { data: servers, isLoading } = useQuery('servers', () => 
    serversApi.list().then(r => r.data)
  )

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Host', dataIndex: 'host', key: 'host' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'online' ? 'green' : status === 'error' ? 'red' : 'default'}>
          {status}
        </Tag>
      )
    },
    { title: 'OS', dataIndex: 'os', key: 'os' },
    { title: 'Last Heartbeat', dataIndex: 'lastHeartbeat', key: 'lastHeartbeat' },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} size="small">Edit</Button>
          <Button icon={<DeleteOutlined />} size="small" danger>Delete</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Servers</h2>
        <Button type="primary" icon={<PlusOutlined />}>Add Server</Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={servers} 
        loading={isLoading}
        rowKey="id"
      />
    </div>
  )
}
