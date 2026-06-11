import { useEffect, useState } from 'react';
import { ThumbsUp, Flag } from 'lucide-react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { Forum, ForumPost } from '../../types';

export const ForumsPage = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [selectedForum, setSelectedForum] = useState<string | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/forums').then((res) => setForums(res.data.data));
  }, []);

  const loadPosts = (forumId: string) => {
    setSelectedForum(forumId);
    api.get(`/forums/${forumId}/posts`).then((res) => setPosts(res.data.data));
  };

  const createPost = async () => {
    if (!selectedForum) return;
    setLoading(true);
    try {
      await api.post('/forums/posts', { forumId: selectedForum, ...newPost, isAnonymous: true });
      setNewPost({ title: '', content: '' });
      setShowNewPost(false);
      loadPosts(selectedForum);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Support Forums</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {forums.map((forum) => (
            <button
              key={forum._id}
              onClick={() => loadPosts(forum._id)}
              className={`w-full glass-card p-4 text-left transition-all ${
                selectedForum === forum._id ? 'ring-2 ring-calm-500' : ''
              }`}
            >
              <h3 className="font-semibold">{forum.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{forum.description}</p>
              <span className="text-xs text-calm-600 mt-2 inline-block">{forum.postCount} posts</span>
            </button>
          ))}
        </div>
        <div className="lg:col-span-2">
          {selectedForum ? (
            <Card>
              <div className="flex justify-between mb-4">
                <h2 className="font-semibold">Discussions</h2>
                <Button variant="secondary" onClick={() => setShowNewPost(!showNewPost)}>New Post</Button>
              </div>
              {showNewPost && (
                <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  <input value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} className="input-field" placeholder="Title" />
                  <textarea value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} className="input-field min-h-[100px]" placeholder="Share anonymously..." />
                  <Button onClick={createPost} loading={loading}>Post Anonymously</Button>
                </div>
              )}
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">{post.anonymousName}</span>
                      <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-medium mt-2">{post.title}</h3>
                    <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">{post.content}</p>
                    <div className="flex gap-4 mt-3">
                      <button onClick={() => api.post(`/forums/posts/${post._id}/like`)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-calm-600">
                        <ThumbsUp className="w-4 h-4" /> {post.likes}
                      </button>
                      <button onClick={() => api.post(`/forums/posts/${post._id}/report`)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600">
                        <Flag className="w-4 h-4" /> Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card><p className="text-slate-500 text-center py-12">Select a forum to view discussions</p></Card>
          )}
        </div>
      </div>
    </div>
  );
};
