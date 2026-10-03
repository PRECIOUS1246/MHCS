import { describe, expect, it } from 'vitest';
import type { Resource } from '../types';
import { mergeDefaultResources } from './resources';

const defaults: Resource[] = [
  {
    _id: 'default-guide',
    title: 'Grounding Guide',
    description: 'A short grounding exercise.',
    type: 'guide',
    content: 'Notice what you can see and hear.',
    imageUrl: 'https://example.com/guide.jpg',
    tags: ['wellness'],
  },
  {
    _id: 'default-video',
    title: 'Breathing Video',
    description: 'A brief breathing practice.',
    type: 'video',
    videoUrl: 'https://example.com/breathing.mp4',
    tags: ['wellness'],
  },
];

describe('mergeDefaultResources', () => {
  it('adds defaults missing from a nonempty API response and fills missing API media', () => {
    const loaded: Resource[] = [
      {
        _id: 'api-guide',
        title: 'Grounding Guide',
        description: 'A short grounding exercise.',
        type: 'guide',
        tags: ['wellness'],
      },
    ];

    const resources = mergeDefaultResources(loaded, defaults);

    expect(resources).toHaveLength(2);
    expect(resources[0]).toMatchObject({ _id: 'api-guide', imageUrl: 'https://example.com/guide.jpg' });
    expect(resources[1]).toMatchObject({ _id: 'default-video', videoUrl: 'https://example.com/breathing.mp4' });
  });

  it('applies type and search filters to built-in resources', () => {
    expect(mergeDefaultResources([], defaults, '', 'video').map((resource) => resource.type)).toEqual(['video']);
    expect(mergeDefaultResources([], defaults, 'grounding').map((resource) => resource.title)).toEqual(['Grounding Guide']);
  });
});