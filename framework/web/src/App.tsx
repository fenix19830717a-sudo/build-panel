import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth.store'
import { MainLayout } from './layouts/MainLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ServersPage } from './pages/ServersPage'
import { AppsPage } from './pages/AppsPage'
import { TasksPage } from './pages/TasksPage'
import { ApiKeysPage } from './pages/ApiKeysPage'
import { UsersPage } from './pages/UsersPage'
import { SettingsPage } from './pages/SettingsPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="servers" element={<ServersPage />} />
        <Route path="apps" element={<AppsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="api-keys" element={<ApiKeysPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
