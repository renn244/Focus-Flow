import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TeamService } from './team.service';
import { Types } from 'mongoose';
import { TeamSharedService } from './team.shared.service';

@WebSocketGateway()
export class TeamGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private logger = new Logger(TeamGateway.name);

    constructor(
        private readonly teamSharedService: TeamSharedService,
    ) {}

    @WebSocketServer() io: Server

    private userIdToSocketId: Record<string, string> = {};
    private socketIdToUserId: Record<string, string> = {};
    private projectIdToUserId: Record<string, string> = {};

    getUserIdBySocketId(socketId: string) {
        return this.socketIdToUserId[socketId];
    }

    getSocketIdByUserId(userId: string) {
        return this.userIdToSocketId[userId];
    }

    getProjectIdByUserId(userId: string) {
        return this.projectIdToUserId[userId];
    }

    async handleConnection(client: any, ...args: any[]) {
        const userId: string = client.handshake?.query?.userId;
        const projectId: string = client.handshake?.query?.projectId;

        const projectMembers = await this.teamSharedService.getMembers(new Types.ObjectId(projectId));
        const projectMemberIds = projectMembers.map(member => member.user._id.toString());

        if(!projectMemberIds.includes(userId)) {
            this.logger.warn(`User ${userId} attempted to connect to project ${projectId} without being a member`);
            return;
        }

        this.userIdToSocketId[userId] = client.id;
        this.projectIdToUserId[userId] = projectId;
        this.socketIdToUserId[client.id] = userId;

        // Kindly check if the userId is a member of the project before joining in 
        client.join(projectId);

        this.logger.log(`User ${userId} connected with socket ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const socketId = client.id;
        const userId = this.getUserIdBySocketId(socketId);

        if(userId) {
            delete this.userIdToSocketId[userId];
            delete this.projectIdToUserId[userId];
            delete this.socketIdToUserId[socketId];

            // Leave the project room no need for permission
            client.leave(this.getProjectIdByUserId(userId));

            this.logger.log(`User ${userId} disconnected from socket ${socketId}`);
        } else {
            this.logger.warn('Attempted to disconnect a socket that is not connected');
        }
    }
}
