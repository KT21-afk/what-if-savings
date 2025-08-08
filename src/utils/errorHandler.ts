// エラー情報の漏洩を防ぐためのエラーハンドリング

/**
 * エラーメッセージを一般化して安全なメッセージに変換
 * @param error エラーオブジェクト
 * @param context エラーのコンテキスト
 * @returns 安全なエラーメッセージ
 */
export const getSafeErrorMessage = (error: unknown, context: string): string => {
  console.error(`${context}エラー:`, error);
  
  if (error instanceof Error) {
    // Firebase Auth エラーの場合
    if (error.message.includes('auth/')) {
      return getFirebaseAuthErrorMessage(error.message);
    }
    
    // Firestore エラーの場合
    if (error.message.includes('permission-denied')) {
      return 'アクセス権限がありません';
    }
    
    if (error.message.includes('not-found')) {
      return 'データが見つかりません';
    }
    
    if (error.message.includes('already-exists')) {
      return 'データが既に存在します';
    }
    
    if (error.message.includes('invalid-argument')) {
      return '入力データが正しくありません';
    }
    
    if (error.message.includes('unavailable')) {
      return 'サービスが一時的に利用できません';
    }
    
    if (error.message.includes('deadline-exceeded')) {
      return 'リクエストがタイムアウトしました';
    }
  }
  
  // デフォルトのエラーメッセージ
  return 'エラーが発生しました。しばらく時間をおいて再度お試しください。';
};

/**
 * Firebase Auth エラーメッセージを日本語に変換
 * @param errorMessage Firebase Auth エラーメッセージ
 * @returns 日本語のエラーメッセージ
 */
const getFirebaseAuthErrorMessage = (errorMessage: string): string => {
  if (errorMessage.includes('auth/user-not-found')) {
    return 'このメールアドレスは登録されていません';
  }
  
  if (errorMessage.includes('auth/invalid-credential')) {
    return 'パスワードが間違っています';
  }
  
  if (errorMessage.includes('auth/invalid-email')) {
    return '無効なメールアドレスです';
  }
  
  if (errorMessage.includes('auth/weak-password') 
    || errorMessage.includes('auth/password-does-not-meet-requirements')) {
    return 'パスワードには大文字・小文字・数字を含め、8文字以上にしてください。';
  }
  
  if (errorMessage.includes('auth/email-already-in-use')) {
    return 'このメールアドレスは既に使用されています';
  }
  
  if (errorMessage.includes('auth/too-many-requests')) {
    return 'リクエストが多すぎます。しばらく時間をおいて再度お試しください';
  }
  
  if (errorMessage.includes('auth/network-request-failed')) {
    return 'ネットワークエラーが発生しました';
  }
  
  if (errorMessage.includes('auth/popup-closed-by-user')) {
    return 'ログインがキャンセルされました';
  }
  
  if (errorMessage.includes('auth/popup-blocked')) {
    return 'ポップアップがブロックされました。ポップアップを許可してください';
  }
  
  if (errorMessage.includes('auth/account-exists-with-different-credential')) {
    return 'このメールアドレスは別の方法で登録されています';
  }
  
  return '認証エラーが発生しました';
};
