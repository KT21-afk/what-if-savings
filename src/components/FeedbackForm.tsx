import { useState, FormEvent } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Feedback } from "../type/Feedback";
import Toast from "./Toast";

interface FeedbackFormProps {
  onFeedbackSubmitted?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onFeedbackSubmitted }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Feedback["category"]>("feature");
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
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
        >
          {loading ? "投稿中..." : "投稿する"}
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