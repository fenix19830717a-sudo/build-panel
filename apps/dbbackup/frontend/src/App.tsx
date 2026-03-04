import React from 'react'
import { Layout } from 'antd'
import AppRoutes from './routes'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

const { Content } = Layout

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />
        <Content style={{ margin: '24px', padding: 24, background: '#fff', borderRadius: 8 }}>
          <AppRoutes />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
