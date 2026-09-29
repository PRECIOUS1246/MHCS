import { useEffect, useState } from 'react';
import { Search, ExternalLink, Play } from 'lucide-react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import type { Resource } from '../../types';
import { getVideoEmbedUrl, getVideoPreviewUrl } from '../../utils/video';

const defaultResources: Resource[] = [
  {
    _id: 'default-1',
    title: 'Campus Crisis Line',
    description: '24/7 emergency mental health support',
    type: 'emergency',
    content: 'Call: 1-800-273-8255',
    imageUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=900&q=80',
    url: 'https://988lifeline.org/',
    tags: ['wellness'],
  },
  {
    _id: 'default-2',
    title: 'Mindfulness Guide',
    description: 'Introduction to mindfulness meditation',
    type: 'guide',
    content: 'Practice 5 minutes of focused breathing daily...',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
    videoUrl: 'https://www.youtube.com/embed/6p_yaNFSYao?si=0f5Q6R3v4c4H6g5I',
    tags: ['wellness'],
  },
  {
    _id: 'default-3',
    title: 'Managing Exam Stress',
    description: 'Strategies for exam period wellness',
    type: 'article',
    content: 'Plan study breaks, maintain sleep schedule...',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    url: 'https://www.verywellmind.com/ways-to-reduce-test-anxiety-2795360',
    tags: ['wellness'],
  },
  {
    _id: 'default-4',
    title: 'Five-Minute Guided Meditation',
    description: 'A short guided meditation to help you pause and refocus.',
    type: 'video',
    content: 'Try this brief practice during a study break.',
    videoUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    tags: ['wellness', 'mindfulness'],
  },
  {
    _id: 'default-5',
    title: 'Guided Meditation for Anxiety',
    description: 'A calming guided meditation for moments of stress or anxiety.',
    type: 'video',
    content: 'Pause somewhere comfortable and follow along at your own pace.',
    videoUrl: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',
    tags: ['wellness', 'anxiety'],
  },
  {
    _id: 'default-6',
    title: 'Caring for Your Mental Health',
    description: 'Practical information on supporting your mental health and finding care.',
    type: 'article',
    content: 'Read guidance from the National Institute of Mental Health.',
    imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80',
    url: 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health',
    tags: ['wellness', 'self-care'],
  },
  {
    _id: 'default-7',
    title: 'Understanding Anxiety Disorders',
    description: 'Learn about common anxiety disorders, symptoms, and treatment options.',
    type: 'article',
    content: 'An overview from the National Institute of Mental Health.',
    imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=80',
    url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
    tags: ['wellness', 'anxiety'],
  },
  {
    _id: 'default-8',
    title: 'Mental Health: WHO Overview',
    description: 'An overview of mental health and global approaches to care.',
    type: 'article',
    content: 'A fact sheet from the World Health Organization.',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response',
    tags: ['wellness', 'mental-health'],
  },
  {
    _id: 'default-9',
    title: 'Grounding with the 5-4-3-2-1 Method',
    description: 'A step-by-step sensory grounding exercise for stressful moments.',
    type: 'guide',
    content: 'Notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
    tags: ['wellness', 'grounding'],
  },
  {
    _id: 'default-10',
    title: 'Build a Wind-Down Routine',
    description: 'Small, repeatable steps to make space for rest at the end of the day.',
    type: 'guide',
    content: 'Choose a steady wake time, dim lights before bed, and try a quiet activity that helps you unwind.',
    imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80',
    tags: ['wellness', 'sleep'],
  },
  {
    _id: 'default-11',
    title: 'Plan Your Study Breaks',
    description: 'A flexible focus-and-break rhythm for long study sessions.',
    type: 'strategy',
    content: 'Try 25 minutes of focused work followed by a 5-minute break. After four rounds, take a longer break and adjust the timing to suit you.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    tags: ['wellness', 'study'],
  },
  {
    _id: 'default-12',
    title: 'Take a One-Minute Reset',
    description: 'A brief pause to settle and choose your next manageable step.',
    type: 'strategy',
    content: 'Put both feet on the floor, relax your shoulders, take a few comfortable breaths, then name one small next action.',
    imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=80',
    tags: ['wellness', 'stress'],
  },
];

