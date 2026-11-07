import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from 'src/schema/Note.schema';
import { TeamSharedService } from 'src/team/team.shared.service';

/** Any project member may read and edit a note. Sets request.note. */
@Injectable()
export class NoteAccessGuard implements CanActivate {
    constructor(
        @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
        private readonly teamSharedService: TeamSharedService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const noteId = request.params.noteId;

        if (!Types.ObjectId.isValid(noteId)) {
            throw new NotFoundException('Note not found');
        }

        const note = await this.noteModel.findById(noteId).select('projectId createdBy title');

        if (!note) {
            throw new NotFoundException('Note not found');
        }

        const isMember = await this.teamSharedService.isUserMemberInProject(note.projectId, request.user.id);

        if (!isMember) {
            throw new ForbiddenException('You do not have access to this note');
        }

        request.note = note;
        return true;
    }
}

/** Only the note's author or a project admin/owner may delete it. Run after NoteAccessGuard. */
@Injectable()
export class NoteDeleteGuard implements CanActivate {
    constructor(private readonly teamSharedService: TeamSharedService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const note: NoteDocument = request.note;
        const userId: string = request.user.id;

        if (note.createdBy.toString() === userId) {
            return true;
        }

        if (await this.teamSharedService.isUserAdminOrOwnerInProject(note.projectId, userId)) {
            return true;
        }

        throw new ForbiddenException('Only the note author or a project admin can delete this note');
    }
}
