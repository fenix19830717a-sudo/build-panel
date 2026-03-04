import { Table, Button, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery } from 'react-query'
import { usersApi } from '../services/api'

export function UsersPage() {
  const { data: users, isLoading } = useQuery('users', () => 
    usersApi.list().then(r => r.data)
  )

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Role', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : role === 'manager' ? 'blue' : 'default'}>
          {role}
        </Tag>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag>
      )
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Users</h2>
        <Button type="primary" icon={<PlusOutlined />}>Add User</Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={users} 
        loading={isLoading}
        rowKey="id"
      />
    </div>
  )
}
