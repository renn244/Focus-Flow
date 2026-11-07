import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Types } from 'mongoose';
import { User, UserJwt } from 'src/lib/Decorators/UserJwt';
import { ParseObjectIdPipe } from 'src/lib/customPipes/ParseObjectIdPipe';
import { JwtAuthGuard } from 'src/lib/guards/JwtAuthGuard';
import { CheckResourceProjectSource } from 'src/projects/decorators/ResourceProjectSource.decorator';
import { ProjectAccessGuard } from 'src/projects/guards/ProjectAccessGuard';
import { CheckResourceTaskSource } from 'src/task/decorators/ResourceTaskSource.decorator';
import { TaskAccessGuard } from 'src/task/guards/TaskAccessGuard';
import { CreateNoteDto, NoteDto, NoteSummaryDto, TaskNoteRefDto, UpdateNoteDto } from './dto/note.dto';
import { NoteAccessGuard, NoteDeleteGuard } from './guards/NoteAccessGuard';
import { MAX_NOTE_IMAGE_SIZE_BYTES, NOTE_IMAGES_ROUTE, NoteImageStorageService } from './note-image-storage.service';
import { NoteService } from './note.service';

const noteImageUpload = FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_NOTE_IMAGE_SIZE_BYTES, files: 1 },
});

@ApiTags('Notes')
@ApiBearerAuth()
@Controller('note')
@UseGuards(JwtAuthGuard)
export class NoteController {
    constructor(
        private readonly noteService: NoteService,
        private readonly noteImageStorage: NoteImageStorageService,
    ) {}

    @ApiOperation({ summary: 'List a project’s notes, pinned first, without their content' })
    @ApiOkResponse({ type: NoteSummaryDto, isArray: true })
    @ApiParam({ name: 'projectId', type: String })
    @CheckResourceProjectSource({ source: 'params', key: 'projectId' })
    @UseGuards(ProjectAccessGuard)
    @Get('project/:projectId')
    async getNotesByProject(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
        return this.noteService.getNotesByProject(projectId);
    }

    @ApiOperation({ summary: 'List the notes that mention a task' })
    @ApiOkResponse({ type: TaskNoteRefDto, isArray: true })
    @ApiParam({ name: 'taskId', type: String })
    @CheckResourceTaskSource({ source: 'params', key: 'taskId' })
    @UseGuards(TaskAccessGuard)
    @Get('task/:taskId')
    async getNotesByTask(@Param('taskId', ParseObjectIdPipe) taskId: Types.ObjectId) {
        return this.noteService.getNotesByTask(taskId);
    }

    @ApiOperation({ summary: 'Get one note with its content' })
    @ApiOkResponse({ type: NoteDto })
    @ApiParam({ name: 'noteId', type: String })
    @UseGuards(NoteAccessGuard)
    @Get(':noteId')
    async getNote(@Param('noteId', ParseObjectIdPipe) noteId: Types.ObjectId, @User() user: UserJwt) {
        return this.noteService.getNote(noteId, user);
    }

    @ApiOperation({ summary: 'Create a note in a project' })
    @ApiCreatedResponse({ type: NoteDto })
    @CheckResourceProjectSource({ source: 'body', key: 'projectId' })
    @UseGuards(ProjectAccessGuard)
    @Post()
    async createNote(@Body() body: CreateNoteDto, @User() user: UserJwt) {
        return this.noteService.createNote(body, user);
    }

    @ApiOperation({ summary: 'Edit or pin a note (any project member)' })
    @ApiOkResponse({ type: NoteDto })
    @ApiParam({ name: 'noteId', type: String })
    @UseGuards(NoteAccessGuard)
    @Patch(':noteId')
    async updateNote(
        @Param('noteId', ParseObjectIdPipe) noteId: Types.ObjectId,
        @Body() body: UpdateNoteDto,
        @User() user: UserJwt,
    ) {
        return this.noteService.updateNote(noteId, body, user);
    }

    @ApiOperation({ summary: 'Upload an image for a note (any project member); returns its address' })
    @ApiParam({ name: 'noteId', type: String })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } })
    @ApiCreatedResponse({ schema: { type: 'object', properties: { url: { type: 'string' } } } })
    @UseGuards(NoteAccessGuard)
    @UseInterceptors(noteImageUpload)
    @Post(':noteId/image')
    async uploadImage(
        @UploadedFile() file: Express.Multer.File | undefined,
        @Req() request: { protocol: string; get: (header: string) => string | undefined },
    ) {
        if (!file) {
            throw new BadRequestException('An image is required');
        }

        const filename = await this.noteImageStorage.store(file);
        const origin = process.env.PUBLIC_API_ORIGIN || `${request.protocol}://${request.get('host')}`;
        return { url: `${origin}${NOTE_IMAGES_ROUTE}/${filename}` };
    }

    @ApiOperation({ summary: 'Delete a note (author or project admin)' })
    @ApiOkResponse({ description: 'Note deleted successfully' })
    @ApiParam({ name: 'noteId', type: String })
    @UseGuards(NoteAccessGuard, NoteDeleteGuard)
    @Delete(':noteId')
    async deleteNote(@Param('noteId', ParseObjectIdPipe) noteId: Types.ObjectId, @User() user: UserJwt) {
        return this.noteService.deleteNote(noteId, user);
    }
}
