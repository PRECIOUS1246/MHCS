import fs from 'fs/promises';
import path from 'path';

export const CHAT_MEDIA_DIRECTORY = path.resolve(__dirname, '../../uploads/chat');

export const removeChatMediaFile = async (fileId: string) => {
  if (!/^[\da-f-]{36}$/i.test(fileId)) return;

  try {
    await fs.unlink(path.join(CHAT_MEDIA_DIRECTORY, fileId));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
};