import { useState, FormEvent } from "react";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Goal } from "../type/Goal";
import Toast from "./Toast";
import { useNumberInput } from "../hooks/useNumberInput";

interface GoalFormProps {
  onGoalsUpdate?: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ onGoalsUpdate }) => {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
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

    // 既存goalsの最大orderを取得
    let maxOrder = -1;
    try {
      const q = query(collection(db, "goals"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
      >
        目標を設定
      </button>
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={3000}
      />
    </form>
  );
};

export default GoalForm; 