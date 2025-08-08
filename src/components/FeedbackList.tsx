import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc, arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Feedback } from "../type/Feedback";
import Toast from "./Toast";
import FeedbackForm from "./FeedbackForm";

interface FeedbackListProps {
  updateTrigger?: number;
}

const FeedbackList: React.FC<FeedbackListProps> = ({ updateTrigger = 0 }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<Feedback["category"] | "all">("all");
  const [filterStatus, setFilterStatus] = useState<Feedback["status"] | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));

  const fetchFeedbacks = async () => {
    try {
      console.log("改善要望取得開始");
      const q = query(collection(db, "feedback"), orderBy("votes", "desc"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const feedbacksData: Feedback[] = [];
      querySnapshot.forEach((doc) => {
        feedbacksData.push({ id: doc.id, ...doc.data() } as Feedback);
      });
      console.log("取得した改善要望数:", feedbacksData.length);
      setFeedbacks(feedbacksData);
    } catch (error) {
      console.error("改善要望取得エラー詳細:", error);
      if (error instanceof Error) {
        console.error("エラーメッセージ:", error.message);
        showToast(`改善要望の取得に失敗しました: ${error.message}`, "error");
      } else {
        showToast("改善要望の取得に失敗しました", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [updateTrigger]);

  const handleVote = async (feedback: Feedback) => {
    const user = auth.currentUser;
    if (!user) {
      showToast("ログインが必要です", "error");
      return;
    }

    try {
      const feedbackRef = doc(db, "feedback", feedback.id!);
      const hasVoted = feedback.voters.includes(user.uid);
      
      if (hasVoted) {
        // 投票を取り消し
        await updateDoc(feedbackRef, {
          votes: feedback.votes - 1,
          voters: arrayRemove(user.uid),
          updatedAt: Timestamp.now()
        });
        showToast("投票を取り消しました", "success");
      } else {
        // 投票
        await updateDoc(feedbackRef, {
          votes: feedback.votes + 1,
          voters: arrayUnion(user.uid),
          updatedAt: Timestamp.now()
        });
        showToast("投票しました！", "success");
      }
      
      // リストを更新
      fetchFeedbacks();
    } catch (error) {
      console.error("投票エラー:", error);
      showToast("投票に失敗しました", "error");
    }
  };

  const handleFeedbackSubmitted = () => {
    fetchFeedbacks();
    setIsModalOpen(false);
  };

  const getCategoryLabel = (category: Feedback["category"]) => {
    switch (category) {
      case "feature": return "新機能";
      case "bug": return "バグ修正";
      case "improvement": return "改善";
      default: return category;
    }
  };

  const getStatusLabel = (status: Feedback["status"]) => {
    switch (status) {
      case "scheduled": return "対応予定";
      case "completed": return "完了";
      default: return status;
    }
  };

  const getStatusColor = (status: Feedback["status"]) => {
    switch (status) {
      case "scheduled": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: Feedback["category"]) => {
    switch (category) {
      case "feature": return "bg-purple-100 text-purple-800";
      case "bug": return "bg-red-100 text-red-800";
      case "improvement": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const categoryMatch = filterCategory === "all" || feedback.category === filterCategory;
    const statusMatch = filterStatus === "all" || feedback.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">改善要望</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">改善要望</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          追加
        </button>
      </div>
      
      {/* フィルター */}
      <div className="mb-6 space-y-3">
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            カテゴリ
          </label>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as Feedback["category"] | "all")}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
          >
            <option value="all">全て</option>
            <option value="feature">新機能</option>
            <option value="bug">バグ修正</option>
            <option value="improvement">改善</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            ステータス
          </label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as Feedback["status"] | "all")}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
          >
            <option value="all">全て</option>
            <option value="scheduled">対応予定</option>
            <option value="completed">完了</option>
          </select>
        </div>
      </div>

      {filteredFeedbacks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">改善要望がありません</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((feedback) => {
            const user = auth.currentUser;
            const hasVoted = user && feedback.voters.includes(user.uid);
            
            return (
              <div key={feedback.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {feedback.title}
                      {feedback.status === "completed" && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          完了
                        </span>
                      )}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
                      {feedback.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {feedback.category === "feature" ? "新機能" : 
                         feedback.category === "bug" ? "バグ修正" : "改善"}
                      </span>
                      <span>投稿者: {feedback.userDisplayName}</span>
                      <span>{feedback.createdAt.toDate().toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleVote(feedback)}
                    disabled={!user}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                      hasVoted
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                    } disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    👍 {feedback.votes}
                  </button>
                  
                  {hasVoted && (
                    <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">投票済み</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">改善要望を投稿</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />
          </div>
        </div>
      )}

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

export default FeedbackList; 