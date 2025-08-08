import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Feedback } from "../type/Feedback";
import Toast from "./Toast";

interface FeedbackAdminProps {
  updateTrigger?: number;
}

const FeedbackAdmin: React.FC<FeedbackAdminProps> = ({ updateTrigger = 0 }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<Feedback["category"] | "all">("all");
  const [filterStatus, setFilterStatus] = useState<Feedback["status"] | "all">("all");
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
      const q = query(collection(db, "feedback"), orderBy("votes", "desc"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const feedbacksData: Feedback[] = [];
      querySnapshot.forEach((doc) => {
        feedbacksData.push({ id: doc.id, ...doc.data() } as Feedback);
      });
      setFeedbacks(feedbacksData);
    } catch (error) {
      console.error("改善要望取得エラー:", error);
      showToast("改善要望の取得に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [updateTrigger]);

  const handleStatusChange = async (feedback: Feedback, newStatus: Feedback["status"]) => {
    const user = auth.currentUser;
    if (!user) {
      showToast("ログインが必要です", "error");
      return;
    }

    try {
      const feedbackRef = doc(db, "feedback", feedback.id!);
      const updateData: any = {
        status: newStatus,
        updatedAt: Timestamp.now(),
      };

      // 完了に変更する場合は完了日時と完了者を記録
      if (newStatus === "completed") {
        updateData.completedAt = Timestamp.now();
        updateData.completedBy = user.uid;
      } else if (feedback.status === "completed") {
        // 完了から他のステータスに変更する場合は完了情報をクリア
        updateData.completedAt = null;
        updateData.completedBy = null;
      }

      await updateDoc(feedbackRef, updateData);
      
      const statusLabel = getStatusLabel(newStatus);
      showToast(`ステータスを「${statusLabel}」に変更しました`, "success");
      
      // リストを更新
      fetchFeedbacks();
    } catch (error) {
      console.error("ステータス更新エラー:", error);
      showToast("ステータスの更新に失敗しました", "error");
    }
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
      case "scheduled": return "bg-blue-100 text-blue-800";
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
      <div className="mx-auto p-4">
        <h2 className="text-lg font-semibold mb-4">改善要望管理</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">改善要望管理</h2>
      
      {/* フィルター */}
      <div className="mb-4 space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as Feedback["category"] | "all")}
            className="w-full border p-2 rounded text-sm"
          >
            <option value="all">全て</option>
            <option value="feature">新機能</option>
            <option value="bug">バグ修正</option>
            <option value="improvement">改善</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as Feedback["status"] | "all")}
            className="w-full border p-2 rounded text-sm"
          >
            <option value="all">全て</option>
            <option value="scheduled">対応予定</option>
            <option value="completed">完了</option>
          </select>
        </div>
      </div>

      {filteredFeedbacks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">改善要望がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-lg shadow-md p-4 border">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 flex-1 mr-2">{feedback.title}</h3>
                <div className="flex gap-1">
                  <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(feedback.category)}`}>
                    {getCategoryLabel(feedback.category)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(feedback.status)}`}>
                    {getStatusLabel(feedback.status)}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{feedback.description}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                <span>投稿者: {feedback.userDisplayName}</span>
                <span>{feedback.createdAt.toDate().toLocaleDateString('ja-JP')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span>👍 {feedback.votes}票</span>
                {feedback.status === "completed" && feedback.completedAt && (
                  <span className="text-green-600">
                    ✅ 完了日: {feedback.completedAt.toDate().toLocaleDateString('ja-JP')}
                  </span>
                )}
              </div>
              
              {/* ステータス変更ボタン */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(feedback, "scheduled")}
                  disabled={feedback.status === "scheduled"}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    feedback.status === "scheduled"
                      ? "bg-yellow-500 text-white"
                      : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                  } disabled:opacity-50`}
                >
                  対応予定
                </button>
                <button
                  onClick={() => handleStatusChange(feedback, "completed")}
                  disabled={feedback.status === "completed"}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    feedback.status === "completed"
                      ? "bg-green-500 text-white"
                      : "bg-green-100 hover:bg-green-200 text-green-800"
                  } disabled:opacity-50`}
                >
                  完了
                </button>
              </div>
            </div>
          ))}
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

export default FeedbackAdmin; 