import { useState, FormEvent, useEffect } from "react";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Feedback } from "../type/Feedback";
import Toast from "./Toast";
import { LIMITS } from "../constants/limits";

interface FeedbackFormProps {
  onFeedbackSubmitted?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onFeedbackSubmitted }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Feedback["category"]>("feature");
  const [loading, setLoading] = useState(false);
  const [userFeedbackCount, setUserFeedbackCount] = useState(0);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));

  // ユーザーの投稿数を取得
  const fetchUserFeedbackCount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userFeedbacksQuery = query(
        collection(db, "feedback"),
        where("userId", "==", user.uid)
      );
      const userFeedbacksSnapshot = await getDocs(userFeedbacksQuery);
      setUserFeedbackCount(userFeedbacksSnapshot.size);
    } catch (error) {
      console.error("投稿数取得エラー:", error);
    }
  };

  // コンポーネントマウント時に投稿数を取得
  useEffect(() => {
    fetchUserFeedbackCount();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    if (!user) {
      showToast("ログインが必要です", "error");
      return;
    }

    if (!title.trim() || !description.trim()) {
      showToast("タイトルと説明を入力してください", "error");
      return;
    }

    setLoading(true);
    try {
      // ユーザーの投稿数をチェック
      const userFeedbacksQuery = query(
        collection(db, "feedback"),
        where("userId", "==", user.uid)
      );
      const userFeedbacksSnapshot = await getDocs(userFeedbacksQuery);
      
      if (userFeedbacksSnapshot.size >= LIMITS.MAX_FEEDBACK_PER_USER) {
        showToast(`改善要望の投稿上限（${LIMITS.MAX_FEEDBACK_PER_USER}件）に達しています`, "error");
        return;
      }

      const data: Omit<Feedback, "id" | "status"> = {
        userId: user.uid,
        userDisplayName: user.displayName || "匿名ユーザー",
        title: title.trim(),
        description: description.trim(),
        category,
        votes: 0,
        voters: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "feedback"), data);
      
      showToast("改善要望を投稿しました！", "success");
      setTitle("");
      setDescription("");
      setCategory("feature");
      setUserFeedbackCount(prev => prev + 1);
      onFeedbackSubmitted?.();
    } catch (error: unknown) {
      console.error("改善要望投稿エラー:", error);
      if (error instanceof Error) {
        showToast(`投稿に失敗しました: ${error.message}`, "error");
      } else {
        showToast("投稿に失敗しました: 不明なエラーが発生しました", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* 投稿状況表示 */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          投稿状況: {userFeedbackCount} / {LIMITS.MAX_FEEDBACK_PER_USER} 件
        </p>
        {userFeedbackCount >= LIMITS.MAX_FEEDBACK_PER_USER && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            投稿上限に達しています
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
            required
            placeholder="改善要望のタイトル"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            カテゴリ
          </label>
          <select
            id="category"
            value={category}
            onChange={e => setCategory(e.target.value as Feedback["category"])}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="feature">新機能</option>
            <option value="bug">バグ修正</option>
            <option value="improvement">改善</option>
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            詳細説明
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
            rows={4}
            required
            placeholder="改善要望の詳細を説明してください"
          />
        </div>

        <button
          type="submit"
          disabled={loading || userFeedbackCount >= LIMITS.MAX_FEEDBACK_PER_USER}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
        >
          {loading ? "投稿中..." : userFeedbackCount >= LIMITS.MAX_FEEDBACK_PER_USER ? "投稿上限に達しています" : "投稿する"}
        </button>
      </form>

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

export default FeedbackForm; 