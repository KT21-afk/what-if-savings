import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Goal } from "../type/Goal";
import Toast from "./Toast";
import EditGoalModal from "./EditGoalModal";
import GoalForm from "./GoalForm";

interface GoalListProps {
  updateTrigger?: number;
}

const GoalList: React.FC<GoalListProps> = ({ updateTrigger = 0 }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isVisible: false,
    message: "",
    type: "success"
  });
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "incomplete">("all");
  const [sortBy, setSortBy] = useState<"deadline" | "progress" | "targetAmount">("deadline");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleGoalSubmitted = () => {
    fetchGoals();
    setIsModalOpen(false);
  };

  // 進捗率を計算
  const calculateProgress = (current: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  // 残り日数を計算
  const calculateDaysLeft = (deadline: Timestamp): number => {
    const now = new Date();
    const deadlineDate = deadline.toDate();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 目標一覧を取得
  const fetchGoals = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        showToast("ログインが必要です", "error");
        return;
      }
      const q = query(
        collection(db, "goals"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const goalsData: Goal[] = [];
      querySnapshot.forEach((doc) => {
        goalsData.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(goalsData);
    } catch (error) {
      console.error("目標取得エラー:", error);
      showToast("目標の取得に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [updateTrigger]);

  const filteredGoals = goals.filter(goal => {
    if (filterStatus === "all") return true;
    if (filterStatus === "completed") return goal.achievedAt;
    if (filterStatus === "incomplete") return !goal.achievedAt;
    return true;
  });

  // ソート機能
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    const progressA = calculateProgress(a.currentAmount, a.targetAmount);
    const progressB = calculateProgress(b.currentAmount, b.targetAmount);
    
    switch (sortBy) {
      case "deadline":
        const deadlineA = a.deadline.toDate().getTime();
        const deadlineB = b.deadline.toDate().getTime();
        return sortOrder === "asc" ? deadlineA - deadlineB : deadlineB - deadlineA;
      case "progress":
        return sortOrder === "asc" ? progressA - progressB : progressB - progressA;
      case "targetAmount":
        return sortOrder === "asc" ? a.targetAmount - b.targetAmount : b.targetAmount - a.targetAmount;
      default:
        return 0;
    }
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">目標一覧</h2>
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
            ステータス
          </label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as "all" | "completed" | "incomplete")}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
          >
            <option value="all">全て</option>
            <option value="completed">達成済み</option>
            <option value="incomplete">未達成</option>
          </select>
        </div>
        
        {/* ソート */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              ソート項目
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as "deadline" | "progress" | "targetAmount")}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
            >
              <option value="deadline">期限</option>
              <option value="progress">進捗率</option>
              <option value="targetAmount">目標金額</option>
            </select>
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              並び順
            </label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
            >
              <option value="asc">昇順</option>
              <option value="desc">降順</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
        </div>
      ) : sortedGoals.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 mb-4">対象の目標がありません</div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedGoals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysLeft = calculateDaysLeft(goal.deadline);
            const isCompleted = goal.achievedAt || (goal.currentAmount >= goal.targetAmount);
            
            return (
              <div 
                key={goal.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
                onClick={() => {
                  setEditingGoal(goal);
                  setIsEditModalOpen(true);
                }}
              >
                <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {goal.title}
                            {isCompleted && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                達成済み
                              </span>
                            )}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            {goal.currentAmount.toLocaleString()}円 / {goal.targetAmount.toLocaleString()}円
                          </p>
                        </div>
                        { goal.achievedAt ? (
                          <div className="text-right">
                            <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                              {progress.toFixed(1)}%
                            </div>
                            <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 mb-3">
                              達成日: {goal.achievedAt!.toDate().toLocaleDateString('ja-JP')}
                            </div>
                          </div>
                        ) : (
                          <div className="text-right">
                          <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                            {progress.toFixed(1)}%
                          </div>
                          <div className={`text-xs sm:text-sm ${
                            daysLeft < 0 
                              ? 'text-red-600 dark:text-red-400' 
                              : daysLeft <= 7 
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {daysLeft > 0 ? `残り${daysLeft}日` : daysLeft === 0 ? "今日まで" : `${Math.abs(daysLeft)}日超過`}
                          </div>
                        </div>
                        )}
                      </div>
                      
                      {/* プログレスバー */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      
                      {/* 期限表示 */}
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        期限: {goal.deadline.toDate().toLocaleDateString('ja-JP')}
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">新しい目標を作成</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <GoalForm onGoalsUpdate={handleGoalSubmitted} />
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {isEditModalOpen && editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingGoal(null);
          }}
          onUpdated={() => {
            fetchGoals();
            setIsEditModalOpen(false);
            setEditingGoal(null);
          }}
        />
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

export default GoalList; 