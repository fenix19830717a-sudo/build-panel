import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import MainLayout from './components/Layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Monitors from './pages/Monitors'
import MonitorDetail from './pages/MonitorDetail'
import Alerts from './pages/Alerts'
import AlertChannels from './pages/AlertChannels'

const { Content } = Layout

function App() {
  return (
    <Router>
      <MainLayout>
        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/monitors" element={<Monitors />} />
            <Route path="/monitors/:id" element={<MonitorDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/alert-channels" element={<AlertChannels />} />
          </Routes>
        </Content>
      </MainLayout>
    </Router>
  )
}

export default App
