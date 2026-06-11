import { useEffect, useState } from 'react';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { riskColors } from '../../utils/riskColors';
import type { Assessment } from '../../types';

export const AssessmentsReviewPage = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('');

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const query = riskFilter ? `?risk=${riskFilter}` : '';
        console.log(`Fetching assessments${query ? ` with filter: ${query}` : '...all non-anonymous'}`);
        const res = await api.get(`/assessments/counsellor${query}`);
        console.log('Assessments loaded:', res.data.data, `Total: ${res.data.total}`);
        setAssessments(res.data.data || []);
        setError('');
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to load assessments';
        console.error('Failed to load assessments:', err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadAssessments();
  }, [riskFilter]);

  if (loading) {
    return <div className="text-center py-8">Loading assessments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold">Assessment Review</h1>
        <div className="flex gap-2">
          <label className="text-sm font-medium">Filter by Risk:</label>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="input-field px-3 py-1 text-sm">
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      {error && <div className="rounded-xl p-4 bg-red-50 text-red-700">{error}</div>}
      {assessments.map((a) => (
        <Card key={a._id}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="uppercase font-medium">{a.type}</span>
                <p className="text-sm text-slate-500 mt-1">
                  {a.userId ? `${a.userId.firstName} ${a.userId.lastName}` : 'Anonymous student'}
                  {a.userId?.studentId ? ` · ${a.userId.studentId}` : ''}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${riskColors[a.riskLevel]}`}>{a.riskLevel}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">Score: {a.score}</p>
                <p className="text-sm text-slate-500">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Recommendations</p>
                <ul className="list-disc ml-4 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  {(a.recommendations || []).map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>

            {a.answers && (
              <div>
                <p className="text-sm font-medium">Answers</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  {a.answers.map((answer, index) => (
                    <div key={index} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                      Q{index + 1}: {answer}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
      {!assessments.length && <p className="text-slate-500">No high-risk assessments available for review.</p>}
    </div>
  );
};
