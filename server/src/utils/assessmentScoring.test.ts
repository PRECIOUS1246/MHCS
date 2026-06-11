import { scoreAssessment, getPHQ9RiskLevel, getGAD7RiskLevel } from './assessmentScoring';

describe('Assessment Scoring', () => {
  describe('PHQ-9', () => {
    it('calculates low risk correctly', () => {
      const result = scoreAssessment('phq9', [0, 0, 1, 0, 1, 0, 0, 0, 0]);
      expect(result.score).toBe(2);
      expect(result.riskLevel).toBe('low');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('calculates critical risk correctly', () => {
      const result = scoreAssessment('phq9', [3, 3, 3, 3, 2, 2, 2, 1, 1]);
      expect(result.score).toBe(20);
      expect(result.riskLevel).toBe('critical');
    });

    it('throws on invalid answer count', () => {
      expect(() => scoreAssessment('phq9', [0, 0, 0])).toThrow();
    });
  });

  describe('GAD-7', () => {
    it('calculates moderate risk correctly', () => {
      const result = scoreAssessment('gad7', [2, 2, 1, 1, 0, 0, 0]);
      expect(result.score).toBe(6);
      expect(result.riskLevel).toBe('moderate');
    });

    it('maps risk levels correctly', () => {
      expect(getGAD7RiskLevel(3)).toBe('low');
      expect(getPHQ9RiskLevel(12)).toBe('high');
    });
  });
});
