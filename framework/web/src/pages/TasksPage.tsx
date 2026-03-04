import { Table, Button, Tag } from 'antd'
import { useQuery } from 'react-query'
import { tasksApi } from '../services/api'

export function TasksPage() {
  const { data: tasks, isLoading } = useQuery('tasks', () => 
    tasksApi.list().then(r => r.data)
  )

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'default',
      running: 'blue',
      success: 'green',
      failed: 'red',
      cancelled: 'orange',
    }
    return colors[status] || 'default'
  }

  const columns = [
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Target', dataIndex: 'targetType', key: 'targetType' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        record.status === 'pending' && (
          <Button size="small" onClick={() => tasksApi.cancel(record.id)}>
            Cancel
          </Button>
        )
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>Tasks</h2>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={tasks} 
        loading={isLoading}
        rowKey="id"
      />
    </div>
  )
}
