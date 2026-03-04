import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import './ChatWidget.css';

interface Message {
  id: string;
  content: string;
  senderType: 'visitor' | 'agent' | 'system' | 'bot';
  senderName?: string;
  createdAt: string;
}

interface ChatWidgetProps {
  apiUrl?: string;
  widgetTitle?: string;
  primaryColor?: string;
}

export function ChatWidget({ 
  apiUrl = 'http://localhost:3000', 
  widgetTitle = '在线客服',
  primaryColor = '#1890ff'
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentName, setAgentName] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const visitorId = localStorage.getItem('chat_visitor_id') || `visitor_${Date.now()}`;
  localStorage.setItem('chat_visitor_id', visitorId);

  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession();
    }
    return () => {
      socketRef.current?.disconnect();
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createSession = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, visitorName: '访客' }),
      });
      const data = await res.json();
      setSessionId(data.id);
      connectSocket(data.id);
    } catch (err) {
      console.error('创建会话失败:', err);
    }
  };

  const connectSocket = (sid: string) => {
    const socket = io(`${apiUrl}/chat`);
    socketRef.current = socket;
    
    socket.emit('join_session', { sessionId: sid });
    
    socket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });
    
    socket.on('agent_joined', (data: { agentName: string }) => {
      setAgentName(data.agentName);
    });

    socket.on('typing', (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });
  };

  const sendMessage = () => {
    if (!inputText.trim() || !socketRef.current || !sessionId) return;
    
    socketRef.current.emit('send_message', {
      sessionId,
      content: inputText,
      senderType: 'visitor',
    });
    
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getQuickReplies = () => [
    '产品价格',
    '技术支持',
    '账户问题',
    '其他问题',
  ];

  const sendQuickReply = (text: string) => {
    if (!socketRef.current || !sessionId) return;
    socketRef.current.emit('send_message', {
      sessionId,
      content: text,
      senderType: 'visitor',
    });
  };

  return (
    <div className="chat-widget-container">
      {/* 悬浮按钮 */}
      {!isOpen && (
        <button 
          className="chat-widget-button"
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: primaryColor }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="chat-widget-window">
          {/* 头部 */}
          <div className="chat-widget-header" style={{ backgroundColor: primaryColor }}>
            <div className="chat-widget-header-info">
              <span className="chat-widget-title">{widgetTitle}</span>
              {agentName && <span className="chat-widget-agent">{agentName}</span>}
            </div>
            <button className="chat-widget-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          {/* 消息列表 */}
          <div className="chat-widget-messages">
            {messages.length === 0 && (
              <div className="chat-widget-welcome">
                <p>您好！有什么可以帮助您的吗？</p>
                <div className="chat-widget-quick-replies">
                  {getQuickReplies().map(reply => (
                    <button 
                      key={reply} 
                      className="chat-widget-quick-reply"
                      onClick={() => sendQuickReply(reply)}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`chat-message chat-message-${msg.senderType}`}
              >
                {msg.senderType !== 'visitor' && (
                  <span className="chat-message-sender">{msg.senderName || '客服'}</span>
                )}
                <div className="chat-message-content">{msg.content}</div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-typing">
                <span>客服正在输入...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="chat-widget-input">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="输入消息..."
              rows={1}
            />
            <button 
              className="chat-widget-send"
              onClick={sendMessage}
              disabled={!inputText.trim()}
              style={{ backgroundColor: primaryColor }}
            >
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
