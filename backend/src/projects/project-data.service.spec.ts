import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Attachment } from 'src/schema/Attachment.schema';
import { Board } from 'src/schema/Board.schema';
import { Column } from 'src/schema/Column.schema';
import { Comment } from 'src/schema/Comment.schema';
import { DiscordIntegration } from 'src/schema/DiscordIntegration.schema';
import { Note } from 'src/schema/Note.schema';
import { NoteVersion } from 'src/schema/NoteVersion.schema';
import { Task } from 'src/schema/Task.schema';
import { TeamMember } from 'src/schema/TeamMember.schema';
import { ProjectDataService } from './project-data.service';

/** A model whose find().select().lean() resolves to the given rows. */
const model = (rows: unknown[] = []) => ({
    find: jest.fn(() => ({ select: () => ({ lean: () => Promise.resolve(rows) }) })),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
});

describe('ProjectDataService', () => {
    const projectA = new Types.ObjectId();
    const projectB = new Types.ObjectId();
    const boardA = new Types.ObjectId();
    const boardB = new Types.ObjectId();
    const todo = new Types.ObjectId();
    const done = new Types.ObjectId();

    let models: Record<string, ReturnType<typeof model>>;
    let service: ProjectDataService;

    beforeEach(async () => {
        models = {
            [Board.name]: model([
                { _id: boardA, projectId: projectA, columns: [todo, done] },
                { _id: boardB, projectId: projectB, columns: [] },
            ]),
            [Column.name]: model([{ _id: todo, title: 'To do' }, { _id: done, title: ' Done ' }]),
            [Task.name]: model([
                { _id: new Types.ObjectId(), boardId: boardA, columnId: todo },
                { _id: new Types.ObjectId(), boardId: boardA, columnId: todo },
                { _id: new Types.ObjectId(), boardId: boardA, columnId: done },
            ]),
            [Comment.name]: model(),
            [Attachment.name]: model([]),
            [Note.name]: model(),
            [NoteVersion.name]: model(),
            [TeamMember.name]: model(),
            [DiscordIntegration.name]: model(),
        };
        const module: TestingModule = await Test.createTestingModule({ providers: [ProjectDataService] })
            .useMocker((token) => Object.entries(models).find(([name]) => token === getModelToken(name))?.[1] ?? {})
            .compile();
        service = module.get(ProjectDataService);
    });

    it('counts open and finished tasks per project from the live tasks', async () => {
        const counts = await service.countTasks([projectA, projectB]);

        expect(service.countsFor(counts, projectA)).toEqual({ totalTasks: 3, completedTasks: 1, openTasks: 2, progress: 33 });
        // A project with an empty board reports zeros instead of missing.
        expect(service.countsFor(counts, projectB)).toEqual({ totalTasks: 0, completedTasks: 0, openTasks: 0, progress: 0 });
    });

    it('removes boards, columns, tasks, notes and the team when a project is deleted', async () => {
        await service.deleteProjectData(projectA);

        for (const name of [Board.name, Column.name, Task.name, Comment.name, Attachment.name, Note.name, NoteVersion.name, TeamMember.name, DiscordIntegration.name]) {
            expect(models[name].deleteMany).toHaveBeenCalledTimes(1);
        }
        expect(models[Column.name].deleteMany).toHaveBeenCalledWith({ _id: { $in: [todo, done] } });
    });
});
