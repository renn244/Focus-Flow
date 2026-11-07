import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { loadEsm } from 'load-esm';

export const NOTE_IMAGES_DIRECTORY = path.resolve(process.cwd(), 'uploads', 'note-images');
export const NOTE_IMAGES_ROUTE = '/uploads/note-images';
export const MAX_NOTE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_NOTE_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/**
 * Saves images pasted or uploaded into notes. Files get random names and are
 * served as static files, so an <img> tag can load them without an auth header.
 * The type is read from the file's bytes, not from what the browser claims.
 */
@Injectable()
export class NoteImageStorageService {
    async store(file: Express.Multer.File): Promise<string> {
        const { fileTypeFromBuffer } = await loadEsm<typeof import('file-type')>('file-type');
        const detected = await fileTypeFromBuffer(file.buffer);

        if (!detected || !ALLOWED_NOTE_IMAGE_MIME_TYPES.has(detected.mime)) {
            throw new BadRequestException('Images must be JPG, PNG, WebP, or GIF');
        }

        const filename = `${randomUUID()}.${detected.ext}`;
        await mkdir(NOTE_IMAGES_DIRECTORY, { recursive: true });
        await writeFile(path.join(NOTE_IMAGES_DIRECTORY, filename), file.buffer, { flag: 'wx' });

        return filename;
    }
}
