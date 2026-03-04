import { Card, Form, Input, Button, Switch, message, Tabs } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

export function SettingsPage() {
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    console.log('Save settings:', values);
    message.success('设置已保存');
  };

  return (
    <div>
      <h2>系统设置</h2>

      <Tabs
        items={[
          {
            key: 'site',
            label: '站点设置',
            children: (
              <Card>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                  <Form.Item name="siteName" label="站点名称" initialValue="CMS App">
                    <Input />
                  </Form.Item>

                  <Form.Item name="siteDescription" label="站点描述">
                    <Input.TextArea rows={3} />
                  </Form.Item>

                  <Form.Item name="logo" label="Logo URL">
                    <Input placeholder="https://..." />
                  </Form.Item>

                  <Form.Item name="favicon" label="Favicon URL">
                    <Input placeholder="https://..." />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      保存设置
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'seo',
            label: 'SEO设置',
            children: (
              <Card>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                  <Form.Item name="defaultMetaTitle" label="默认Meta标题">
                    <Input />
                  </Form.Item>

                  <Form.Item name="defaultMetaDescription" label="默认Meta描述">
                    <Input.TextArea rows={3} />
                  </Form.Item>

                  <Form.Item name="defaultMetaKeywords" label="默认关键词">
                    <Input placeholder="关键词1, 关键词2" />
                  </Form.Item>

                  <Form.Item name="enableSitemap" label="启用Sitemap" valuePropName="checked">
                    <Switch />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      保存设置
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'ai',
            label: 'AI设置',
            children: (
              <Card>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                  <Form.Item name="aiEnabled" label="启用AI功能" valuePropName="checked">
                    <Switch />
                  </Form.Item>

                  <Form.Item name="aiApiKey" label="AI API Key">
                    <Input.Password placeholder="sk-..." />
                  </Form.Item>

                  <Form.Item name="aiModel" label="AI模型" initialValue="gpt-4">
                    <Input />
                  </Form.Item>

                  <Form.Item name="aiApiUrl" label="API地址">
                    <Input placeholder="https://api.openai.com/v1" />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      保存设置
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
