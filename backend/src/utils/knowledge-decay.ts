/**
 * Knowledge decay utility
 * Simulates forgetting if concepts aren't reviewed regularly
 */

export function calculateDecay(
  lastReviewed: Date,
  currentLevel: number
): number {
  const now = new Date();
  const daysSinceReview = Math.floor(
    (now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
  );

  // No decay for first 3 days
  if (daysSinceReview <= 3) {
    return currentLevel;
  }

  // Decay rate based on time
  // Week 1 (days 4-7): -5% per day
  // Week 2 (days 8-14): -10% per day
  // Week 3+ (15+): -15% per day
  let decayRate = 0;
  if (daysSinceReview <= 7) {
    decayRate = 0.05;
  } else if (daysSinceReview <= 14) {
    decayRate = 0.10;
  } else {
    decayRate = 0.15;
  }

  const daysToDecay = daysSinceReview - 3; // First 3 days don't count
  const totalDecay = Math.min(currentLevel * decayRate * daysToDecay, currentLevel * 0.8);

  // Never decay below 0.1 (some memory remains)
  return Math.max(0.1, currentLevel - totalDecay);
}

export function shouldApplyDecay(lastReviewed: Date): boolean {
  const now = new Date();
  const daysSinceReview = Math.floor(
    (now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceReview > 3;
}
