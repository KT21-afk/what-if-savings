import { useState, FormEvent, useEffect } from "react";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Goal } from "../type/Goal";
import Toast from "./Toast";
import { useNumberInput } from "../hooks/useNumberInput";
import { LIMITS } from "../constants/limits";

interface GoalFormProps {
  onGoalsUpdate?: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ onGoalsUpdate }) => {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [userGoalsCount, setUserGoalsCount] = useState(0);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  // 金額入力用のカスタムフック
  const targetAmountInput = useNumberInput("");
  const currentAmountInput = useNumberInput("0");

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // ユーザーの目標数を取得
  const fetchUserGoalsCount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(collection(db, "goals"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      setUserGoalsCount(querySnapshot.size);
    } catch (error) {
      console.error("目標数取得エラー:", error);
    }
  };

  // コンポーネントマウント時に目標数を取得
  useEffect(() => {
    fetchUserGoalsCount();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("目標のタイトルを入力してください", "error");
      return;
    }

    const targetAmount = targetAmountInput.getValue();
    if (targetAmount <= 0) {
      showToast("目標金額を入力してください", "error");
      return;
    }

    const currentAmount = currentAmountInput.getValue();
    if (currentAmount < 0) {
      showToast("現在の貯金額は0以上で入力してください", "error");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showToast("ログインが必要です", "error");
      return;
    }

    // 既存goalsの最大orderを取得と目標数チェック
    let maxOrder = -1;
    let currentGoalsCount = 0;
    try {
      const q = query(collection(db, "goals"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      currentGoalsCount = querySnapshot.size;
      
      // 目標数制限チェック
      if (currentGoalsCount >= LIMITS.MAX_GOALS_PER_USER) {
        showToast(`目標の登録数が上限（${LIMITS.MAX_GOALS_PER_USER}個）に達しています`, "error");
        return;
      }
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Goal;
        if (typeof data.order === "number" && data.order > maxOrder) {
          maxOrder = data.order;
        }
      });
    } catch (error) {
      console.error("order取得エラー:", error);
    }

    const data: Goal = {
      userId: user.uid,
      title,
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      order: maxOrder + 1,
    };

    try {
      await addDoc(collection(db, "goals"), data);
      // 成功トーストを表示
      showToast("目標金額を設定しました！", "success");
      // フォームをクリア
      setTitle("");
      targetAmountInput.setValue(0);
      setUserGoalsCount(prev => prev + 1);
      currentAmountInput.setValue(0);
      setDeadline("");
      onGoalsUpdate?.();
    } catch (error: unknown) {
      console.error("目標設定エラー:", error);
      if (error instanceof Error) {
        showToast(`目標設定失敗: ${error.message}`, "error");
      } else {
        showToast("目標設定失敗: 不明なエラーが発生しました", "error");
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">目標を設定</h2>
      
      {/* 目標数状況表示 */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          目標数: {userGoalsCount} / {LIMITS.MAX_GOALS_PER_USER} 個
        </p>
        {userGoalsCount >= LIMITS.MAX_GOALS_PER_USER && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            目標数上限に達しています
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 space-y-4">
      <label className="block text-sm text-gray-600 mb-1" htmlFor="goal-title">目標のタイトル</label>
      <input
        id="goal-title"
        type="text"
        placeholder="例：海外旅行"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <label className="block text-sm text-gray-600 mb-1" htmlFor="goal-amount">目標金額（円）</label>
      <input
        id="goal-amount"
        type="text"
        placeholder="例：100,000"
        value={targetAmountInput.displayValue}
        onChange={targetAmountInput.handleChange}
        className="w-full border p-2 rounded"
        required
      />
      <label className="block text-sm text-gray-600 mb-1" htmlFor="goal-current">現在の貯金額（円）</label>
      <input
        id="goal-current"
        type="text"
        placeholder="例：10,000"
        value={currentAmountInput.displayValue}
        onChange={currentAmountInput.handleChange}
        className="w-full border p-2 rounded"
      />
      <label className="block text-sm text-gray-600 mb-1" htmlFor="goal-deadline">期限</label>
      <input
        id="goal-deadline"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button 
        type="submit"
        disabled={userGoalsCount >= LIMITS.MAX_GOALS_PER_USER}
        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
      >
        {userGoalsCount >= LIMITS.MAX_GOALS_PER_USER ? "目標数上限に達しています" : "目標を設定"}
      </button>
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={3000}
      />
      </form>
    </div>
  );
};

export default GoalForm; 