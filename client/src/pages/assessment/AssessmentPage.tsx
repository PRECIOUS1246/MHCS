import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PHQ9_QUESTIONS, GAD7_QUESTIONS, ANSWER_OPTIONS } from '../../data/assessments';
import { riskColors } from '../../utils/riskColors';
import type { AssessmentType, RiskLevel } from '../../types';

export const AssessmentPage = () => {
  const [type, setType] = useState<AssessmentType | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [result, setResult] = useState<{ score: number; riskLevel: RiskLevel; recommendations: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const questions = type === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      submitAssessment(newAnswers);
    }
  };

  const submitAssessment = async (finalAnswers: number[]) => {
    setLoading(true);
    try {
      console.log('Submitting assessment:', { type, isAnonymous, score: finalAnswers.reduce((a, b) => a + b, 0) });
      const res = await api.post('/assessments', { type, answers: finalAnswers, isAnonymous });
      console.log('Assessment submitted:', res.data.data);
      setResult(res.data.data);
    } catch (err: any) {
      console.error('Failed to submit assessment:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setType(null);
    setStep(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    return (
      <Card title="Assessment Complete" className="max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <p className="text-4xl font-bold">{result.score}</p>
          <span className={`inline-block px-4 py-1 rounded-full capitalize ${riskColors[result.riskLevel]}`}>
            {result.riskLevel} risk
          </span>
          <ul className="text-left space-y-2 mt-6">
            {result.recommendations.map((r, i) => (
              <li key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm">{r}</li>
            ))}
          </ul>
          {result.riskLevel === 'critical' && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 text-sm">
              If you're in crisis, please contact campus emergency services or call a crisis helpline immediately.
            </div>
          )}
          <Button onClick={reset}>Take Another Assessment</Button>
        </div>
      </Card>
    );
  }

  if (!type) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold">Self-Assessment</h1>
        <p className="text-slate-500">Choose a screening tool. Your responses help us provide appropriate support.</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          Submit anonymously (will not appear in your history)
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <motion.button whileHover={{ scale: 1.02 }} onClick={() => setType('phq9')} className="glass-card p-6 text-left">
            <h3 className="font-bold text-lg">PHQ-9</h3>
            <p className="text-sm text-slate-500 mt-2">Depression screening — 9 questions</p>
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} onClick={() => setType('gad7')} className="glass-card p-6 text-left">
            <h3 className="font-bold text-lg">GAD-7</h3>
            <p className="text-sm text-slate-500 mt-2">Anxiety screening — 7 questions</p>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>Question {step + 1} of {questions.length}</span>
          <span>{Math.round(((step) / questions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-calm-500 transition-all" style={{ width: `${((step) / questions.length) * 100}%` }} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <p className="text-lg font-medium mb-6">Over the last 2 weeks, how often have you been bothered by:</p>
          <p className="text-xl mb-8">{questions[step]}</p>
          <div className="space-y-3">
            {ANSWER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                disabled={loading}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-calm-500 hover:bg-calm-50 dark:hover:bg-calm-900/20 text-left transition-all"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      {step > 0 && (
        <button onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }} className="mt-4 text-sm text-slate-500 hover:text-calm-600">
          ← Previous
        </button>
      )}
    </Card>
  );
};
