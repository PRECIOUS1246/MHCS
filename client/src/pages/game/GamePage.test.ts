import { describe, expect, it } from 'vitest';
import { buildCopingQuiz, buildQuiz, copingQuestions } from './GamePage';

describe('buildQuiz', () => {
  it('returns all celebrities exactly once without duplicates', () => {
    const celebrities = [
      { name: 'Tom Hanks', region: 'Hollywood' },
      { name: 'Angelina Jolie', region: 'Hollywood' },
      { name: 'Leonardo DiCaprio', region: 'Hollywood' },
      { name: 'Margot Robbie', region: 'Hollywood' },
      { name: 'Dwayne Johnson', region: 'Hollywood' },
    ];

    const quiz = buildQuiz(celebrities);

    expect(quiz).toHaveLength(celebrities.length);
    expect(quiz.map((item) => item.name).sort()).toEqual(celebrities.map((item) => item.name).sort());
  });
});

describe('buildCopingQuiz', () => {
  it('includes every scenario once with its helpful option among the choices', () => {
    const quiz = buildCopingQuiz(copingQuestions);

    expect(copingQuestions).toHaveLength(10);
    expect(quiz).toHaveLength(10);
    expect(quiz.map((item) => item.scenario).sort()).toEqual(copingQuestions.map((item) => item.scenario).sort());
    expect(quiz.every((item) => item.options.includes(item.answer))).toBe(true);
  });
});
