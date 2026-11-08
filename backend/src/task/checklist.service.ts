import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { UserJwt } from 'src/lib/Decorators/UserJwt';
import { AuditAction } from 'src/schema/AuditLog.schema';
import { Board, BoardDocument } from 'src/schema/Board.schema';
import { Task, TaskDocument } from 'src/schema/Task.schema';
import { TeamGateway } from 'src/team/team.gateway';
import { AddChecklistItemsDto, MAX_CHECKLIST_ITEMS, ReorderChecklistDto, UpdateChecklistItemDto } from './dto/checklist.dto';
import { ChecklistItemDto, TaskWithBoardAndColumnDto } from './dto/response-dto';

export { MAX_CHECKLIST_ITEMS };

const quote = (text: string) => `“${text.length > 60 ? `${text.slice(0, 57)}…` : text}”`;

/**
 * A task's checklist. Every change is a single atomic update on the task, so
 * two people ticking items at the same time don't overwrite each other.
 * Any project member can use it (the controller's TaskAccessGuard).
 */
@Injectable()
export class ChecklistService {
    constructor(
        @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
        @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
        private readonly teamGateway: TeamGateway,
        private readonly auditLogService: AuditLogService,
    ) {}

    async addItems(taskId: Types.ObjectId, body: AddChecklistItemsDto, user: UserJwt) {
        const texts = body.texts.filter(Boolean);
        if (texts.length === 0) {
            throw new BadRequestException('Checklist items need some text');
        }

        const createdBy = new Types.ObjectId(user.id);
        const items = texts.map((text) => ({ _id: new Types.ObjectId(), text, done: false, createdBy }));

        // Only adds when the list still has room, checked in the same update.
        const task = await this.taskModel.findOneAndUpdate(
            { _id: taskId, [`checklist.${MAX_CHECKLIST_ITEMS - items.length}`]: { $exists: false } },
            { $push: { checklist: { $each: items } } },
            { new: true },
        );

        if (!task) {
            await this.ensureTaskExists(taskId);
            throw new BadRequestException(`A checklist can have up to ${MAX_CHECKLIST_ITEMS} items`);
        }

        await this.log(task, user, 'checklist.item_added',
            items.length === 1 ? `Added ${quote(items[0].text)} to the checklist` : `Added ${items.length} items to the checklist`);
        return this.respond(task);
    }

    async updateItem(taskId: Types.ObjectId, itemId: Types.ObjectId, body: UpdateChecklistItemDto, user: UserJwt) {
        if (body.text === undefined && body.done === undefined) {
            throw new BadRequestException('Nothing to change');
        }

        const before = await this.findItem(taskId, itemId);
        const set: Record<string, unknown> = {};
        const unset: Record<string, ''> = {};
        if (body.text !== undefined) set['checklist.$.text'] = body.text;
        if (body.done !== undefined) {
            set['checklist.$.done'] = body.done;
            if (body.done) {
                set['checklist.$.doneBy'] = new Types.ObjectId(user.id);
                set['checklist.$.doneAt'] = new Date();
            } else {
                unset['checklist.$.doneBy'] = '';
                unset['checklist.$.doneAt'] = '';
            }
        }

        const task = await this.taskModel.findOneAndUpdate(
            { _id: taskId, 'checklist._id': itemId },
            { $set: set, ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}) },
            { new: true },
        );
        if (!task) {
            throw new NotFoundException('Checklist item not found');
        }

        // Renames aren't logged; ticking and unticking are.
        if (body.done !== undefined && body.done !== before.done) {
            const text = body.text ?? before.text;
            await this.log(task, user, body.done ? 'checklist.item_checked' : 'checklist.item_unchecked',
                `${body.done ? 'Checked off' : 'Unchecked'} ${quote(text)}`);
        }
        return this.respond(task);
    }

    async removeItem(taskId: Types.ObjectId, itemId: Types.ObjectId, user: UserJwt) {
        const before = await this.findItem(taskId, itemId);
        const task = await this.taskModel.findOneAndUpdate(
            { _id: taskId },
            { $pull: { checklist: { _id: itemId } } },
            { new: true },
        );
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        await this.log(task, user, 'checklist.item_removed', `Removed ${quote(before.text)} from the checklist`);
        return this.respond(task);
    }

    /**
     * Puts the items in the given order. Built from the stored items inside the update itself,
     * so a tick that lands at the same moment is kept. Not logged: it's only rearranging.
     */
    async reorder(taskId: Types.ObjectId, body: ReorderChecklistDto) {
        const ids = body.itemIds.map((id) => new Types.ObjectId(id));
        const task = await this.taskModel.findOneAndUpdate(
            // Only when the ids are exactly the current items, so nothing is dropped or duplicated.
            { _id: taskId, checklist: { $size: ids.length }, 'checklist._id': { $all: ids } },
            [{
                $set: {
                    checklist: {
                        $map: {
                            input: ids,
                            as: 'itemId',
                            in: {
                                $arrayElemAt: [{ $filter: { input: '$checklist', as: 'item', cond: { $eq: ['$$item._id', '$$itemId'] } } }, 0],
                            },
                        },
                    },
                },
            }],
            { new: true },
        );

        if (!task) {
            await this.ensureTaskExists(taskId);
            throw new ConflictException('The checklist changed while you were moving items. Try again.');
        }
        return this.respond(task);
    }

    private async findItem(taskId: Types.ObjectId, itemId: Types.ObjectId) {
        const task = await this.taskModel.findOne({ _id: taskId, 'checklist._id': itemId }, { 'checklist.$': 1 });
        const item = task?.checklist[0];
        if (!item) {
            throw new NotFoundException('Checklist item not found');
        }
        return item;
    }

    private async ensureTaskExists(taskId: Types.ObjectId) {
        if (!(await this.taskModel.exists({ _id: taskId }))) {
            throw new NotFoundException('Task not found');
        }
    }

    private async log(task: TaskDocument, user: UserJwt, action: AuditAction, summary: string) {
        const board = await this.boardModel.findById(task.boardId).select('projectId');
        if (!board) return;

        await this.auditLogService.record({
            projectId: board.projectId,
            actorId: user.id,
            action,
            entityType: 'task',
            entityId: task._id,
            taskId: task._id,
            summary,
        });
    }

    /** Tells everyone on the board (so card counts update live) and returns the new checklist. */
    private async respond(task: TaskDocument) {
        const populated = await task.populate([
            { path: 'columnId', select: 'title color _id' },
            { path: 'boardId', select: 'name projectId _id' },
            { path: 'assignee', select: '_id username displayName avatarUrl' },
        ]);
        const projectId = (populated.boardId as unknown as { projectId?: Types.ObjectId })?.projectId?.toString();
        if (projectId) {
            this.teamGateway.io.to(projectId).emit('taskUpdated', plainToInstance(TaskWithBoardAndColumnDto, populated, {
                excludeExtraneousValues: true,
                enableImplicitConversion: true,
            }));
        }

        return plainToInstance(ChecklistItemDto, task.checklist, { excludeExtraneousValues: true });
    }
}
