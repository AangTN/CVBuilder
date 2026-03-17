import { BadRequestException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

const UPLOADS_BASE = path.resolve(process.cwd(), 'uploads');

export const MAX_AVATAR_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);
const ALLOWED_IMAGE_MIME_TYPE_TO_EXT = new Map<string, string>([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
]);

export interface AvatarUploadFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

function getAvatarExtensionFromMimeType(mimeType: string): string | undefined {
  return ALLOWED_IMAGE_MIME_TYPE_TO_EXT.get(mimeType.toLowerCase());
}

function toManagedUploadsPath(photoUrl: string): string | undefined {
  if (photoUrl.startsWith('/uploads/')) {
    return photoUrl;
  }

  try {
    const parsedUrl = new URL(photoUrl);
    if (parsedUrl.pathname.startsWith('/uploads/')) {
      return parsedUrl.pathname;
    }
  } catch {
    // Ignore invalid URL and fall back to undefined
  }

  return undefined;
}

export function isManagedUploadPhotoUrl(
  photoUrl: string | undefined,
): boolean {
  if (!photoUrl) {
    return false;
  }

  const uploadsPath = toManagedUploadsPath(photoUrl);
  if (!uploadsPath) {
    return false;
  }

  return /^\/uploads\/avatars\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(
    uploadsPath,
  );
}

function buildAvatarFilename(prefix: string, extension: string): string {
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'avatar';
  const uniquePart = randomUUID().replace(/-/g, '').slice(0, 12);
  return `${safePrefix}-${Date.now()}-${uniquePart}.${extension}`;
}

async function saveAvatarBuffer(
  buffer: Buffer,
  filenamePrefix: string,
  extension: string,
) {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
  await fs.mkdir(uploadsDir, { recursive: true });

  const filename = buildAvatarFilename(filenamePrefix, extension);
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, buffer);

  // Return absolute URL so frontend can load the image correctly
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  return `${baseUrl}/uploads/avatars/${filename}`;
}

export async function storeUploadedAvatar(
  file: AvatarUploadFile,
  filenamePrefix: string,
  logger: Logger,
): Promise<string> {
  if (!file?.buffer || file.size <= 0) {
    throw new BadRequestException('Không tìm thấy file ảnh tải lên.');
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new BadRequestException('Ảnh quá lớn. Kích thước tối đa là 10MB.');
  }

  const extension = getAvatarExtensionFromMimeType(file.mimetype);
  if (!extension) {
    throw new BadRequestException(
      'Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận png, jpg, jpeg, webp.',
    );
  }

  try {
    return await saveAvatarBuffer(file.buffer, filenamePrefix, extension);
  } catch (error) {
    logger.error('Error storing uploaded avatar', error as Error);
    throw new BadRequestException('Không thể lưu ảnh tải lên. Vui lòng thử lại.');
  }
}

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
      throw new BadRequestException('Ảnh quá lớn. Kích thước tối đa là 10MB.');
    }

    return saveAvatarBuffer(buffer, cvId, extension);
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
  if (!photoPath) {
    return;
  }

  const uploadsPath = toManagedUploadsPath(photoPath);
  if (!uploadsPath || !isManagedUploadPhotoUrl(uploadsPath)) {
    return;
  }

  try {
    const relativePath = uploadsPath.replace(/^\/+/, '');
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
