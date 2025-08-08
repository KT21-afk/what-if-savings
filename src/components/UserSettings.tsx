import { useState } from "react";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "../firebase";
import Toast from "./Toast";
import PasswordVisibilityIcon from "./PasswordVisibilityIcon";

const UserSettings: React.FC = () => {
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));

  const handleUpdateDisplayName = async () => {
    if (!auth.currentUser) {
      showToast("ログインが必要です", "error");
      return;
    }

    if (!displayName.trim()) {
      showToast("表示名を入力してください", "error");
      return;
    }

    setLoading(true);
    try {
      // Firebase AuthのdisplayNameを更新
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim()
      });

      // Firestoreのユーザー情報も更新
      const { setDoc, doc, Timestamp } = await import("firebase/firestore");
      const { db } = await import("../firebase");
      
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        displayName: displayName.trim(),
        updatedAt: Timestamp.now(),
      }, { merge: true });

      showToast("表示名を更新しました！", "success");
    } catch (error: any) {
      console.error("表示名更新エラー:", error);
      showToast("表示名の更新に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!auth.currentUser || !auth.currentUser.email) {
      showToast("ログインが必要です", "error");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("全ての項目を入力してください", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("新しいパスワードは6文字以上で入力してください", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("新しいパスワードが一致しません", "error");
      return;
    }

    setLoading(true);
    try {
      // 現在のパスワードで再認証
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // パスワード更新
      await updatePassword(auth.currentUser, newPassword);
      
      showToast("パスワードを更新しました！", "success");
      
      // フォームをクリア
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("パスワード更新エラー:", error);
      if (error.code === 'auth/wrong-password') {
        showToast("現在のパスワードが間違っています", "error");
      } else {
        showToast("パスワードの更新に失敗しました", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">ユーザー設定</h2>
      
      {/* 表示名変更 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">表示名の変更</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              新しい表示名
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
              placeholder="新しい表示名を入力"
            />
          </div>
          <button
            onClick={handleUpdateDisplayName}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
          >
            {loading ? "更新中..." : "表示名を更新"}
          </button>
        </div>
      </div>

      {/* パスワード変更 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">パスワードの変更</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              現在のパスワード
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
                placeholder="現在のパスワード"
              />
              <span
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              >
                <PasswordVisibilityIcon isVisible={showCurrentPassword} className="w-5 h-5" />
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              新しいパスワード
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
                placeholder="新しいパスワード"
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              >
                <PasswordVisibilityIcon isVisible={showNewPassword} className="w-5 h-5" />
              </span>
            </div>
          </div>
          <button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
          >
            {loading ? "更新中..." : "パスワードを更新"}
          </button>
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

export default UserSettings; 