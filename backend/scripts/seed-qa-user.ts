import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { promises as fs } from 'fs';
import { getModelToken } from '@nestjs/mongoose';
import { AddressInfo } from 'net';
import { Model } from 'mongoose';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { ATTACHMENTS_DIRECTORY } from '../src/attachment/attachment.constants';
import { AuthService } from '../src/auth/auth.service';
import { Attachment } from '../src/schema/Attachment.schema';
import { Board } from '../src/schema/Board.schema';
import { Column } from '../src/schema/Column.schema';
import { Comment } from '../src/schema/Comment.schema';
import { Task } from '../src/schema/Task.schema';
import { TeamMember } from '../src/schema/TeamMember.schema';
import { User } from '../src/schema/User.schema';
import { TeamService } from '../src/team/team.service';

const credentials = {
    username: 'focusflow-qa',
    password: 'FocusFlow-QA-2026!',
    email: 'focusflow-qa@focusflow.local',
};

const qaTeamFixtures = [
    { username: 'alex-morgan', email: 'alex.morgan@focusflow.local', displayName: 'Alex Morgan', role: 'admin' },
    { username: 'devon-lee', email: 'devon.lee@focusflow.local', displayName: 'Devon Lee', role: 'admin' },
    { username: 'jordan-kim', email: 'jordan.kim@focusflow.local', displayName: 'Jordan Kim', role: 'member' },
    { username: 'samira-patel', email: 'samira.patel@focusflow.local', displayName: 'Samira Patel', role: 'member' },
    { username: 'noah-williams', email: 'noah.williams@focusflow.local', displayName: 'Noah Williams', role: 'member' },
    { username: 'priya-shah', email: 'priya.shah@focusflow.local', displayName: 'Priya Shah', role: 'member' },
    { username: 'marcus-rivera', email: 'marcus.rivera@focusflow.local', displayName: 'Marcus Rivera', role: 'member' },
    { username: 'elena-garcia', email: 'elena.garcia@focusflow.local', displayName: 'Elena Garcia', role: 'member' },
    { username: 'taylor-brooks', email: 'taylor.brooks@focusflow.local', displayName: 'Taylor Brooks', role: 'member' },
    { username: 'casey-nguyen', email: 'casey.nguyen@focusflow.local', displayName: 'Casey Nguyen', role: 'member' },
    { username: 'riley-chen', email: 'riley.chen@focusflow.local', displayName: 'Riley Chen', role: 'member' },
    { username: 'morgan-reed', email: 'morgan.reed@focusflow.local', displayName: 'Morgan Reed', role: 'member' },
] as const;

const qaTaskTitles = [
    'Clarify weekly planning view',
    'Ship calendar interaction pass',
    'Review attachment previews',
    'Walk through audit history',
    'Complete final QA review',
] as const;

const expectOk = async (response: Response, action: string) => {
    if (!response.ok) {
        throw new Error(`${action} failed with ${response.status}: ${await response.text()}`);
    }

    return response;
};

