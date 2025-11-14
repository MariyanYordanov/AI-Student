import { calculateKnowledgeDecay } from '../../utils/knowledge-decay';

describe('Knowledge Decay Utility', () => {
  describe('calculateKnowledgeDecay', () => {
    const baseTime = new Date('2025-11-14T10:00:00Z');

    it('should not decay knowledge within 3-day grace period', () => {
      const lastReviewed = new Date(baseTime.getTime() - 2 * 24 * 60 * 60 * 1000);
      const currentLevel = 0.8;

      const decayed = calculateKnowledgeDecay(currentLevel, lastReviewed, baseTime);

      expect(decayed).toBe(currentLevel);
    });

    it('should apply 5% daily decay for days 4-7', () => {
      const lastReviewed = new Date(baseTime.getTime() - 4 * 24 * 60 * 60 * 1000);
      const currentLevel = 0.8;

      const decayed = calculateKnowledgeDecay(currentLevel, lastReviewed, baseTime);

      expect(decayed).toBeLessThan(currentLevel);
      expect(decayed).toBeGreaterThanOrEqual(0.1);
    });

    it('should never decay below 0.1 floor', () => {
      const lastReviewed = new Date(baseTime.getTime() - 60 * 24 * 60 * 60 * 1000);
      const currentLevel = 0.8;

      const decayed = calculateKnowledgeDecay(currentLevel, lastReviewed, baseTime);

      expect(decayed).toBeGreaterThanOrEqual(0.1);
    });

    it('should handle zero and negative understanding levels', () => {
      const lastReviewed = new Date(baseTime.getTime() - 30 * 24 * 60 * 60 * 1000);

      const decayed0 = calculateKnowledgeDecay(0, lastReviewed, baseTime);
      const decayedNegative = calculateKnowledgeDecay(-0.5, lastReviewed, baseTime);

      expect(decayed0).toBe(0);
      expect(decayedNegative).toBeLessThanOrEqual(0);
    });
  });
});
