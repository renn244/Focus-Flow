import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { getModelToken } from '@nestjs/mongoose';
import { AddressInfo } from 'net';
import { Model } from 'mongoose';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { Attachment } from '../src/schema/Attachment.schema';
import { Board } from '../src/schema/Board.schema';
import { Column } from '../src/schema/Column.schema';
import { Project } from '../src/schema/Project.schema';
import { Task } from '../src/schema/Task.schema';
import { TeamMember } from '../src/schema/TeamMember.schema';
import { User } from '../src/schema/User.schema';

const baseUrlFor = (port: number) => `http://127.0.0.1:${port}/api`;

const expectOk = async (response: Response, operation: string) => {
    if (!response.ok) {
        throw new Error(`${operation} failed with ${response.status}: ${await response.text()}`);
    }

    return response;
};

async function main() {
    const app = await NestFactory.create(AppModule, { logger: false });
    app.setGlobalPrefix('api');
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const projectModel = app.get<Model<Project>>(getModelToken(Project.name));
    const boardModel = app.get<Model<Board>>(getModelToken(Board.name));
    const columnModel = app.get<Model<Column>>(getModelToken(Column.name));
    const taskModel = app.get<Model<Task>>(getModelToken(Task.name));
    const attachmentModel = app.get<Model<Attachment>>(getModelToken(Attachment.name));
    const teamMemberModel = app.get<Model<TeamMember>>(getModelToken(TeamMember.name));
    const authService = app.get(AuthService);

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const username = `attachment-qa-${suffix}`;
    const email = `${username}@example.test`;
    let userId: string | undefined;
    let projectId: string | undefined;
    let boardId: string | undefined;
    let columnId: string | undefined;
    let taskId: string | undefined;

    try {
        await app.listen(0, '127.0.0.1');
        const address = app.getHttpServer().address() as AddressInfo;
        const baseUrl = baseUrlFor(address.port);

        const user = await userModel.create({
            username,
            email,
            password: await bcrypt.hash(`FocusFlow-QA-${suffix}`, 10),
            displayName: 'Attachment QA',
            emailVerified: true,
            isOauthUser: false,
        });
        userId = user._id.toString();
        const { access_token } = await authService.login(user as any);
        const headers = { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' };

        const project = await expectOk(await fetch(`${baseUrl}/projects`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Attachment verification project',
                description: 'Temporary project for attachment verification.',
                priority: 'medium',
                dueDate: '2026-10-01',
            }),
        }), 'create project').then((response) => response.json());
        projectId = project._id;

        const board = await expectOk(await fetch(`${baseUrl}/board`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Attachment verification board',
                description: 'Temporary board for attachment verification.',
                projectId,
            }),
        }), 'create board').then((response) => response.json());
        boardId = board._id;

        const column = await expectOk(await fetch(`${baseUrl}/column`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ title: 'To do', color: '#2563eb', boardId }),
        }), 'create column').then((response) => response.json());
        columnId = column._id;

        const task = await expectOk(await fetch(`${baseUrl}/task`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Verify attachment lifecycle',
                description: 'Confirm upload, download, and deletion work correctly.',
                priority: 'medium',
                boardId,
                columnId,
                dueDate: '2026-10-01',
                tags: ['qa'],
            }),
        }), 'create task').then((response) => response.json());
        taskId = task._id;

        const fileContents = 'FocusFlow attachment integration check';
        const formData = new FormData();
        formData.append('file', new Blob([fileContents], { type: 'text/plain' }), 'attachment-check.txt');
        const upload = await expectOk(await fetch(`${baseUrl}/attachment/task/${taskId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${access_token}` },
            body: formData,
        }), 'upload attachment').then((response) => response.json());

        const listed = await expectOk(await fetch(`${baseUrl}/attachment/task/${taskId}`, {
            headers: { Authorization: `Bearer ${access_token}` },
        }), 'list attachments').then((response) => response.json());
        if (listed.length !== 1 || listed[0]._id !== upload._id || listed[0].originalName !== 'attachment-check.txt') {
            throw new Error('Attachment listing did not return the uploaded metadata');
        }

        const downloaded = await expectOk(await fetch(`${baseUrl}/attachment/${upload._id}/download`, {
            headers: { Authorization: `Bearer ${access_token}` },
        }), 'download attachment');
        if (await downloaded.text() !== fileContents) {
            throw new Error('Downloaded attachment contents did not match the uploaded file');
        }

        await expectOk(await fetch(`${baseUrl}/attachment/${upload._id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${access_token}` },
        }), 'delete attachment');
        const afterDelete = await expectOk(await fetch(`${baseUrl}/attachment/task/${taskId}`, {
            headers: { Authorization: `Bearer ${access_token}` },
        }), 'list attachments after delete').then((response) => response.json());
        if (afterDelete.length !== 0) {
            throw new Error('Attachment metadata remained after deletion');
        }

        console.log('Attachment integration check passed: upload, list, download, and delete.');
    } finally {
        if (taskId) await attachmentModel.deleteMany({ taskId });
        if (taskId) await taskModel.deleteOne({ _id: taskId });
        if (columnId) await columnModel.deleteOne({ _id: columnId });
        if (boardId) await boardModel.deleteOne({ _id: boardId });
        if (projectId) await teamMemberModel.deleteMany({ projectId });
        if (projectId) await projectModel.deleteOne({ _id: projectId });
        if (userId) await userModel.deleteOne({ _id: userId });
        await app.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
