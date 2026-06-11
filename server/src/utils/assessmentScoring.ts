import { AssessmentType, RiskLevel } from '../types';

const PHQ9_RECOMMENDATIONS: Record<RiskLevel, string[]> = {
  low: [
    'Your responses suggest minimal depression symptoms.',
    'Continue self-care practices and maintain social connections.',
    'Consider periodic check-ins with our wellness resources.',
  ],
  moderate: [
    'Your responses suggest mild to moderate depression symptoms.',
    'Consider speaking with a peer support group or counsellor.',
    'Explore coping strategies in our resource library.',
  ],
  high: [
    'Your responses suggest moderately severe depression symptoms.',
    'We strongly recommend booking an appointment with a counsellor.',
    'Reach out to someone you trust today.',
  ],
  critical: [
    'Your responses suggest severe depression symptoms.',
    'Please contact a counsellor immediately or use emergency resources.',
    'If you are in crisis, call your local crisis line or campus emergency services.',
  ],
};

const GAD7_RECOMMENDATIONS: Record<RiskLevel, string[]> = {
  low: [
    'Your responses suggest minimal anxiety symptoms.',
    'Practice mindfulness and maintain healthy sleep habits.',
  ],
  moderate: [
    'Your responses suggest mild anxiety symptoms.',
    'Try relaxation techniques and consider peer support.',
  ],
  high: [
    'Your responses suggest moderate anxiety symptoms.',
    'Booking a counsellor appointment is recommended.',
  ],
  critical: [
    'Your responses suggest severe anxiety symptoms.',
    'Please seek professional support as soon as possible.',
    'Crisis resources are available in our emergency contacts section.',
  ],
};

export const calculatePHQ9Score = (answers: number[]): number =>
  answers.reduce((sum, a) => sum + a, 0);

export const calculateGAD7Score = (answers: number[]): number =>
  answers.reduce((sum, a) => sum + a, 0);

export const getPHQ9RiskLevel = (score: number): RiskLevel => {
  if (score <= 4) return 'low';
  if (score <= 9) return 'moderate';
  if (score <= 14) return 'high';
  return 'critical';
};

export const getGAD7RiskLevel = (score: number): RiskLevel => {
  if (score <= 4) return 'low';
  if (score <= 9) return 'moderate';
  if (score <= 14) return 'high';
  return 'critical';
};

export const scoreAssessment = (
  type: AssessmentType,
  answers: number[]
): { score: number; riskLevel: RiskLevel; recommendations: string[] } => {
  if (type === 'phq9') {
    if (answers.length !== 9) throw new Error('PHQ-9 requires exactly 9 answers');
    const score = calculatePHQ9Score(answers);
    const riskLevel = getPHQ9RiskLevel(score);
    return { score, riskLevel, recommendations: PHQ9_RECOMMENDATIONS[riskLevel] };
  }
  if (answers.length !== 7) throw new Error('GAD-7 requires exactly 7 answers');
  const score = calculateGAD7Score(answers);
  const riskLevel = getGAD7RiskLevel(score);
  return { score, riskLevel, recommendations: GAD7_RECOMMENDATIONS[riskLevel] };
};
