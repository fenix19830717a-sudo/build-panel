import React from 'react'
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Select,
  Divider,
  Typography,
  Space,
  Alert,
  Tabs,
  InputNumber,
} from 'antd'
import {
  SaveOutlined,
  MailOutlined,
  BellOutlined,
  SafetyOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import { message } from 'antd'

const { Title, Text } = Typography
const { TabPane } = Tabs

const Settings: React.FC = () => {
  const [form] = Form.useForm()

  const handleSave = () => {
    message.success('Settings saved successfully')
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      <Card className="card-hover">
        <Tabs defaultActiveKey="general">
          <TabPane tab="General" key="general">
            <Form layout="vertical" form={form}>
              <Title level={5}>Application Settings</Title>
              
              <Form.Item label="Application Name" name="appName">
                <Input defaultValue="DBBackup" />
              </Form.Item>

              <Form.Item label="Default Backup Directory" name="backupDir">
                <Input defaultValue="/app/backups" />
              </Form.Item>

              <Form.Item label="Max Concurrent Backups" name="maxConcurrent">
                <InputNumber min={1} max={10} defaultValue={3} />
              </Form.Item>

              <Divider />

              <Title level={5}>Retention Policy</Title>

              <Form.Item label="Default Retention Period" name="retentionDays">
                <InputNumber min={1} defaultValue={30} addonAfter="days" />
              </Form.Item>

              <Form.Item name="autoCleanup" valuePropName="checked">
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" defaultChecked />
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Security" key="security">
            <Form layout="vertical">
              <Alert
                message="Encryption Settings"
                description="Configure default encryption settings for backups"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form.Item name="encryptBackups" valuePropName="checked">
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" defaultChecked />
              </Form.Item>

              <Form.Item label="Encryption Algorithm" name="encryptionAlgorithm">
                <Select defaultValue="aes-256-cbc">
                  <Select.Option value="aes-256-cbc">AES-256-CBC</Select.Option>
                  <Select.Option value="aes-128-cbc">AES-128-CBC</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Master Key" name="masterKey">
                <Input.Password placeholder="Leave empty to keep current" />
              </Form.Item>

              <Divider />

              <Title level={5}>Authentication</Title>

              <Form.Item name="requireAuth" valuePropName="checked">
                <Switch checkedChildren="Required" unCheckedChildren="Optional" defaultChecked />
              </Form.Item>

              <Form.Item label="Session Timeout (minutes)" name="sessionTimeout">
                <InputNumber min={5} max={1440} defaultValue={60} />
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Notifications" key="notifications">
            <Form layout="vertical">
              <Title level={5}>Email Notifications</Title>

              <Form.Item name="emailEnabled" valuePropName="checked">
                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
              </Form.Item>

              <Form.Item label="SMTP Host" name="smtpHost">
                <Input />
              </Form.Item>

              <Form.Item label="SMTP Port" name="smtpPort">
                <InputNumber />
              </Form.Item>

              <Form.Item label="SMTP Username" name="smtpUser">
                <Input />
              </Form.Item>

              <Form.Item label="SMTP Password" name="smtpPass">
                <Input.Password />
              </Form.Item>

              <Form.Item label="From Email" name="fromEmail">
                <Input placeholder="noreply@example.com" />
              </Form.Item>

              <Divider />

              <Title level={5}>Notification Events</Title>

              <Form.Item name="notifyOnSuccess" valuePropName="checked">
                <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
              </Form.Item>
              <Text type="secondary">Notify on backup success</Text>

              <Form.Item name="notifyOnFailure" valuePropName="checked">
                <Switch checkedChildren="On" unCheckedChildren="Off" defaultChecked />
              </Form.Item>
              <Text type="secondary">Notify on backup failure</Text>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default Settings
