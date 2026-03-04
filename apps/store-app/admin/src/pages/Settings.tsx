import { Card, Form, Input, Button, Switch, Select } from 'antd';

const Settings = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Settings:', values);
  };

  return (
    <div>
      <h1>Settings</h1>

      <Card title="Store Settings" style={{ marginTop: 24, maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Store Name" name="storeName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Store Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Currency" name="currency" initialValue="USD">
            <Select>
              <Select.Option value="USD">USD ($)</Select.Option>
              <Select.Option value="EUR">EUR (€)</Select.Option>
              <Select.Option value="GBP">GBP (£)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Maintenance Mode" name="maintenance" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Save Settings</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
