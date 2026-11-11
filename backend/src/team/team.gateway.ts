import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { TeamSharedService } from './team.shared.service';

type Connection = { userId: string; projectId: string };

/**
 * Live project presence. A person can have several sockets open (tabs, quick
 * reloads), so everything is tracked per socket and a user only "leaves" a
 * project when their last socket for it closes.
 */
@WebSocketGateway()
export class TeamGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private logger = new Logger(TeamGateway.name);

    constructor(
        private readonly teamSharedService: TeamSharedService,
    ) {}

    @WebSocketServer() io: Server

    /** socket id -> who it belongs to and which project it is watching */
    private connections = new Map<string, Connection>();
    /** project id -> user id -> number of open sockets */
    private presence = new Map<string, Map<string, number>>();

    getUserIdBySocketId(socketId: string) {
        return this.connections.get(socketId)?.userId;
    }

    /** The user's most recently opened socket. */
    getSocketIdByUserId(userId: string) {
        let latest: string | undefined;
        for (const [socketId, connection] of this.connections) {
            if (connection.userId === userId) latest = socketId;
        }
        return latest;
    }

    /** The project the user most recently opened, used to address live updates. */
    getProjectIdByUserId(userId: string) {
        const socketId = this.getSocketIdByUserId(userId);
        return socketId ? this.connections.get(socketId)?.projectId : undefined;
    }

    getUserIdsInProject(projectId: string) {
        return [...(this.presence.get(projectId)?.keys() ?? [])];
    }

    async handleConnection(client: Socket) {
        const userId = String(client.handshake?.query?.userId ?? '');
        const projectId = String(client.handshake?.query?.projectId ?? '');

        if (!userId || !Types.ObjectId.isValid(projectId)) {
            this.logger.warn(`Rejected socket ${client.id}: missing user or invalid project id`);
            client.disconnect(true);
            return;
        }

        try {
            const projectMembers = await this.teamSharedService.getMembers(new Types.ObjectId(projectId));
            const member = projectMembers.find((entry) => entry.user._id.toString() === userId)?.user;

            if (!member) {
                this.logger.warn(`User ${userId} attempted to connect to project ${projectId} without being a member`);
                client.disconnect(true);
                return;
            }
            // The tab may have closed while membership was being checked.
            if (client.disconnected) return;

            this.connections.set(client.id, { userId, projectId });
            await client.join(projectId);

            const users = this.presence.get(projectId) ?? new Map<string, number>();
            const openSockets = (users.get(userId) ?? 0) + 1;
            users.set(userId, openSockets);
            this.presence.set(projectId, users);

            if (openSockets === 1) this.io.to(projectId).emit('userJoined', member);
            this.logger.log(`User ${userId} connected with socket ${client.id}`);
        } catch (error) {
            this.logger.error(`Socket ${client.id} could not join project ${projectId}: ${(error as Error).message}`);
            this.connections.delete(client.id);
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        const connection = this.connections.get(client.id);
        if (!connection) return;

        this.connections.delete(client.id);
        const { userId, projectId } = connection;

        const users = this.presence.get(projectId);
        const remaining = (users?.get(userId) ?? 1) - 1;
        if (users && remaining > 0) {
            users.set(userId, remaining);
        } else {
            users?.delete(userId);
            if (users?.size === 0) this.presence.delete(projectId);
            this.io.to(projectId).emit('userLeft', { userId });
        }

        this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
    }
}
