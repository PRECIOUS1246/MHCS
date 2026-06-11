import { useEffect, useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import type { Resource } from '../../types';

export const ResourcesPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter) params.set('type', typeFilter);
    api.get(`/resources?${params}`).then((res) => setResources(res.data.data));
  }, [search, typeFilter]);

  const types = ['article', 'video', 'guide', 'strategy', 'emergency'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Wellness Resources</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search resources..." />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field sm:w-48">
          <option value="">All types</option>
          {types.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((r) => (
          <Card key={r._id}>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              r.type === 'emergency' ? 'bg-red-100 text-red-700' : 'bg-calm-100 text-calm-700'
            }`}>{r.type}</span>
            <h3 className="font-semibold mt-2">{r.title}</h3>
            <p className="text-sm text-slate-500 mt-2">{r.description}</p>
            {r.content && <p className="text-sm mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">{r.content}</p>}
            {r.url && (
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-calm-600 text-sm mt-3 hover:underline">
                <ExternalLink className="w-4 h-4" /> Open resource
              </a>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
