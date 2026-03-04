import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);

    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      return true;
    } catch {
      return false;
    }
  }

  private extractToken(client: Socket): string | undefined {
    const auth = client.handshake.auth.token || client.handshake.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }
    return auth;
  }
}
