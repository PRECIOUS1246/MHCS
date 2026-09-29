import { describe, it, expect } from 'vitest';
import { getVideoEmbedUrl, getVideoPreviewUrl } from './video';

describe('getVideoPreviewUrl', () => {
  it('returns a YouTube thumbnail for embed URLs', () => {
    const url = 'https://www.youtube.com/embed/6p_yaNFSYao?si=0f5Q6R3v4c4H6g5I';

    expect(getVideoPreviewUrl(url)).toBe('https://img.youtube.com/vi/6p_yaNFSYao/hqdefault.jpg');
  });

  it('returns the original url for direct video files', () => {
    const url = 'https://example.com/video.mp4';

    expect(getVideoPreviewUrl(url)).toBe(url);
  });

  it('normalizes YouTube watch, embed, shorts, and short-link URLs for inline playback', () => {
    expect(getVideoEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe('https://www.youtube.com/embed/abc123');
    expect(getVideoEmbedUrl('https://youtu.be/abc123?t=10')).toBe('https://www.youtube.com/embed/abc123');
    expect(getVideoEmbedUrl('https://www.youtube.com/shorts/abc123')).toBe('https://www.youtube.com/embed/abc123');
    expect(getVideoEmbedUrl('https://www.youtube.com/embed/abc123')).toBe('https://www.youtube.com/embed/abc123');
  });

  it('returns an empty embed URL for unsupported video hosts', () => {
    expect(getVideoEmbedUrl('https://example.com/video.mp4')).toBe('');
  });
});
