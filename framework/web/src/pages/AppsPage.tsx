import { Table, Button, Tag, Space } from 'antd'
import { PlusOutlined, DeploymentUnitOutlined } from '@ant-design/icons'
import { useQuery } from 'react-query'
import { appsApi } from '../services/api'

export function AppsPage() {
  const { data: apps, isLoading } = useQuery('apps', () => 
    appsApi.list().then(r => r.data)
  )

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Version', dataIndex: 'version', key: 'version' },
    { title: 'Image', dataIndex: 'image', key: 'image' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'default'}>{status}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<DeploymentUnitOutlined />} size="small" type="primary">Deploy</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Applications</h2>
        <Button type="primary" icon={<PlusOutlined />}>Create App</Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={apps} 
        loading={isLoading}
        rowKey="id"
      />
    </div>
  )
}
