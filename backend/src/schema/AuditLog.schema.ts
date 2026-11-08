import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const AUDIT_ACTIONS = [
    'project.created',
    'project.updated',
    'project.deleted',
    'team.member_added',
    'team.member_removed',
    'team.member_role_updated',
    'task.created',
    'task.updated',
    'task.moved',
    'task.deleted',
    'checklist.item_added',
    'checklist.item_checked',
    'checklist.item_unchecked',
    'checklist.item_removed',
    'comment.created',
    'comment.updated',
    'comment.deleted',
    'attachment.uploaded',
    'attachment.deleted',
    'note.created',
    'note.updated',
    'note.pinned',
    'note.unpinned',
    'note.deleted',
    'note.restored',
    'integration.connected',
    'integration.disconnected',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITY_TYPES = ['project', 'team_member', 'task', 'comment', 'attachment', 'note'] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export type AuditChange = {
    field: string;
    from?: string;
    to?: string;
};

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AuditLog {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
    projectId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    actorId: Types.ObjectId;

    @Prop({ type: String, enum: AUDIT_ACTIONS, required: true })
    action: AuditAction;

    @Prop({ type: String, enum: AUDIT_ENTITY_TYPES, required: true })
    entityType: AuditEntityType;

    @Prop({ type: String, required: true, index: true })
    entityId: string;

    // Present for task records and task-owned resources such as comments and attachments.
    // This makes a task timeline a direct, indexed query rather than a project-wide scan.
    @Prop({ type: String, index: true })
    taskId?: string;

    @Prop({ required: true, maxlength: 280 })
    summary: string;

    @Prop({ type: [String], default: [] })
    changedFields: string[];

    @Prop({ type: [{ field: String, from: String, to: String }], default: [] })
    changes: AuditChange[];
}

export const auditLogSchema = SchemaFactory.createForClass(AuditLog);
auditLogSchema.index({ projectId: 1, _id: -1 });
auditLogSchema.index({ projectId: 1, taskId: 1, _id: -1 });

export type AuditLogDocument = HydratedDocument<AuditLog>;
