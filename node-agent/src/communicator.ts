import WebSocket from 'ws';
import axios from 'axios';
import { Logger } from './logger';
import { NodeConfig, HeartbeatPayload, CommandMessage, CommandResponse, AppStatus } from './types';
import { SystemMonitor } from './monitor';
import { AppLoader } from './app-loader';
import { v4 as uuidv4 } from 'uuid';

export class NodeCommunicator {
  private config: NodeConfig;
  private logger: Logger;
  private monitor: SystemMonitor;
  private appLoader: AppLoader;
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 5000;
  private heartbeatIntervalMs: number = 30000;
  private isRegistered: boolean = false;
  private token: string = '';

  constructor(
    config: NodeConfig,
    logger: Logger,
    monitor: SystemMonitor,
    appLoader: AppLoader
  ) {
    this.config = config;
    this.logger = logger;
    this.monitor = monitor;
    this.appLoader = appLoader;
  }

  async connect(): Promise<void> {
    try {
      await this.registerWithMaster();
      await this.setupWebSocket();
      this.startHeartbeat();
      this.logger.info('Connected to master server', {
        masterUrl: this.config.masterUrl
      });
    } catch (error) {
      this.logger.error('Failed to connect to master:', error);
      this.scheduleReconnect();
    }
  }

  private async registerWithMaster(): Promise<void> {
    try {
      const response = await axios.post(`${this.config.masterUrl}/api/node/register`, {
        nodeId: this.config.id,
        name: this.config.name,
        region: this.config.region,
        type: this.config.type,
        port: this.config.port,
        secretKey: this.config.secretKey
      });

      if (response.data.success) {
        this.token = response.data.token;
        this.isRegistered = true;
        this.logger.info('Node registered with master', { nodeId: this.config.id });
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      this.logger.error('Registration failed:', error.response?.data || error.message);
      throw error;
    }
  }

  private setupWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.config.masterUrl.replace('http', 'ws') + '/ws/node';
      
      this.ws = new WebSocket(wsUrl, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'X-Node-Id': this.config.id
        }
      });

      this.ws.on('open', () => {
        this.logger.info('WebSocket connection established');
        this.reconnectAttempts = 0;
        resolve();
      });

      this.ws.on('message', (data: Buffer) => {
        this.handleMessage(data);
      });

      this.ws.on('error', (error) => {
        this.logger.error('WebSocket error:', error);
      });

      this.ws.on('close', () => {
        this.logger.warn('WebSocket connection closed');
        this.isRegistered = false;
        this.scheduleReconnect();
      });
    });
  }

  private handleMessage(data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'command':
          this.handleCommand(message.payload as CommandMessage);
          break;
        case 'ping':
          this.sendPong();
          break;
        default:
          this.logger.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      this.logger.error('Failed to parse message:', error);
    }
  }

  private async handleCommand(command: CommandMessage): Promise<void> {
    const response: CommandResponse = {
      id: command.id,
      success: false,
      timestamp: new Date().toISOString()
    };

    try {
      switch (command.type) {
        case 'app_load':
          const loadResult = await this.appLoader.loadAppFromManifest(command.payload);
          response.success = !!loadResult;
          response.result = loadResult ? { appId: loadResult.manifest.id } : null;
          break;

        case 'app_unload':
          const unloadResult = await this.appLoader.unloadApp(command.payload.appId);
          response.success = unloadResult;
          break;

        case 'app_reload':
          const reloadResult = await this.appLoader.reloadApp(command.payload.appId);
          response.success = !!reloadResult;
          break;

        case 'execute':
          const executeResult = await this.appLoader.handleRequest(
            command.payload.appId,
            command.payload.route,
            command.payload.method,
            command.payload.data
          );
          response.success = true;
          response.result = executeResult;
          break;

        case 'config_update':
          this.logger.info('Config update received:', command.payload);
          response.success = true;
          break;

        case 'shutdown':
          this.logger.info('Shutdown command received');
          response.success = true;
          this.send(response);
          setTimeout(() => process.exit(0), 1000);
          return;

        default:
          response.error = `Unknown command type: ${command.type}`;
      }
    } catch (error: any) {
      response.error = error.message;
      this.logger.error('Command execution failed:', error);
    }

    this.send(response);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      await this.sendHeartbeat();
    }, this.heartbeatIntervalMs);
  }

  private async sendHeartbeat(): Promise<void> {
    const apps = this.appLoader.getAppStatuses();
    const status = await this.monitor.getNodeStatus(
      this.config.id,
      this.config.name,
      apps
    );

    const payload: HeartbeatPayload = {
      nodeId: this.config.id,
      timestamp: new Date().toISOString(),
      status,
      apps
    };

    try {
      await axios.post(`${this.config.masterUrl}/api/node/heartbeat`, payload, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
    } catch (error) {
      this.logger.error('Heartbeat failed:', error);
    }
  }

  private sendPong(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnect attempts reached, giving up');
      return;
    }

    this.reconnectAttempts++;
    this.logger.info(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  async disconnect(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    try {
      await axios.post(`${this.config.masterUrl}/api/node/unregister`, {
        nodeId: this.config.id
      }, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
    } catch (error) {
      this.logger.error('Failed to unregister:', error);
    }

    this.logger.info('Disconnected from master');
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
