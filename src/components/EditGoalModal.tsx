import { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Goal } from "../type/Goal";
import { Savings } from "../type/Savings";
import Toast from "./Toast";
import EditSavingModal from "./EditSavingModal";
import { useNumberInput } from "../hooks/useNumberInput";

interface EditGoalModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const EditGoalModal: React.FC<EditGoalModalProps> = ({ goal, isOpen, onClose, onUpdated }) => {
  const [title, setTitle] = useState(goal.title);
  const [deadline, setDeadline] = useState(goal.deadline.toDate().toISOString().split('T')[0]);
  const [savings, setSavings] = useState<(Savings & { id: string })[]>([]);
  const [editSaving, setEditSaving] = useState<(Savings & { id: string }) | null>(null);
  const [isEditSavingOpen, setIsEditSavingOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  // 金額入力用のカスタムフック
  const targetAmountInput = useNumberInput(goal.targetAmount.toString());

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));


  const fetchSavings = async () => {
    try {
      const q = query(collection(db, "savings"), where("goalId", "==", goal.id));
      const querySnapshot = await getDocs(q);
      const savingsData: (Savings & { id: string })[] = [];
      querySnapshot.forEach((doc) => {
        savingsData.push({ id: doc.id, ...doc.data() } as (Savings & { id: string }));
      });
      setSavings(savingsData);
    } catch (error) {
      console.error("明細取得エラー:", error);
    }
  };

  // 明細編集後にcurrentAmountを再計算
  const recalcCurrentAmount = async () => {
    if (!goal.id) return;
    await fetchSavings();
    const q = query(collection(db, "savings"), where("goalId", "==", goal.id));
    const querySnapshot = await getDocs(q);
    let sum = 0;
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data() as Savings;
      sum += data.amount;
    });
    // 目標達成判定
    const isAchieved = sum >= goal.targetAmount;
    const goalRef = doc(db, "goals", goal.id);
    let updateObj: any = {
      currentAmount: sum,
      updatedAt: Timestamp.now(),
    };
    if (isAchieved && !goal.achievedAt) {
      updateObj.achievedAt = Timestamp.now();
      showToast("🎉 目標達成おめでとうございます！", "success");
    } else if (!isAchieved && goal.achievedAt) {
      updateObj.achievedAt = null;
    }
    await updateDoc(goalRef, updateObj);
    onUpdated();
  };

  useEffect(() => {
    if (isOpen) {
      setTitle(goal.title);
      setDeadline(goal.deadline.toDate().toISOString().split('T')[0]);
      targetAmountInput.setValue(goal.targetAmount);
      fetchSavings();
    }
  }, [isOpen, goal]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("タイトルを入力してください", "error");
      return;
    }

    const targetAmount = targetAmountInput.getValue();
    if (targetAmount <= 0) {
      showToast("目標金額を入力してください", "error");
      return;
    }

    setLoading(true);
    try {
      const goalRef = doc(db, "goals", goal.id!);
      await updateDoc(goalRef, {
        title: title.trim(),
        targetAmount: targetAmount,
        deadline: Timestamp.fromDate(new Date(deadline)),
        updatedAt: Timestamp.now(),
        ...(goal.currentAmount >= targetAmount && !goal.achievedAt ? { achievedAt: Timestamp.now() } :
          goal.currentAmount < targetAmount && goal.achievedAt ? { achievedAt: null } : {})
      });
      // 進捗率・達成判定を再計算
      await recalcCurrentAmount();
      showToast("目標を更新しました！", "success");
      onUpdated();
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error: any) {
      showToast("更新に失敗しました: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("この目標を削除しますか？関連するもしも貯金の記録も削除されます。")) {
      return;
    }

    setLoading(true);
    try {
      // 関連するもしも貯金を削除
      for (const saving of savings) {
        await deleteDoc(doc(db, "savings", saving.id!));
      }
      
      // 目標を削除
      await deleteDoc(doc(db, "goals", goal.id!));
      showToast("目標を削除しました", "success");
      onUpdated();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      showToast("削除に失敗しました: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">目標を編集</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              タイトル</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
              required
              placeholder="タイトル"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              目標金額</label>
            <input
              type="text"
              value={targetAmountInput.displayValue}
              onChange={targetAmountInput.handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
              required
              placeholder="目標金額"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              期限</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              disabled={loading}
            >
              {loading ? "更新中..." : "更新"}
            </button>
            <button
              type="button"
              className="flex-1 bg-red-100 text-red-600 py-3 px-4 rounded-lg font-medium hover:bg-red-200 border border-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
              onClick={handleDelete}
              disabled={loading}
            >
              削除
            </button>
          </div>
        </form>
        {/* もしも貯金明細一覧 */}
        <div className="mt-8">
          <h3 className="font-semibold mb-2 text-base">もしも貯金 明細一覧</h3>
          {savings.length === 0 ? (
            <p className="text-sm text-gray-500">この目標に紐づく明細はありません</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {savings.map(saving => (
                <div
                  key={saving.id}
                  className="bg-white rounded-lg shadow-md p-4 border cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => { setEditSaving(saving); setIsEditSavingOpen(true); }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {saving.timestamp && saving.timestamp.toDate().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </span>
                    <span className="text-sm font-bold text-blue-500 dark:text-blue-300">
                      {saving.amount !== undefined && `${saving.amount.toLocaleString()}円`}
                    </span>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-base mb-1">
                    {saving.itemName || <span className="italic text-gray-400">（未入力）</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 明細編集モーダル */}
        {editSaving && (
          <EditSavingModal
            saving={editSaving}
            isOpen={isEditSavingOpen}
            onClose={() => { setIsEditSavingOpen(false); setEditSaving(null); fetchSavings(); }}
            onUpdated={async () => { await recalcCurrentAmount(); fetchSavings(); }}
            onDeleted={async () => { await recalcCurrentAmount(); fetchSavings(); }}
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
    </div>
  );
};

export default EditGoalModal; 