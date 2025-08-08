import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp, updateDoc, doc, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Goal } from "../type/Goal";
import Toast from "./Toast";
import EditGoalModal from "./EditGoalModal";
import GoalForm from "./GoalForm";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  const [isReordered, setIsReordered] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "incomplete">("all");
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
        where("userId", "==", user.uid),
        orderBy("order", "asc")
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
    setIsReordered(false); // データ再取得時は並び替えフラグをリセット
  }, [updateTrigger]);

  function DraggableGoal({goal, children}: {goal: Goal, children: React.ReactNode}) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: goal.id!});
    const [isTouching, setIsTouching] = useState(false);
    const [isDraggingStarted, setIsDraggingStarted] = useState(false);
    const [mouseDownTime, setMouseDownTime] = useState(0);
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // ドラッグが開始されていない場合のみクリックイベントを処理
      if (!isDragging && !isDraggingStarted) {
        setEditingGoal(goal);
        setIsEditModalOpen(true);
      }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      // マウスダウン時にドラッグ開始フラグをリセット
      setIsDraggingStarted(false);
      setMouseDownTime(Date.now());
    };

    const handleMouseUp = (e: React.MouseEvent) => {
      // マウスアップ時に短いクリックかどうかを判定
      const clickDuration = Date.now() - mouseDownTime;
      if (clickDuration < 200 && !isDraggingStarted) {
        // 短いクリックの場合はモーダルを開く
        setEditingGoal(goal);
        setIsEditModalOpen(true);
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      // マウスが移動した場合、ドラッグ開始とみなす
      if (e.movementX !== 0 || e.movementY !== 0) {
        setIsDraggingStarted(true);
      }
    };

    const handleTouchStart = () => {
      setIsTouching(true);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      e.stopPropagation();
      if (isTouching && !isDragging) {
        // タッチが短時間（ドラッグでない）の場合のみモーダルを開く
        setTimeout(() => {
          if (!isDragging) {
            setEditingGoal(goal);
            setIsEditModalOpen(true);
          }
        }, 150);
      }
      setIsTouching(false);
    };

    return (
      <div 
        ref={setNodeRef} 
        style={style}
        className="relative"
      >
        {/* ドラッグ可能なコンテンツ領域 */}
        <div
          {...attributes} 
          {...listeners}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="cursor-pointer"
          style={{ touchAction: 'none' }}
        >
          {children}
        </div>
      </div>
    );
  }

  const handleDragEnd = async (event: any) => {
    const {active, over} = event;
    if (!over || active.id === over.id) return;
    const oldIndex = goals.findIndex(g => g.id === active.id);
    const newIndex = goals.findIndex(g => g.id === over.id);
    const newGoals = arrayMove(goals, oldIndex, newIndex);
    
    // 並び替えフラグを設定
    setIsReordered(true);
    
    // ローカル状態を即座に更新
    setGoals(newGoals);
    
    // Firestoreのorderを更新（バックグラウンドで実行）
    try {
      for (let i = 0; i < newGoals.length; i++) {
        if (newGoals[i].order !== i) {
          await updateDoc(doc(db, "goals", newGoals[i].id!), { order: i });
        }
      }
    } catch (error) {
      console.error("並び替えの保存に失敗しました:", error);
      showToast("並び替えの保存に失敗しました", "error");
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (filterStatus === "all") return true;
    if (filterStatus === "completed") return goal.achievedAt;
    if (filterStatus === "incomplete") return !goal.achievedAt;
    return true;
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
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 mb-4">対象の目標がありません</div>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredGoals.map(goal => goal.id!)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 pr-5">
              {filteredGoals.map((goal) => {
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                const daysLeft = calculateDaysLeft(goal.deadline);
                const isCompleted = goal.achievedAt || (goal.currentAmount >= goal.targetAmount);
                
                return (
                  <DraggableGoal key={goal.id} goal={goal}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
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
                  </DraggableGoal>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
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