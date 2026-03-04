import { Table, Button, Tag, message } from 'antd'
import { PlusOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { apiKeysApi } from '../services/api'

export function ApiKeysPage() {
  const queryClient = useQueryClient()
  
  const { data: apiKeys, isLoading } = useQuery('api-keys', () => 
    apiKeysApi.list().then(r => r.data)
  )

  const deleteMutation = useMutation(
    (id: string) => apiKeysApi.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('api-keys')
        message.success('API Key deleted')
      },
    }
  )

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Provider', dataIndex: 'provider', key: 'provider' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag>
      )
    },
    { title: 'Used', dataIndex: 'used', key: 'used' },
    { title: 'Quota', dataIndex: 'quota', key: 'quota' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button 
          icon={<DeleteOutlined />} 
          size="small" 
          danger
          onClick={() => deleteMutation.mutate(record.id)}
        >
          Delete
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>API Keys</h2>
        <Button type="primary" icon={<PlusOutlined />}>Create API Key</Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={apiKeys} 
        loading={isLoading}
        rowKey="id"
      />
    </div>
  )
}
