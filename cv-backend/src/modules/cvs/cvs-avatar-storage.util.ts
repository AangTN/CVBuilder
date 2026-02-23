import { BadRequestException, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

const UPLOADS_BASE = path.resolve(process.cwd(), 'uploads');

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);

export async function processPhotoUrl(
  photoUrl: string | undefined,
  cvId: string,
  logger: Logger,
): Promise<string | undefined> {
  if (!photoUrl) {
    return undefined;
  }

  if (!photoUrl.startsWith('data:image/')) {
    // Only allow absolute URLs (http/https) or server-owned /uploads/ paths
    const isHttpUrl = /^https?:\/\//i.test(photoUrl);
    const isUploadsPath =
      /^\/uploads\/avatars\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(
        photoUrl,
      );
    if (!isHttpUrl && !isUploadsPath) {
      return undefined;
    }
    return photoUrl;
  }

  try {
    const matches = photoUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return photoUrl;
    }

    const extension = matches[1].toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
      throw new BadRequestException(
        'Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận png, jpg, jpeg, webp.',
      );
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > MAX_AVATAR_BYTES) {
      throw new BadRequestException('Ảnh quá lớn. Kích thước tối đa là 5MB.');
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `${cvId}-${Date.now()}.${extension}`;
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);

    return `/uploads/avatars/${filename}`;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }

    logger.error('Error processing photo', error as Error);
    return undefined;
  }
}

export async function deleteOldPhoto(
  photoPath: string | undefined,
  logger: Logger,
): Promise<void> {
  if (!photoPath || !photoPath.startsWith('/uploads/')) {
    return;
  }

  try {
    const relativePath = photoPath.replace(/^\/+/, '');
    const fullPath = path.resolve(process.cwd(), relativePath);

    // Prevent path traversal: resolved path must be inside the uploads directory
    if (
      !fullPath.startsWith(UPLOADS_BASE + path.sep) &&
      fullPath !== UPLOADS_BASE
    ) {
      logger.warn(`Path traversal attempt blocked: ${photoPath}`);
      return;
    }

    await fs.unlink(fullPath);
    logger.debug(`Deleted old photo: ${photoPath}`);
  } catch {
    // ignore if file does not exist or cannot be removed
  }
}
