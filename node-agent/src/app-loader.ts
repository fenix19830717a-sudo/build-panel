import { join } from 'path';
import { existsSync, readdirSync, readFileSync, watch } from 'fs';
import { Logger } from './logger';
import { AppManifest, LoadedApp, AppContext, AppStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

export class AppLoader {
  private appsDir: string;
  private loadedApps: Map<string, LoadedApp> = new Map();
  private logger: Logger;
  private nodeId: string;
  private hotReload: boolean;
  private watchers: Map<string, any> = new Map();

  constructor(appsDir: string, logger: Logger, nodeId: string, hotReload: boolean = true) {
    this.appsDir = appsDir;
    this.logger = logger;
    this.nodeId = nodeId;
    this.hotReload = hotReload;
  }

  async initialize(): Promise<void> {
    if (!existsSync(this.appsDir)) {
      this.logger.warn(`Apps directory not found: ${this.appsDir}`);
      return;
    }

    const appDirs = readdirSync(this.appsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const appDir of appDirs) {
      try {
        await this.loadApp(appDir);
      } catch (error) {
        this.logger.error(`Failed to load app ${appDir}:`, error);
      }
    }

    if (this.hotReload) {
      this.setupHotReload();
    }
  }

  private async loadApp(appDir: string): Promise<LoadedApp | null> {
    const appPath = join(this.appsDir, appDir);
    const manifestPath = join(appPath, 'manifest.json');

    if (!existsSync(manifestPath)) {
      this.logger.warn(`No manifest.json found in ${appDir}`);
      return null;
    }

    const manifestContent = readFileSync(manifestPath, 'utf-8');
    const manifest: AppManifest = JSON.parse(manifestContent);

    if (!manifest.enabled) {
      this.logger.info(`App ${manifest.name} is disabled, skipping`);
      return null;
    }

    const loadedApp: LoadedApp = {
      manifest,
      status: 'loading',
      module: null,
      memoryUsage: 0,
      requestCount: 0,
      errorCount: 0
    };

    this.loadedApps.set(manifest.id, loadedApp);

    try {
      const entryPath = join(appPath, manifest.entry);
      
      if (!existsSync(entryPath)) {
        throw new Error(`Entry file not found: ${entryPath}`);
      }

      const module = await import(entryPath);
      loadedApp.module = module;
      loadedApp.status = 'running';
      loadedApp.startTime = new Date();

      if (module.default && typeof module.default.onLoad === 'function') {
        const context = this.createAppContext(manifest.id);
        await module.default.onLoad(context);
      }

      this.logger.info(`App loaded successfully: ${manifest.name} v${manifest.version}`, {
        appId: manifest.id,
        routes: manifest.routes.length
      });

      return loadedApp;
    } catch (error: any) {
      loadedApp.status = 'error';
      loadedApp.lastError = error.message;
      this.logger.error(`Failed to load app ${manifest.name}:`, error);
      return loadedApp;
    }
  }

  private createAppContext(appId: string): AppContext {
    return {
      nodeId: this.nodeId,
      appId,
      log: (level: string, message: string, data?: any) => {
        this.logger.log(level, `[${appId}] ${message}`, data);
      },
      db: null,
      fetch: fetch,
      config: {}
    };
  }

  private setupHotReload(): void {
    const watcher = watch(this.appsDir, { recursive: true }, async (eventType, filename) => {
      if (!filename) return;

      const appDir = filename.split(/[/\\]/)[0];
      const loadedApp = Array.from(this.loadedApps.values())
        .find(app => app.manifest.id === appDir || 
          this.appsDir.includes(appDir));

      if (loadedApp) {
        this.logger.info(`Detected change in ${filename}, reloading app...`);
        await this.reloadApp(loadedApp.manifest.id);
      }
    });

    this.watchers.set('apps', watcher);
  }

  async unloadApp(appId: string): Promise<boolean> {
    const loadedApp = this.loadedApps.get(appId);
    if (!loadedApp) {
      this.logger.warn(`App not found: ${appId}`);
      return false;
    }

    try {
      if (loadedApp.module?.default?.onUnload) {
        await loadedApp.module.default.onUnload();
      }

      loadedApp.status = 'stopped';
      this.loadedApps.delete(appId);

      this.logger.info(`App unloaded: ${loadedApp.manifest.name}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to unload app ${appId}:`, error);
      return false;
    }
  }

  async reloadApp(appId: string): Promise<LoadedApp | null> {
    const loadedApp = this.loadedApps.get(appId);
    if (!loadedApp) {
      this.logger.warn(`App not found for reload: ${appId}`);
      return null;
    }

    await this.unloadApp(appId);
    
    const appDir = loadedApp.manifest.entry.split('/')[0];
    return this.loadApp(appDir);
  }

  async loadAppFromManifest(manifest: AppManifest): Promise<LoadedApp | null> {
    const appDir = manifest.id;
    return this.loadApp(appDir);
  }

  getLoadedApps(): Map<string, LoadedApp> {
    return this.loadedApps;
  }

  getApp(appId: string): LoadedApp | undefined {
    return this.loadedApps.get(appId);
  }

  getAppStatuses(): AppStatus[] {
    return Array.from(this.loadedApps.values()).map(app => ({
      appId: app.manifest.id,
      name: app.manifest.name,
      version: app.manifest.version,
      status: app.status,
      memory: app.memoryUsage,
      requests: app.requestCount,
      errors: app.errorCount
    }));
  }

  async handleRequest(appId: string, route: string, method: string, data: any): Promise<any> {
    const loadedApp = this.loadedApps.get(appId);
    if (!loadedApp || loadedApp.status !== 'running') {
      throw new Error(`App not available: ${appId}`);
    }

    const routeConfig = loadedApp.manifest.routes.find(
      r => r.path === route && r.method === method
    );

    if (!routeConfig) {
      throw new Error(`Route not found: ${method} ${route}`);
    }

    try {
      loadedApp.requestCount++;
      
      const handler = loadedApp.module[routeConfig.handler];
      if (!handler || typeof handler !== 'function') {
        throw new Error(`Handler not found: ${routeConfig.handler}`);
      }

      const context = this.createAppContext(appId);
      const result = await handler(context, data);
      
      return result;
    } catch (error: any) {
      loadedApp.errorCount++;
      loadedApp.lastError = error.message;
      throw error;
    }
  }

  shutdown(): void {
    for (const [key, watcher] of this.watchers) {
      watcher.close();
    }
    this.watchers.clear();

    for (const [appId, app] of this.loadedApps) {
      if (app.module?.default?.onUnload) {
        try {
          app.module.default.onUnload();
        } catch (error) {
          this.logger.error(`Error during app unload: ${appId}`, error);
        }
      }
    }

    this.loadedApps.clear();
    this.logger.info('AppLoader shutdown complete');
  }
}