async function main() {
    const app = await NestFactory.create(AppModule, { logger: false });
    app.setGlobalPrefix('api');
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const boardModel = app.get<Model<Board>>(getModelToken(Board.name));
    const columnModel = app.get<Model<Column>>(getModelToken(Column.name));
    const taskModel = app.get<Model<Task>>(getModelToken(Task.name));
    const commentModel = app.get<Model<Comment>>(getModelToken(Comment.name));
    const attachmentModel = app.get<Model<Attachment>>(getModelToken(Attachment.name));
    const teamMemberModel = app.get<Model<TeamMember>>(getModelToken(TeamMember.name));
    const authService = app.get(AuthService);
    const teamService = app.get(TeamService);

    try {
        let user = await userModel.findOne({ username: credentials.username });
        if (!user) {
            user = await userModel.create({
                username: credentials.username,
                email: credentials.email,
                password: await bcrypt.hash(credentials.password, 10),
                displayName: 'FocusFlow QA',
                emailVerified: true,
                isOauthUser: false,
            });
        } else {
            user.password = await bcrypt.hash(credentials.password, 10);
            user.emailVerified = true;
            user.isOauthUser = false;
            await user.save();
        }

        await app.listen(0, '127.0.0.1');
        const address = app.getHttpServer().address() as AddressInfo;
        const baseUrl = `http://127.0.0.1:${address.port}/api`;
        const { access_token } = await authService.login(user as any);
        const headers = { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' };
        const projects = await expectOk(await fetch(`${baseUrl}/projects?status=all&priority=all`, { headers }), 'load projects')
            .then((response) => response.json());

        const qaProjectCandidates = projects.filter((candidate: { name: string; description?: string }) =>
            candidate.name === 'FocusFlow QA Workspace'
            && candidate.description === 'QA workspace for reviewing the completed project workflow.',
        );
        const qaProjectsByTaskCount = await Promise.all(qaProjectCandidates.map(async (candidate: { _id: string }) => {
            const candidateBoardIds = (await boardModel.aggregate([
                { $match: { $expr: { $eq: [{ $toString: '$projectId' }, candidate._id] } } },
                { $project: { _id: 1 } },
            ])).map((board) => board._id);
            return {
                project: candidate,
                taskCount: await taskModel.countDocuments({ boardId: { $in: candidateBoardIds } }),
            };
        }));
        let project = qaProjectsByTaskCount.sort((left, right) => right.taskCount - left.taskCount)[0]?.project;
        if (!project) {
            project = await expectOk(await fetch(`${baseUrl}/projects`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: 'FocusFlow QA Workspace',
                    description: 'QA workspace for reviewing the completed project workflow.',
                    priority: 'high',
                    dueDate: '2026-10-15',
                }),
            }), 'create QA project').then((response) => response.json());
        }

        if (!project) {
            throw new Error('QA workspace was not found or created.');
        }

        for (const fixture of qaTeamFixtures) {
            let fixtureUser = await userModel.findOne({ username: fixture.username });

            if (!fixtureUser) {
                fixtureUser = await userModel.create({
                    ...fixture,
                    password: await bcrypt.hash('FocusFlow-Demo-2026!', 10),
                    emailVerified: true,
                    isOauthUser: false,
                });
            }

            const [membership] = await teamMemberModel.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: [{ $toString: '$projectId' }, project._id.toString()] },
                                { $eq: [{ $toString: '$userId' }, fixtureUser._id.toString()] },
                            ],
                        },
                    },
                },
                { $limit: 1 },
            ]);

            if (!membership) {
                await teamService.addMember(user as any, {
                    projectId: project._id.toString(),
                    userId: fixtureUser._id.toString(),
                    role: fixture.role,
                }, false);
            }
        }

        const [existingBoard] = await boardModel.aggregate([
            { $match: { $expr: { $eq: [{ $toString: '$projectId' }, project._id.toString()] } } },
            { $sort: { createdAt: 1 } },
            { $limit: 1 },
            { $project: { _id: 1 } },
        ]);
        let board = existingBoard ? await boardModel.findById(existingBoard._id) : null;
        if (!board) {
            board = await boardModel.create({
                name: 'QA Sprint Board',
                description: 'Board for dashboard, comments, and attachment QA scenarios.',
                projectId: project._id,
            });
        }

        let columns = await columnModel.find({ _id: { $in: board.columns } }).sort({ order: 1 });
        const requiredColumns = [
            ['To Do', '#2563eb'],
            ['In Progress', '#f59e0b'],
            ['Done', '#10b981'],
        ];
        const existingColumnTitles = new Set(columns.map((column: { title: string }) => column.title));
        const missingColumns = requiredColumns.filter(([title]) => !existingColumnTitles.has(title));
        if (missingColumns.length > 0) {
            const createdColumns = await columnModel.insertMany(missingColumns.map(([title, color], index) => ({
                title,
                color,
                order: columns.length + index,
            })));
            await boardModel.updateOne({ _id: board._id }, { $push: { columns: { $each: createdColumns.map((column) => column._id) } } });
            board = await boardModel.findById(board._id);
            if (!board) {
                throw new Error('QA board was not found after repair.');
            }
            columns = await columnModel.find({ _id: { $in: board.columns } }).sort({ order: 1 });
        }

        const toDoColumn = columns.find((column: { title: string }) => column.title === 'To Do');
        const inProgressColumn = columns.find((column: { title: string }) => column.title === 'In Progress');
        if (!toDoColumn || !inProgressColumn) {
            throw new Error('QA board is missing required columns after repair.');
        }
        const existingTasks = await taskModel.find({ boardId: board._id });

        if (existingTasks.length === 0) {
            const tasks = await taskModel.insertMany([
                ['Resolve calendar feedback', 'Tighten the selected-date agenda and quick date controls.', 'high', '2026-09-28', toDoColumn._id],
                ['Review dashboard summary', 'Confirm the personal work dashboard shows current priorities.', 'medium', '2026-09-29', toDoColumn._id],
                ['Prepare QA notes', 'Document the final review notes for the completed workspace.', 'low', '2026-09-30', inProgressColumn._id],
            ].map(([title, description, priority, dueDate, columnId], order) => ({
                title,
                description,
                priority,
                dueDate: new Date(`${dueDate}T12:00:00.000Z`),
                boardId: board._id,
                columnId,
                assignee: user!._id,
                tags: ['qa'],
                order,
            })));
            await Promise.all(columns.map((column) => columnModel.updateOne(
                { _id: column._id },
                { $set: { tasks: tasks.filter((task) => task.columnId.toString() === column._id.toString()).map((task) => task._id) } },
            )));

            const task = tasks[0];
            await commentModel.create({
                taskId: task._id.toString(),
                authorId: user!._id,
                content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Calendar review is ready for the final pass.' }] }] },
                contentText: 'Calendar review is ready for the final pass.',
            });
            const storedFilename = `qa-checklist-${task._id}.txt`;
            await fs.mkdir(ATTACHMENTS_DIRECTORY, { recursive: true });
            await fs.writeFile(path.join(ATTACHMENTS_DIRECTORY, storedFilename), 'FocusFlow QA attachment');
            await attachmentModel.create({
                taskId: task._id.toString(),
                projectId: project._id,
                authorId: user!._id,
                originalName: 'qa-checklist.txt',
                storedFilename,
                mimeType: 'text/plain',
                size: Buffer.byteLength('FocusFlow QA attachment'),
            });
        }

        const qaBoards = await boardModel.aggregate([
            { $match: { $expr: { $eq: [{ $toString: '$projectId' }, project._id.toString()] } } },
            { $project: { _id: 1 } },
        ]);
        await taskModel.updateMany(
            { boardId: { $in: qaBoards.map((qaBoard) => qaBoard._id) }, title: { $in: qaTaskTitles } },
            { $set: { assignee: user!._id } },
        );

        const staleQaProjectIds = projects
            .filter((candidate: { _id: string; name: string }) =>
                candidate.name === 'FocusFlow QA Workspace'
                && candidate._id !== project._id.toString(),
            )
            .map((candidate: { _id: string }) => candidate._id);

        if (staleQaProjectIds.length > 0) {
            const staleQaFixtureBoards = await boardModel.aggregate([
                { $match: { $expr: { $in: [{ $toString: '$projectId' }, staleQaProjectIds] } } },
                { $project: { _id: 1 } },
            ]);

            await taskModel.updateMany(
                {
                    boardId: { $in: staleQaFixtureBoards.map((fixtureBoard) => fixtureBoard._id) },
                    title: { $in: qaTaskTitles },
                    assignee: user!._id,
                },
                { $unset: { assignee: 1 } },
            );
        }

        console.log(`QA user ready: ${credentials.username}`);
    } finally {
        await app.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
