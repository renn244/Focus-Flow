import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { loadEsm } from 'load-esm';
import {
  ALLOWED_AVATAR_MIME_TYPES,
  AVATARS_DIRECTORY,
} from './avatar.constants';

export type StoredAvatar = {
  filename: string;
};

@Injectable()
export class AvatarStorageService {
  async store(file: Express.Multer.File): Promise<StoredAvatar> {
    const { fileTypeFromBuffer } =
      await loadEsm<typeof import('file-type')>('file-type');
    const detectedFileType = await fileTypeFromBuffer(file.buffer);

    if (
      !detectedFileType ||
      !ALLOWED_AVATAR_MIME_TYPES.has(detectedFileType.mime)
    ) {
      throw new BadRequestException('Avatar must be a JPG, PNG, or WebP image');
    }

    const filename = `${randomUUID()}.${detectedFileType.ext}`;
    const filePath = this.resolvePath(filename);
    if (!filePath) {
      throw new Error('Failed to create avatar storage path');
    }

    await mkdir(AVATARS_DIRECTORY, { recursive: true });
    await writeFile(filePath, file.buffer, { flag: 'wx' });

    return { filename };
  }

  async removeByUrl(avatarUrl?: string) {
    if (!avatarUrl) {
      return;
    }

    const filename = avatarUrl.split('/uploads/avatars/')[1];
    if (!filename) {
      return;
    }

    await this.remove(filename);
  }

  async remove(filename: string) {
    const filePath = this.resolvePath(filename);
    if (!filePath) {
      return;
    }

    await unlink(filePath).catch(() => undefined);
  }

  private resolvePath(filename: string) {
    if (
      filename.includes('/') ||
      filename.includes('\\') ||
      filename.includes('..')
    ) {
      return;
    }

    const filePath = path.resolve(AVATARS_DIRECTORY, filename);
    if (!filePath.startsWith(`${AVATARS_DIRECTORY}${path.sep}`)) {
      return;
    }

    return filePath;
  }
}
