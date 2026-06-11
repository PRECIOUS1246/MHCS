import { describe, it, expect } from 'vitest';
import { riskColors } from './riskColors';

describe('riskColors', () => {
  it('has colors for all risk levels', () => {
    expect(riskColors.low).toBeDefined();
    expect(riskColors.moderate).toBeDefined();
    expect(riskColors.high).toBeDefined();
    expect(riskColors.critical).toBeDefined();
  });
});
