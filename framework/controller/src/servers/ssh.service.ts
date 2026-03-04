import { Injectable } from '@nestjs/common';
import { Client } from 'ssh2';

interface SshConnectionOptions {
  host: string;
  port: number;
  username: string;
  privateKey?: string;
  password?: string;
}

@Injectable()
export class SshService {
  async testConnection(options: SshConnectionOptions): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      
      conn.on('ready', () => {
        conn.exec('uname -a', (err, stream) => {
          if (err) {
            conn.end();
            resolve({ success: false, message: err.message });
            return;
          }
          
          let output = '';
          stream.on('close', (code: number) => {
            conn.end();
            if (code === 0) {
              resolve({ success: true, message: `Connected successfully. OS: ${output.trim()}` });
            } else {
              resolve({ success: false, message: `Command exited with code ${code}` });
            }
          }).on('data', (data: Buffer) => {
            output += data.toString();
          }).stderr.on('data', (data: Buffer) => {
            output += data.toString();
          });
        });
      }).on('error', (err) => {
        resolve({ success: false, message: `Connection error: ${err.message}` });
      }).connect({
        host: options.host,
        port: options.port,
        username: options.username,
        privateKey: options.privateKey,
        password: options.password,
        readyTimeout: 10000,
      });
    });
  }

  async executeCommand(
    options: SshConnectionOptions,
    command: string,
  ): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise((resolve) => {
      const conn = new Client();
      
      conn.on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            resolve({ success: false, output: '', error: err.message });
            return;
          }
          
          let stdout = '';
          let stderr = '';
          
          stream.on('close', (code: number) => {
            conn.end();
            resolve({
              success: code === 0,
              output: stdout.trim(),
              error: stderr.trim() || undefined,
            });
          }).on('data', (data: Buffer) => {
            stdout += data.toString();
          }).stderr.on('data', (data: Buffer) => {
            stderr += data.toString();
          });
        });
      }).on('error', (err) => {
        resolve({ success: false, output: '', error: err.message });
      }).connect({
        host: options.host,
        port: options.port,
        username: options.username,
        privateKey: options.privateKey,
        password: options.password,
        readyTimeout: 30000,
      });
    });
  }
}
