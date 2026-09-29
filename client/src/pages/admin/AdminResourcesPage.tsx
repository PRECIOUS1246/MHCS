import { useState } from 'react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminResourcesPage = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'article',
    content: '',
    imageUrl: '',
    videoUrl: '',
    url: '',
    tags: [] as string[],
  });
  const [saved, setSaved] = useState(false);

  const create = async () => {
    await api.post('/resources', {
      ...form,
      tags: form.title ? [form.title.toLowerCase().replace(/\s+/g, '-') ] : [],
    });
    setForm({ title: '', description: '', type: 'article', content: '', imageUrl: '', videoUrl: '', url: '', tags: [] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-display font-bold">Manage Resources</h1>
      <Card title="Add New Resource">
        <div className="space-y-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Title" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Description" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
            {['article', 'video', 'guide', 'strategy', 'emergency'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field min-h-[120px]" placeholder="Content" />
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input-field" placeholder="Image URL (optional)" />
          <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="input-field" placeholder="Video URL (optional)" />
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="input-field" placeholder="External link (optional)" />
          <Button onClick={create}>{saved ? 'Created!' : 'Create Resource'}</Button>
        </div>
      </Card>
    </div>
  );
};
