import { Card, Form, Input, Button, Switch, Select, Divider, Tabs } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

export default function Settings() {
  const [generalForm] = Form.useForm();
  const [aiForm] = Form.useForm();

  const handleSaveGeneral = (values: any) => {
    console.log('保存通用设置:', values);
  };

  const handleSaveAI = (values: any) => {
    console.log('保存AI设置:', values);
  };

  return (
    <div>
      <h2>系统设置</h2>
      
      <Tabs defaultActiveKey="general" style={{ marginTop: 24 }}>
        <TabPane tab="通用设置" key="general">
          <Card>
            <Form form={generalForm} layout="vertical" onFinish={handleSaveGeneral}>
              <Form.Item name="siteName" label="网站名称" initialValue="ChatService">
                <Input />
              </Form.Item>
              
              <Form.Item name="welcomeMessage" label="欢迎语" initialValue="您好！有什么可以帮助您的吗？">
                <TextArea rows={3} />
              </Form.Item>
              
              <Form.Item name="offlineMessage" label="离线消息" initialValue="当前无客服在线，请留言，我们会尽快回复。">
                <TextArea rows={3} />
              </Form.Item>
              
              <Form.Item name="enableSound" label="启用提示音" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
              
              <Form.Item name="autoReply" label="自动回复" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="AI设置" key="ai">
          <Card>
            <Form form={aiForm} layout="vertical" onFinish={handleSaveAI}>
              <Form.Item name="enableAI" label="启用AI客服" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
              
              <Form.Item name="aiModel" label="AI模型" initialValue="default">
                <Select>
                  <Option value="default">默认模型</Option>
                  <Option value="advanced">高级模型</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name="autoClassify" label="自动工单分类" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
              
              <Form.Item name="intentRecognition" label="意图识别" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
              
              <Divider />
              
              <Form.Item name="greetingIntent" label="问候意图关键词" initialValue="你好,您好,在吗,hello,hi">
                <Input placeholder="用逗号分隔" />
              </Form.Item>
              
              <Form.Item name="helpIntent" label="帮助意图关键词" initialValue="帮助,支持,help,怎么,如何">
                <Input placeholder="用逗号分隔" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                  保存AI设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="外观设置" key="appearance">
          <Card>
            <Form layout="vertical">
              <Form.Item name="primaryColor" label="主题色" initialValue="#1890ff">
                <Input type="color" style={{ width: 100, height: 40 }} />
              </Form.Item>
              
              <Form.Item name="widgetPosition" label="组件位置" initialValue="right">
                <Select>
                  <Option value="right">右下角</Option>
                  <Option value="left">左下角</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name="showAvatar" label="显示头像" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}
