import fs from 'fs';
import { randomUUID } from 'crypto';
import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
import { CHAT_MEDIA_DIRECTORY } from '../utils/chatMediaStorage';

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
]);

fs.mkdirSync(CHAT_MEDIA_DIRECTORY, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, CHAT_MEDIA_DIRECTORY),
    filename: (_req, _file, callback) => callback(null, randomUUID()),
  }),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error('Choose a JPEG, PNG, GIF, WebP, MP4, or WebM file.'));
      return;
    }
    callback(null, true);
  },
});

type UploadHandler = (req: Request, res: Response, callback: (error?: unknown) => void) => void;
const uploadSingleMedia = upload.single('media') as unknown as UploadHandler;

export const uploadChatMedia = (req: Request, res: Response, next: NextFunction) => {
  uploadSingleMedia(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
        success: false,
        message: error.code === 'LIMIT_FILE_SIZE' ? 'Media must be 20 MB or smaller.' : error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unable to upload this file.',
    });
  });
};