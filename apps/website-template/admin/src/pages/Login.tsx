import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  message,
  Space,
  Divider,
} from 'antd/es';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';

const { Title, Text, Link } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { email: string; password: string; remember: boolean }) => {
    setLoading(true);
    
    // 模拟登录
    setTimeout(() => {
      login(
        {
          id: '1',
          email: values.email,
          name: '管理员',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        'mock-token'
      );
      message.success('登录成功');
      navigate('/');
      setLoading(false);
    }, 1000);
  };

  return (
    <Card
      style={{
        width: 420,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRadius: 12,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#fff',
            fontSize: 32,
            fontWeight: 'bold',
          }}
        >
          W
        </div>
        <Title level={3} style={{ margin: 0 }}>WebBuilder Admin</Title>
        <Text type="secondary">登录您的管理后台</Text>
      </div>

      <Form
        name="login"
        onFinish={handleSubmit}
        autoComplete="off"
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="邮箱地址"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
          />
        </Form.Item>

        <Form.Item>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Checkbox name="remember">记住我</Checkbox>
            <Link href="#" style={{ fontSize: 14 }}>忘记密码？</Link>
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            icon={<LoginOutlined />}
          >
            登录
          </Button>
        </Form.Item>
      </Form>

      <Divider>或</Divider>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Button block icon={<GlobalOutlined />}>
          使用 Google 账号登录
        </Button>
      </Space>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Text type="secondary">
          还没有账号？ <Link href="#">立即注册</Link>
        </Text>
      </div>
    </Card>
  );
};

export default Login;
