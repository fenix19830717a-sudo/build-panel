import { Card, Form, Input, Switch, Button } from 'antd'

export function SettingsPage() {
  return (
    <div>
      <h2>Settings</h2>
      
      <Card title="General" style={{ marginTop: 16 }}>
        <Form layout="vertical">
          <Form.Item label="System Name">
            <Input defaultValue="BuildAI Framework" />
          </Form.Item>
          
          <Form.Item label="Agent Port">
            <Input defaultValue="8081" />
          </Form.Item>
          
          <Form.Item label="Enable Notifications">
            <Switch defaultChecked />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary">Save Settings</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
