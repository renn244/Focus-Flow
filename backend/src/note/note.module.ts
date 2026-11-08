import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogModule } from 'src/audit-log/audit-log.module';
import { Note, noteSchema } from 'src/schema/Note.schema';
import { NoteVersion, noteVersionSchema } from 'src/schema/NoteVersion.schema';
import { TaskModule } from 'src/task/task.module';
import { NoteAccessGuard, NoteDeleteGuard } from './guards/NoteAccessGuard';
import { NoteController } from './note.controller';
import { NoteImageStorageService } from './note-image-storage.service';
import { NoteService } from './note.service';
import { NoteVersionService } from './note-version.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Note.name, schema: noteSchema },
            { name: NoteVersion.name, schema: noteVersionSchema },
        ]),
        TaskModule,
        AuditLogModule,
    ],
    controllers: [NoteController],
    providers: [NoteService, NoteVersionService, NoteImageStorageService, NoteAccessGuard, NoteDeleteGuard],
})
export class NoteModule {}
