import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribe(client: Socket, payload: {
        channel: string;
    }): {
        event: string;
        data: string;
    };
    handleUnsubscribe(client: Socket, payload: {
        channel: string;
    }): {
        event: string;
        data: string;
    };
    broadcastServerStatus(serverId: string, status: any): void;
    broadcastTaskUpdate(userId: string, task: any): void;
    broadcastAgentHeartbeat(serverId: string, data: any): void;
    sendNotification(userId: string, notification: any): void;
}
