import express, { Request, Response, NextFunction } from 'express';
import { Logger } from './logger';
import { AppLoader } from './app-loader';
import { NodeConfig } from './types';

export class HttpServer {
  private app: express.Application;
  private port: number;
  private logger: Logger;
  private appLoader: AppLoader;
  private config: NodeConfig;
  private server: any;

  constructor(port: number, logger: Logger, appLoader: AppLoader, config: NodeConfig) {
    this.port = port;
    this.logger = logger;
    this.appLoader = appLoader;
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      this.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      next();
    });

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    });
  }

  private setupRoutes(): void {
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        nodeId: this.config.id,
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/status', (req: Request, res: Response) => {
      const apps = this.appLoader.getAppStatuses();
      res.json({
        nodeId: this.config.id,
        nodeName: this.config.name,
        region: this.config.region,
        type: this.config.type,
        apps,
        uptime: process.uptime()
      });
    });

    this.app.get('/apps', (req: Request, res: Response) => {
      const apps = Array.from(this.appLoader.getLoadedApps().values()).map(app => ({
        id: app.manifest.id,
        name: app.manifest.name,
        version: app.manifest.version,
        status: app.status,
        routes: app.manifest.routes
      }));
      res.json(apps);
    });

    this.app.all('/app/:appId/*', async (req: Request, res: Response) => {
      const { appId } = req.params;
      const route = '/' + req.params[0];
      const method = req.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

      try {
        const result = await this.appLoader.handleRequest(
          appId,
          route,
          method,
          { body: req.body, query: req.query, params: req.params }
        );
        res.json(result);
      } catch (error: any) {
        this.logger.error(`App request failed: ${appId} ${method} ${route}`, error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      this.logger.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  start(): void {
    this.server = this.app.listen(this.port, '0.0.0.0', () => {
      this.logger.info(`HTTP server listening on port ${this.port}`);
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      this.logger.info('HTTP server stopped');
    }
  }
}
