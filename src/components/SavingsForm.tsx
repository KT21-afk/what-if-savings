import { useState, useEffect, FormEvent } from "react";
import { collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Goal } from "../type/Goal";
import Toast from "./Toast";
import { useNumberInput } from "../hooks/useNumberInput";
import { LIMITS } from "../constants/limits";
import { sanitizeInput, limitLength } from "../utils/sanitize";
import { VALIDATION_RULES } from "../constants/validation";

interface SavingsFormProps {
  onGoalsUpdate?: () => void;
}

const SavingsForm: React.FC<SavingsFormProps> = ({ onGoalsUpdate }) => {
  const [itemName, setItemName] = useState("");
  const [goalId, setGoalId] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedGoalSavingsCount, setSelectedGoalSavingsCount] = useState(0);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  // 金額入力用のカスタムフック
  const amountInput = useNumberInput("");

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));

  // 選択された目標の明細数を取得
  const fetchSelectedGoalSavingsCount = async (goalId: string) => {
    try {
      const goalSavingsQuery = query(
        collection(db, "savings"),
        where("goalId", "==", goalId)
      );
      const goalSavingsSnapshot = await getDocs(goalSavingsQuery);
      setSelectedGoalSavingsCount(goalSavingsSnapshot.size);
    } catch (error) {
      console.error("明細数取得エラー:", error);
    }
  };

  // 目標一覧を取得
  const fetchGoals = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        showToast("ログインが必要です", "error");
        return;
      }
      const q = query(collection(db, "goals"), where("userId", "==", user.uid));
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
      setLoadingGoals(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!itemName.trim() || !goalId) {
      showToast("全ての項目を入力してください", "error");
      return;
    }

    // 入力値の検証とサニタイズ
    const sanitizedItemName = sanitizeInput(limitLength(itemName.trim(), VALIDATION_RULES.SAVING_ITEM_NAME.MAX_LENGTH));

    if (sanitizedItemName.length < VALIDATION_RULES.SAVING_ITEM_NAME.MIN_LENGTH) {
      showToast("我慢した物を入力してください", "error");
      return;
    }

    if (!VALIDATION_RULES.SAVING_ITEM_NAME.PATTERN.test(sanitizedItemName)) {
      showToast("我慢した物に改行文字は使用できません", "error");
      return;
    }

    const amount = amountInput.getValue();
    if (amount < VALIDATION_RULES.SAVING_AMOUNT.MIN || amount > VALIDATION_RULES.SAVING_AMOUNT.MAX) {
      showToast(`金額は${VALIDATION_RULES.SAVING_AMOUNT.MIN}円以上${VALIDATION_RULES.SAVING_AMOUNT.MAX.toLocaleString()}円以下で入力してください`, "error");
      return;
    }
    setLoading(true);
    let achieved = false;
    try {
      const user = auth.currentUser;
      if (!user) {
        showToast("ログインが必要です", "error");
        return;
      }

      // 選択された目標の明細数をチェック
      const goalSavingsQuery = query(
        collection(db, "savings"),
        where("goalId", "==", goalId)
      );
      const goalSavingsSnapshot = await getDocs(goalSavingsQuery);
      
      if (goalSavingsSnapshot.size >= LIMITS.MAX_SAVINGS_PER_GOAL) {
        showToast(`この目標の明細上限（${LIMITS.MAX_SAVINGS_PER_GOAL}件）に達しています`, "error");
        return;
      }

      // もしも貯金を登録
      const savingData = {
      userId: user.uid,
        itemName: sanitizedItemName,
        amount: amount,
        goalId: goalId,
      timestamp: Timestamp.now(),
      };

      await addDoc(collection(db, "savings"), savingData);

      // 選択された目標の進捗を更新
      const selectedGoal = goals.find(g => g.id === goalId);
      if (selectedGoal) {
        const goalRef = doc(db, "goals", goalId);
        const newCurrentAmount = selectedGoal.currentAmount + amount;
        
        // 目標達成判定
        const isAchieved = newCurrentAmount >= selectedGoal.targetAmount && !selectedGoal.achievedAt;

        await updateDoc(goalRef, {
          currentAmount: newCurrentAmount,
          updatedAt: Timestamp.now(),
          ...(isAchieved ? { achievedAt: Timestamp.now() } : {})
        });
        achieved = isAchieved;
      }

      // トースト表示
      if (achieved) {
        showToast("🎉 目標達成おめでとうございます！", "success");
      } else {
        showToast("登録に成功しました！", "success");
      }

      // フォームをクリア
      setItemName("");
      amountInput.setValue(0);
      setGoalId("");
      setSelectedGoalSavingsCount(0);
      onGoalsUpdate?.();
    } catch (error: unknown) {
      console.error("もしも貯金登録エラー:", error);
      if (error instanceof Error) {
        showToast(`登録に失敗しました: ${error.message}`, "error");
      } else {
        showToast("登録に失敗しました: 不明なエラーが発生しました", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">貯金を登録</h2>
      <form onSubmit={handleSubmit} className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="saving-item">我慢した物</label>
        <input
            id="saving-item"
          type="text"
            placeholder="例：カフェ"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
          required
        />
        </div>
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="saving-amount">金額（円）</label>
        <input
            id="saving-amount"
            type="text"
            placeholder="例：10,000"
            value={amountInput.displayValue}
            onChange={amountInput.handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
          required
        />
        </div>
        
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="saving-goal">目標を選択</label>
          <select
            id="saving-goal"
            value={goalId}
            onChange={(e) => {
              setGoalId(e.target.value);
              if (e.target.value) {
                fetchSelectedGoalSavingsCount(e.target.value);
              } else {
                setSelectedGoalSavingsCount(0);
              }
            }}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">目標を選択</option>
            {loadingGoals ? (
              <option disabled>目標を読み込み中...</option>
            ) : goals.length === 0 ? (
              <option disabled>目標が設定されていません</option>
            ) : (
              goals.filter((goal) => !goal.achievedAt).map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title} (目標: {goal.targetAmount.toLocaleString()}円)
                </option>
              ))
            )}
          </select>
          {goalId && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                明細数: {selectedGoalSavingsCount} / {LIMITS.MAX_SAVINGS_PER_GOAL} 件
              </p>
              {selectedGoalSavingsCount >= LIMITS.MAX_SAVINGS_PER_GOAL && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  明細上限に達しています
                </p>
              )}
            </div>
          )}
        </div>
        <button 
          type="submit"
          disabled={loading || Boolean(goalId && selectedGoalSavingsCount >= LIMITS.MAX_SAVINGS_PER_GOAL)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
          >
          {loading ? "登録中..." : (goalId && selectedGoalSavingsCount >= LIMITS.MAX_SAVINGS_PER_GOAL) ? "明細上限に達しています" : "登録"}
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

export default SavingsForm;