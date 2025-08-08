// XSS攻撃を防ぐためのサニタイズ機能

/**
 * HTMLタグとスクリプトを除去して安全な文字列に変換
 * @param input ユーザー入力文字列
 * @returns サニタイズされた文字列
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    // HTMLタグを除去
    .replace(/<[^>]*>/g, '')
    // スクリプトタグを除去（念のため）
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // 危険な文字をエスケープ
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * 文字列の長さを制限
 * @param input 入力文字列
 * @param maxLength 最大文字数
 * @returns 制限された文字列
 */
export const limitLength = (input: string, maxLength: number): string => {
  if (!input) return '';
  return input.length > maxLength ? input.substring(0, maxLength) : input;
};

/**
 * 数値のみを許可
 * @param input 入力文字列
 * @returns 数値のみの文字列
 */
export const sanitizeNumber = (input: string): string => {
  if (!input) return '';
  return input.replace(/[^\d]/g, '');
};

/**
 * メールアドレスの形式を検証
 * @param email メールアドレス
 * @returns 有効なメールアドレスかどうか
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * パスワードの強度を検証
 * @param password パスワード
 * @returns パスワードが安全かどうか
 */
export const isStrongPassword = (password: string): boolean => {
  // 8文字以上、英数字を含む
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
