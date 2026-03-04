"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SshService = void 0;
const common_1 = require("@nestjs/common");
const ssh2_1 = require("ssh2");
let SshService = class SshService {
    async testConnection(options) {
        return new Promise((resolve, reject) => {
            const conn = new ssh2_1.Client();
            conn.on('ready', () => {
                conn.exec('uname -a', (err, stream) => {
                    if (err) {
                        conn.end();
                        resolve({ success: false, message: err.message });
                        return;
                    }
                    let output = '';
                    stream.on('close', (code) => {
                        conn.end();
                        if (code === 0) {
                            resolve({ success: true, message: `Connected successfully. OS: ${output.trim()}` });
                        }
                        else {
                            resolve({ success: false, message: `Command exited with code ${code}` });
                        }
                    }).on('data', (data) => {
                        output += data.toString();
                    }).stderr.on('data', (data) => {
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
    async executeCommand(options, command) {
        return new Promise((resolve) => {
            const conn = new ssh2_1.Client();
            conn.on('ready', () => {
                conn.exec(command, (err, stream) => {
                    if (err) {
                        conn.end();
                        resolve({ success: false, output: '', error: err.message });
                        return;
                    }
                    let stdout = '';
                    let stderr = '';
                    stream.on('close', (code) => {
                        conn.end();
                        resolve({
                            success: code === 0,
                            output: stdout.trim(),
                            error: stderr.trim() || undefined,
                        });
                    }).on('data', (data) => {
                        stdout += data.toString();
                    }).stderr.on('data', (data) => {
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
};
exports.SshService = SshService;
exports.SshService = SshService = __decorate([
    (0, common_1.Injectable)()
], SshService);
//# sourceMappingURL=ssh.service.js.map