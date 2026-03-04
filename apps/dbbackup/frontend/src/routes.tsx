import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Databases from './pages/Databases'
import Backups from './pages/Backups'
import BackupJobs from './pages/BackupJobs'
import Restore from './pages/Restore'
import Storage from './pages/Storage'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/databases" element={<Databases />} />
      <Route path="/backups" element={<Backups />} />
      <Route path="/jobs" element={<BackupJobs />} />
      <Route path="/restore" element={<Restore />} />
      <Route path="/storage" element={<Storage />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default AppRoutes
