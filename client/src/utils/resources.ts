import type { Resource } from '../types';

export const mergeDefaultResources = (
  loaded: Resource[],
  defaults: Resource[],
  search = '',
  typeFilter = ''
): Resource[] => {
  const query = search.trim().toLowerCase();
  const defaultByTitle = new Map(defaults.map((resource) => [resource.title.toLowerCase(), resource]));
  const loadedTitles = new Set(loaded.map((resource) => resource.title.toLowerCase()));
  const missingDefaults = defaults.filter((resource) => {
    if (loadedTitles.has(resource.title.toLowerCase())) return false;
    if (typeFilter && resource.type !== typeFilter) return false;
    if (!query) return true;

    const searchableText = [
      resource.title,
      resource.description,
      resource.content ?? '',
      ...resource.tags,
    ].join(' ').toLowerCase();
    return searchableText.includes(query);
  });

  return [...loaded, ...missingDefaults]
    .filter((resource) => !typeFilter || resource.type === typeFilter)
    .map((resource) => {
      const fallback = defaultByTitle.get(resource.title.toLowerCase());
      if (!fallback) return resource;

      return {
        ...resource,
        imageUrl: resource.imageUrl || fallback.imageUrl,
        videoUrl: resource.videoUrl || fallback.videoUrl,
      };
    });
};