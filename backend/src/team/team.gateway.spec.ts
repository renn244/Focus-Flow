import { Types } from 'mongoose';
import { TeamGateway } from './team.gateway';

describe('TeamGateway presence', () => {
    const userId = new Types.ObjectId().toString();
    const projectId = new Types.ObjectId().toString();
    const member = { _id: userId, displayName: 'Alex' };

    const emit = jest.fn();
    let gateway: TeamGateway;

    const socket = (id: string) => ({
        id,
        disconnected: false,
        handshake: { query: { userId, projectId } },
        join: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn(),
    }) as any;

    beforeEach(() => {
        emit.mockClear();
        gateway = new TeamGateway({ getMembers: jest.fn().mockResolvedValue([{ user: member }]) } as any);
        gateway.io = { to: jest.fn(() => ({ emit })) } as any;
    });

    it('keeps a user online until their last tab closes, without throwing', async () => {
        const tabA = socket('a');
        const tabB = socket('b');
        await gateway.handleConnection(tabA);
        await gateway.handleConnection(tabB);

        expect(emit).toHaveBeenCalledWith('userJoined', member);
        expect(emit).toHaveBeenCalledTimes(1);

        gateway.handleDisconnect(tabA);
        expect(gateway.getUserIdsInProject(projectId)).toEqual([userId]);

        gateway.handleDisconnect(tabB);
        gateway.handleDisconnect(tabB); // a duplicate disconnect is ignored
        expect(gateway.getUserIdsInProject(projectId)).toEqual([]);
        expect(emit).toHaveBeenLastCalledWith('userLeft', { userId });
        expect(gateway.getProjectIdByUserId(userId)).toBeUndefined();
    });

    it('rejects a socket with an invalid project id instead of crashing', async () => {
        const bad = { ...socket('c'), handshake: { query: { userId, projectId: 'not-an-id' } } };
        await gateway.handleConnection(bad);
        expect(bad.disconnect).toHaveBeenCalled();
        expect(gateway.getUserIdsInProject('not-an-id')).toEqual([]);
    });
});
