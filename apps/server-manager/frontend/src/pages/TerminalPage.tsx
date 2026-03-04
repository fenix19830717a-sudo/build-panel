import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Space, message } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io, Socket } from 'socket.io-client';
import 'xterm/css/xterm.css';

interface TerminalSession {
  id: string;
  terminal: XTerm;
  fitAddon: FitAddon;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const TerminalPage: React.FC = () => {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // 连接 WebSocket
    const socket = io(API_BASE_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('terminal:created', ({ terminalId }: { terminalId: string }) => {
      createTerminal(terminalId, socket);
    });

    socket.on('terminal:data', ({ terminalId, data }: { terminalId: string; data: string }) => {
      const session = sessions.find(s => s.id === terminalId);
      if (session) {
        session.terminal.write(data);
      }
    });

    socket.on('terminal:exit', ({ terminalId }: { terminalId: string }) => {
      removeSession(terminalId);
    });

    socket.on('terminal:error', ({ error }: { error: string }) => {
      message.error(error);
    });

    // 创建第一个终端
    createNewSession();

    return () => {
      sessions.forEach(session => {
        session.terminal.dispose();
      });
      socket.disconnect();
    };
  }, []);

  const createTerminal = (terminalId: string, socket: Socket) => {
    const containerRef = React.createRef<HTMLDivElement>();
    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4'
      }
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // 处理输入
    terminal.onData(data => {
      socket.emit('terminal:input', { terminalId, data });
    });

    const newSession: TerminalSession = {
      id: terminalId,
      terminal,
      fitAddon,
      containerRef
    };

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(terminalId);

    // 延迟挂载终端到 DOM
    setTimeout(() => {
      if (containerRef.current) {
        terminal.open(containerRef.current);
        fitAddon.fit();
        terminal.focus();
      }
    }, 100);
  };

  const createNewSession = () => {
    const socket = socketRef.current;
    if (socket) {
      const cols = 80;
      const rows = 24;
      socket.emit('terminal:create', { cols, rows });
    }
  };

  const removeSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.terminal.dispose();
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (activeSessionId === sessionId && sessions.length > 1) {
        const remaining = sessions.filter(s => s.id !== sessionId);
        setActiveSessionId(remaining[0]?.id || null);
      }
    }
  };

  const closeSession = (sessionId: string) => {
    const socket = socketRef.current;
    if (socket) {
      socket.emit('terminal:close', { terminalId: sessionId });
    }
    removeSession(sessionId);
  };

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const activeSession = sessions.find(s => s.id === activeSessionId);
      if (activeSession) {
        activeSession.fitAddon.fit();
        const { cols, rows } = activeSession.terminal;
        socketRef.current?.emit('terminal:resize', {
          terminalId: activeSessionId,
          cols,
          rows
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sessions, activeSessionId]);

  return (
    <Card
      title="Web Terminal"
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={createNewSession}
          >
            New Terminal
          </Button>
        </Space>
      }
    >
      <div>
        {/* 终端标签 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {sessions.map((session, index) => (
            <div
              key={session.id}
              onClick={() => {
                setActiveSessionId(session.id);
                setTimeout(() => session.fitAddon.fit(), 100);
              }}
              style={{
                padding: '8px 16px',
                background: activeSessionId === session.id ? '#1890ff' : '#f0f0f0',
                color: activeSessionId === session.id ? '#fff' : '#000',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              Terminal {index + 1}
              <CloseOutlined
                onClick={(e) => {
                  e.stopPropagation();
                  closeSession(session.id);
                }}
                style={{ fontSize: 12 }}
              />
            </div>
          ))}
        </div>

        {/* 终端容器 */}
        {sessions.map(session => (
          <div
            key={session.id}
            ref={session.containerRef}
            style={{
              display: activeSessionId === session.id ? 'block' : 'none',
              background: '#1e1e1e',
              borderRadius: 4,
              padding: 8,
              height: 500
            }}
          />
        ))}

        {sessions.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            No active terminals. Click "New Terminal" to start.
          </div>
        )}
      </div>
    </Card>
  );
};

export default TerminalPage;
