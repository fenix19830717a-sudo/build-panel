import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';
import * as fs from 'fs';

interface AgentConfig {
  baseURL: string;
  certPath?: string;
  keyPath?: string;
  caPath?: string;
}

@Injectable()
export class AgentClient {
  private readonly logger = new Logger(AgentClient.name);
  private httpsAgent?: https.Agent;

  constructor(private httpService: HttpService) {}

  async executeCommand(serverId: string, command: string, config: AgentConfig) {
    try {
      const agent = this.createHttpsAgent(config);
      const response = await firstValueFrom(
        this.httpService.post(
          `${config.baseURL}/api/v1/exec`,
          { command },
          { httpsAgent: agent, timeout: 30000 },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to execute command on ${serverId}: ${error.message}`);
      throw error;
    }
  }

  async deployContainer(
    serverId: string,
    image: string,
    config: AgentConfig,
    options?: {
      name?: string;
      ports?: Record<string, string>;
      env?: Record<string, string>;
      volumes?: string[];
    },
  ) {
    try {
      const agent = this.createHttpsAgent(config);
      const response = await firstValueFrom(
        this.httpService.post(
          `${config.baseURL}/api/v1/containers/deploy`,
          { image, ...options },
          { httpsAgent: agent, timeout: 120000 },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to deploy container on ${serverId}: ${error.message}`);
      throw error;
    }
  }

  async getContainerStatus(serverId: string, containerId: string, config: AgentConfig) {
    try {
      const agent = this.createHttpsAgent(config);
      const response = await firstValueFrom(
        this.httpService.get(
          `${config.baseURL}/api/v1/containers/${containerId}/status`,
          { httpsAgent: agent, timeout: 10000 },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get container status from ${serverId}: ${error.message}`);
      throw error;
    }
  }

  async getSystemInfo(serverId: string, config: AgentConfig) {
    try {
      const agent = this.createHttpsAgent(config);
      const response = await firstValueFrom(
        this.httpService.get(
          `${config.baseURL}/api/v1/system/info`,
          { httpsAgent: agent, timeout: 10000 },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get system info from ${serverId}: ${error.message}`);
      throw error;
    }
  }

  async streamLogs(
    serverId: string,
    containerId: string,
    config: AgentConfig,
    onLog: (log: string) => void,
  ) {
    try {
      const agent = this.createHttpsAgent(config);
      const response = await firstValueFrom(
        this.httpService.get(
          `${config.baseURL}/api/v1/containers/${containerId}/logs`,
          { httpsAgent: agent, responseType: 'stream' },
        ),
      );

      response.data.on('data', (chunk: Buffer) => {
        onLog(chunk.toString());
      });

      return new Promise((resolve, reject) => {
        response.data.on('end', resolve);
        response.data.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to stream logs from ${serverId}: ${error.message}`);
      throw error;
    }
  }

  private createHttpsAgent(config: AgentConfig): https.Agent | undefined {
    if (!config.certPath || !config.keyPath) {
      return undefined;
    }

    try {
      return new https.Agent({
        cert: fs.readFileSync(config.certPath),
        key: fs.readFileSync(config.keyPath),
        ca: config.caPath ? fs.readFileSync(config.caPath) : undefined,
        rejectUnauthorized: !!config.caPath,
      });
    } catch (error) {
      this.logger.warn(`Failed to create HTTPS agent: ${error.message}`);
      return undefined;
    }
  }
}
