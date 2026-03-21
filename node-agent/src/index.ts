import { config } from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, Logger } from './logger';
import { SystemMonitor } from './monitor';
import { AppLoader } from './app-loader';
import { NodeCommunicator } from './communicator';
import { HttpServer } from './http-server';
import { NodeConfig } from './types';

config();

interface AppConfig {
  node: {
    name: string;
    region: string;
    type: 'worker' | 'proxy' | 'browser' | 'trading';
    port: number;
  };
  master: {
    url: string;
    heartbeatInterval: number;
    reconnectDelay: number;
    maxReconnectAttempts: number;
  };
  security: {
    secretKey: string;
    tokenExpiry: number;
  };
  apps: {
    directory: string;
    autoLoad: boolean;
    hotReload: boolean;
  };
  monitoring: {
    enabled: boolean;
    interval: number;
    metrics: string[];
  };
  logging: {
    level: string;
    file: string;
    maxSize: number;
    maxFiles: number;
  };
}

class NodeAgent {
  private config: AppConfig;
  private nodeConfig: NodeConfig;
  private logger: Logger;
  private monitor: SystemMonitor;
  private appLoader: AppLoader;
  private communicator: NodeCommunicator;
  private httpServer: HttpServer;

  constructor() {
    this.config = this.loadConfig();
    this.nodeConfig = this.createNodeConfig();
    this.logger = createLogger(this.config.logging.level, this.config.logging.file);
    this.monitor = new SystemMonitor();
    this.appLoader = new AppLoader(
      this.config.apps.directory,
      this.logger,
      this.nodeConfig.id,
      this.config.apps.hotReload
    );
    this.communicator = new NodeCommunicator(
      this.nodeConfig,
      this.logger,
      this.monitor,
      this.appLoader
    );
    this.httpServer = new HttpServer(
      this.nodeConfig.port,
      this.logger,
      this.appLoader,
      this.nodeConfig
    );
  }

  private loadConfig(): AppConfig {
    const configPath = join(__dirname, '../config/default.json');
    
    if (existsSync(configPath)) {
      const configContent = require(configPath);
      return {
        ...configContent,
        node: {
          ...configContent.node,
          name: process.env.NODE_NAME || configContent.node.name,
          port: parseInt(process.env.NODE_PORT || configContent.node.port.toString()),
          region: process.env.NODE_REGION || configContent.node.region,
          type: (process.env.NODE_TYPE as any) || configContent.node.type
        },
        master: {
          ...configContent.master,
          url: process.env.MASTER_URL || configContent.master.url
        },
        security: {
          ...configContent.security,
          secretKey: process.env.SECRET_KEY || configContent.security.secretKey
        }
      };
    }

    return {
      node: {
        name: process.env.NODE_NAME || 'Node-Agent',
        region: process.env.NODE_REGION || 'default',
        type: (process.env.NODE_TYPE as any) || 'worker',
        port: parseInt(process.env.NODE_PORT || '3100')
      },
      master: {
        url: process.env.MASTER_URL || 'http://localhost:3000',
        heartbeatInterval: 30000,
        reconnectDelay: 5000,
        maxReconnectAttempts: 10
      },
      security: {
        secretKey: process.env.SECRET_KEY || 'default-secret-key',
        tokenExpiry: 3600
      },
      apps: {
        directory: './apps',
        autoLoad: true,
        hotReload: true
      },
      monitoring: {
        enabled: true,
        interval: 10000,
        metrics: ['cpu', 'memory', 'disk', 'network']
      },
      logging: {
        level: 'info',
        file: 'agent.log',
        maxSize: 10485760,
        maxFiles: 5
      }
    };
  }

  private createNodeConfig(): NodeConfig {
    return {
      id: process.env.NODE_ID || uuidv4(),
      name: this.config.node.name,
      region: this.config.node.region,
      type: this.config.node.type,
      port: this.config.node.port,
      masterUrl: this.config.master.url,
      secretKey: this.config.security.secretKey
    };
  }

  async start(): Promise<void> {
    this.logger.info('Starting Node Agent...', {
      nodeId: this.nodeConfig.id,
      nodeName: this.nodeConfig.name,
      masterUrl: this.nodeConfig.masterUrl
    });

    this.setupGracefulShutdown();

    if (this.config.apps.autoLoad) {
      await this.appLoader.initialize();
    }

    this.httpServer.start();

    await this.communicator.connect();

    this.logger.info('Node Agent started successfully');
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}, shutting down...`);

      await this.communicator.disconnect();
      this.appLoader.shutdown();
      this.httpServer.stop();

      this.logger.info('Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

async function main() {
  const agent = new NodeAgent();
  await agent.start();
}

main().catch((error) => {
  console.error('Failed to start Node Agent:', error);
  process.exit(1);
});

export { NodeAgent };
