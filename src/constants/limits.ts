export const LIMITS = {
  MAX_GOALS_PER_USER: 10,
  MAX_SAVINGS_PER_GOAL: 100,
  MAX_FEEDBACK_PER_USER: 5
} as const;

export type LimitType = keyof typeof LIMITS;
