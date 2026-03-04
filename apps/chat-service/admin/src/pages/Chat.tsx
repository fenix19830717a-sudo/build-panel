import { useState, useEffect, useRef } from 'react';
import { Row, Col, List, Card, Input, Button, Tag, Badge } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';

interface Session {
  id: string;
  visitorId: string;
  visitorName: string;
  status: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  content: string;
  senderType: 'visitor' | 'agent' | 'system';
  senderName?: string;
  createdAt: string;
}

export default function Chat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 加载会话列表
    fetchSessions();
    
    // 连接Socket
    const socket = io('http://localhost:3000/chat');
    socketRef.current = socket;
    
    socket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });
    
    socket.on('new_session', () => {
      fetchSessions();
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/v1/chat/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error('加载会话失败:', err);
    }
  };

  const selectSession = async (session: Session) => {
    setActiveSession(session);
    socketRef.current?.emit('join_session', { sessionId: session.id });
    
    // 加载历史消息
    try {
      const res = await fetch(`/api/v1/chat/sessions/${session.id}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('加载消息失败:', err);
    }
  };

  const sendMessage = () => {
    if (!inputText.trim() || !activeSession || !socketRef.current) return;
    
    socketRef.current.emit('send_message', {
      sessionId: activeSession.id,
      content: inputText,
      senderType: 'agent',
      senderId: 'agent-id',
      senderName: '客服',
    });
    
    setInputText('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'waiting': return 'orange';
      default: return 'default';
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 112px)' }}>
      <h2>实时聊天</h2>
      
      <Row gutter={16} style={{ marginTop: 16, height: 'calc(100% - 50px)' }}>
        <Col span={8} style={{ height: '100%' }}>
          <Card title="会话列表" style={{ height: '100%', overflow: 'auto' }}>
            <List
              dataSource={sessions}
              renderItem={(item) => (
                <List.Item 
                  style={{ 
                    cursor: 'pointer', 
                    background: activeSession?.id === item.id ? '#e6f7ff' : 'transparent',
                    padding: 12
                  }}
                  onClick={() => selectSession(item)}
                >
                  <List.Item.Meta
                    title={
                      <div>
                        <span>{item.visitorName || '访客'}</span>
                        <Tag color={getStatusColor(item.status)} style={{ marginLeft: 8 }}>
                          {item.status === 'active' ? '进行中' : '等待中'}
                        </Tag>
                      </div>
                    }
                    description={item.lastMessage || '暂无消息'}
                  />
                  {item.unreadCount > 0 && (
                    <Badge count={item.unreadCount} />
                  )}
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col span={16} style={{ height: '100%' }}>
          <Card 
            title={activeSession ? `与 ${activeSession.visitorName || '访客'} 的对话` : '请选择会话'}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
          >
            {activeSession ? (
              <>
                <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx}
                      style={{
                        marginBottom: 12,
                        textAlign: msg.senderType === 'visitor' ? 'left' : 'right'
                      }}
                    >
                      {msg.senderType !== 'visitor' && msg.senderType !== 'system' && (
                        <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{msg.senderName || '客服'}</div>
                      )}
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: msg.senderType === 'visitor' ? '#f0f0f0' : '#1890ff',
                          color: msg.senderType === 'visitor' ? '#333' : '#fff',
                          maxWidth: '70%',
                          textAlign: 'left'
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div style={{ padding: 16, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                  <Input.TextArea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="输入消息..."
                    rows={2}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />}
                    onClick={sendMessage}
                    disabled={!inputText.trim()}
                  >
                    发送
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                请从左侧选择一个会话
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
