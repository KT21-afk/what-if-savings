import { useState } from "react";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth, provider } from "../firebase";
import Toast from "./Toast";
import PasswordVisibilityIcon from "./PasswordVisibilityIcon";
import GoogleIcon from "./GoogleIcon";

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      showToast("メールアドレスを入力してください", "error");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      showToast("パスワードリセットメールを送信しました。メールをご確認ください。", "success");
      setIsForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("パスワードリセットエラー:", error);
      if (error.code === 'auth/user-not-found') {
        showToast("このメールアドレスは登録されていません", "error");
      } else if (error.code === 'auth/invalid-email') {
        showToast("無効なメールアドレスです", "error");
      } else {
        showToast("パスワードリセットメールの送信に失敗しました", "error");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      showToast("Googleでログインしました！", "success");
    } catch (error: any) {
      console.error("Googleログインエラー:", error);
      showToast(`ログインに失敗しました: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("メールアドレスとパスワードを入力してください", "error");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("ログインしました！", "success");
    } catch (error: any) {
      console.error("ログインエラー:", error);
      let errorMessage = "ログインに失敗しました";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "このメールアドレスは登録されていません。";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "パスワードが間違っています。";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "無効なメールアドレスです。";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !displayName) {
      showToast("全ての項目を入力してください", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("パスワードが一致しません", "error");
      return;
    }

    if (password.length < 6) {
      showToast("パスワードは6文字以上で入力してください", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("パスワードが一致しません", "error");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Firestoreのユーザー情報更新
      const { setDoc, doc, Timestamp } = await import("firebase/firestore");
      const { db } = await import("../firebase");
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: displayName,
        email: userCredential.user.email,
        role: "user",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }, { merge: true });
      
      showToast("アカウントを作成しました！", "success");
      // フォームをクリア
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setDisplayName("");
      setAgreeToTerms(false);
      setIsSignUp(false);
    } catch (error: any) {
      console.error("アカウント作成エラー:", error);
      let errorMessage = "アカウント作成に失敗しました";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "このメールアドレスは既に使用されています。";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "無効なメールアドレスです。";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "パスワードが弱すぎます。6文字以上で入力してください。";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8 mt-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 overflow-hidden">
            <img src="/saving-icon.svg" alt="貯金箱アイコン" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">もしも貯金</h1>
          <p className="text-gray-600 dark:text-gray-300">目標達成をサポートする貯金管理アプリ</p>
        </div>

        {/* メインカード */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* タブ切り替え */}
          {!isForgotPassword && (
            <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button 
                onClick={() => setIsSignUp(false)}
                className={"flex-1 py-2 px-4 rounded-md text-sm font-medium"}
                >
                  ログイン
                </button>
                <button 
                  onClick={() => setIsSignUp(true)}
                  className={"flex-1 py-2 px-4 rounded-md text-sm font-medium"}
                >
                  新規作成
                </button>
              </div>
          )}

          {/* フォーム */}
          {isForgotPassword ? (
            // パスワードリセットフォーム
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">パスワードリセット</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  登録済みのメールアドレスを入力してください
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="example@email.com"
                />
              </div>
              <button
                onClick={handlePasswordReset}
                disabled={resetLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-all disabled:opacity-50"
              >
                {resetLoading ? "送信中..." : "リセットメールを送信"}
              </button>
              <div className="text-center">
                <span
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetEmail("");
                  }}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:underline cursor-pointer"
                >
                  ログインに戻る
                </span>
              </div>
            </div>
          ) : !isSignUp ? (
            // ログインフォーム
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="パスワードを入力"
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowPassword(!showPassword);
                      }
                    }}
                  >
                    <PasswordVisibilityIcon isVisible={showPassword} />
                  </div>
                </div>
              </div>
              <button
                onClick={handleEmailSignIn}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-all disabled:opacity-50"
              >
                {loading ? "ログイン中..." : "ログイン"}
              </button>
              <div className="text-center">
                <span
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer"
                >
                  パスワードを忘れた方はこちら
                </span>
              </div>
            </div>
          ) : (
            // 新規作成フォーム
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  表示名
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="アカウントの名前"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="6文字以上で入力"
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowPassword(!showPassword);
                      }
                    }}
                  >
                    <PasswordVisibilityIcon isVisible={showPassword} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  パスワード（確認）
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-red-300 dark:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="パスワードを再入力"
                  />
                  <div
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={showConfirmPassword ? "パスワードを隠す" : "パスワードを表示"}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowConfirmPassword(!showConfirmPassword);
                      }
                    }}
                  >
                    <PasswordVisibilityIcon isVisible={showConfirmPassword} />
                  </div>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">パスワードが一致しません</p>
                )}
              </div>
              {/* 利用規約同意 */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agree-terms" className="text-sm text-gray-600 dark:text-gray-400">
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline">利用規約</a>と
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline">プライバシーポリシー</a>に同意します
                </label>
              </div>
              
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-all disabled:opacity-50"
              >
                {loading ? "作成中..." : "アカウント作成"}
              </button>
            </div>
          )}

          {/* 区切り線 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">または</span>
            </div>
          </div>

          {/* Googleログインボタン */}
      <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
      >
            <GoogleIcon />
            {loading ? "処理中..." : "Googleでログイン"}
      </button>

          {/* 利用規約・プライバシーポリシー */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
            ログインまたはアカウント作成により、
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">利用規約</a>と
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">プライバシーポリシー</a>に同意したものとみなされます。
          </p>
        </div>

        {/* フッター */}
        <div className="text-center mt-8 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            © 2025 もしも貯金. All rights reserved.
          </p>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={3000}
      />
    </div>
  );
};

export default Login;