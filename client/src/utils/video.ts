export const getVideoPreviewUrl = (videoUrl?: string) => {
  if (!videoUrl) return '';

  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (hostname === 'youtu.be') {
      const id = pathParts[0];
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : videoUrl;
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const videoIdFromQuery = url.searchParams.get('v');
      const videoIdFromPath = pathParts[0] === 'embed' ? pathParts[1] : '';
      const videoId = videoIdFromQuery || videoIdFromPath;

      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
  } catch {
    return videoUrl;
  }

  return videoUrl;
};

export const getVideoEmbedUrl = (videoUrl?: string) => {
  if (!videoUrl) return '';

  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathParts = url.pathname.split('/').filter(Boolean);
    let videoId = '';

    if (hostname === 'youtu.be') {
      videoId = pathParts[0] ?? '';
    } else if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      videoId = url.searchParams.get('v') ?? '';
      if (!videoId && ['embed', 'shorts', 'live'].includes(pathParts[0] ?? '')) {
        videoId = pathParts[1] ?? '';
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
};
