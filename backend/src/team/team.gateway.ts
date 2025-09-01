import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class TeamGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor() {}

    private logger = new Logger(TeamGateway.name);

    @WebSocketServer() io: Server

    private userIdToSocketId: Record<string, string> = {};
    private socketIdToUserId: Record<string, string> = {};

    getUserIdBySocketId(socketId: string) {
        return this.socketIdToUserId[socketId];
    }

    getSocketIdByUserId(userId: string) {
        return this.userIdToSocketId[userId];
    }

    handleConnection(client: any, ...args: any[]) {
        const userId = client.handshake?.query?.userId;
        this.userIdToSocketId[userId] = client.id;
        this.socketIdToUserId[client.id] = userId;

        this.logger.log(`User ${userId} connected with socket ${client.id}`);
    }

    handleDisconnect(client: any) {
        const socketId = client.id;
        const userId = this.getUserIdBySocketId(socketId);

        if(userId) {
            delete this.userIdToSocketId[userId];
            delete this.socketIdToUserId[socketId];

            this.logger.log(`User ${userId} disconnected from socket ${socketId}`);
        } else {
            this.logger.warn('Attempted to disconnect a socket that is not connected');
        }
    }
}
