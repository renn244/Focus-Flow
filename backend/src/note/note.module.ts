import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogModule } from 'src/audit-log/audit-log.module';
import { Note, noteSchema } from 'src/schema/Note.schema';
import { TaskModule } from 'src/task/task.module';
import { NoteAccessGuard, NoteDeleteGuard } from './guards/NoteAccessGuard';
import { NoteController } from './note.controller';
import { NoteImageStorageService } from './note-image-storage.service';
import { NoteService } from './note.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Note.name, schema: noteSchema }]),
        TaskModule,
        AuditLogModule,
    ],
    controllers: [NoteController],
    providers: [NoteService, NoteImageStorageService, NoteAccessGuard, NoteDeleteGuard],
})
export class NoteModule {}
