// 入力値の検証ルール

export const VALIDATION_RULES = {
  // 目標関連
  GOAL_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[^\n\r]*$/, // 改行文字を禁止
  },
  GOAL_AMOUNT: {
    MIN: 1,
    MAX: 999999999, // 約10億円
  },
  
  // 貯金明細関連
  SAVING_ITEM_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
    PATTERN: /^[^\n\r]*$/, // 改行文字を禁止
  },
  SAVING_AMOUNT: {
    MIN: 1,
    MAX: 999999999, // 約10億円
  },
  
  // 改善要望関連
  FEEDBACK_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
    PATTERN: /^[^\n\r]*$/, // 改行文字を禁止
  },
  FEEDBACK_DESCRIPTION: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 2000,
    PATTERN: /^[^\n\r]*$/, // 改行文字を禁止
  },
  
  // ユーザー関連
  DISPLAY_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    PATTERN: /^[^\n\r]*$/, // 改行文字を禁止
  },
  EMAIL: {
    MAX_LENGTH: 254, // RFC 5321準拠
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },
} as const;

export type ValidationRuleType = keyof typeof VALIDATION_RULES;