const defaultResourcesByTitle = new Map(
  defaultResources.map((resource) => [resource.title.toLowerCase(), resource])
);

export const ResourcesPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrentRequest = true;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter) params.set('type', typeFilter);

    setIsLoading(true);
    api
      .get(`/resources?${params}`)
      .then((res) => {
        if (!isCurrentRequest) return;
        const loaded: Resource[] = Array.isArray(res.data?.data) ? res.data.data : [];
        const withDefaultMedia = loaded.map((item) => {
          const fallback = defaultResourcesByTitle.get(item.title.toLowerCase());
          return fallback
            ? {
                ...item,
                imageUrl: item.imageUrl || fallback.imageUrl,
                videoUrl: item.videoUrl || fallback.videoUrl,
              }
            : item;
        });
        setResources(withDefaultMedia.filter((item) => !typeFilter || item.type === typeFilter));
      })
      .catch(() => {
        if (isCurrentRequest) {
          setResources(defaultResources.filter((item) => !typeFilter || item.type === typeFilter));
        }
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [search, typeFilter]);

  const types = ['article', 'video', 'guide', 'strategy', 'emergency'];

  return (
    <div className="resource-shell space-y-6 pb-8">
      <div className="resource-hero">
        <div className="resource-hero-inner">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-200/80" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="resource-search pl-11"
            placeholder="Search resources..."
          />
        </div>
      </div>

      <div className="resource-pills">
        {types.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type === typeFilter ? '' : type)}
            className={`resource-pill ${typeFilter === type ? 'active' : ''}`}
          >
            {type}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p role="status" className="py-10 text-center text-slate-200/80">Loading resources...</p>
      ) : resources.length === 0 ? (
        <p className="py-10 text-center text-slate-200/80">No resources found.</p>
      ) : (
      <div className="grid gap-5 md:grid-cols-2">
        {resources.map((r) => (
          <Card key={r._id} className="resource-card">
            {r.imageUrl && (
              <img src={r.imageUrl} alt={r.title} className="mt-0 h-40 w-full rounded-2xl object-cover" />
            )}

            {(r.videoUrl || (r.type === 'video' && r.url)) && (() => {
              const videoUrl = r.videoUrl || r.url || '';
              const embedUrl = getVideoEmbedUrl(videoUrl);
              const previewUrl = getVideoPreviewUrl(videoUrl);
              const isDirectVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl);

              return (
                <div className="mt-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/20">
                  <div className="relative aspect-video w-full bg-slate-900/50">
                    {isDirectVideo ? (
                      <video controls className="h-full w-full object-cover" src={videoUrl} />
                    ) : embedUrl ? (
                      <iframe
                        className="h-full w-full"
                        src={embedUrl}
                        title={r.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <a href={videoUrl} target="_blank" rel="noreferrer" className="group flex h-full w-full items-center justify-center relative">
                        {previewUrl !== videoUrl && <img src={previewUrl} alt={r.title} className="absolute inset-0 h-full w-full object-cover" />}
                        <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/25 transition" />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-calm-700 shadow-lg">
                          <Play className="ml-1 h-6 w-6 fill-current" />
                          </div>
                      </a>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full ${
                r.type === 'emergency' ? 'bg-red-500/15 text-red-200' : 'bg-calm-400/15 text-calm-100'
              }`}>{r.type}</span>
            </div>

            <h3 className="mt-3 text-2xl font-semibold text-white">{r.title}</h3>
            <p className="mt-2 text-sm text-slate-200/85">{r.description}</p>
            {r.content && <p className="mt-3 rounded-xl bg-white/5 p-3 text-sm text-slate-100/90">{r.content}</p>}
            {r.url && (
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-calm-200 hover:text-white hover:underline">
                <ExternalLink className="w-4 h-4" /> Open resource
              </a>
            )}
          </Card>
        ))}
      </div>
      )}
    </div>
  );
};
