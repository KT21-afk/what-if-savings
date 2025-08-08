import { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Savings } from "../type/Savings";
import Toast from "./Toast";
import { useNumberInput } from "../hooks/useNumberInput";

interface EditSavingModalProps {
  saving: Savings & { id: string };
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted?: () => void;
}

const EditSavingModal: React.FC<EditSavingModalProps> = ({ saving, isOpen, onClose, onUpdated, onDeleted }) => {
  const [itemName, setItemName] = useState(saving.itemName || "");
  const [date, setDate] = useState(saving.timestamp ? saving.timestamp.toDate().toISOString().split('T')[0] : "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  // 金額入力用のカスタムフック
  const amountInput = useNumberInput(saving.amount?.toString() || "");

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));

  useEffect(() => {
    if (isOpen) {
      setItemName(saving.itemName || "");
      setDate(saving.timestamp ? saving.timestamp.toDate().toISOString().split('T')[0] : "");
      amountInput.setValue(saving.amount || 0);
    }
  }, [isOpen, saving]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      showToast("我慢した物を入力してください", "error");
      return;
    }

    const amount = amountInput.getValue();
    if (amount <= 0) {
      showToast("金額を入力してください", "error");
      return;
    }

    setLoading(true);
    try {
      const savingRef = doc(db, "savings", saving.id);
      await updateDoc(savingRef, {
        itemName: itemName.trim(),
        amount: amount,
        timestamp: date ? Timestamp.fromDate(new Date(date)) : saving.timestamp,
      });
      showToast("明細を更新しました！", "success");
      onUpdated();
    } catch (error: any) {
      console.error("明細更新エラー:", error);
      showToast("更新に失敗しました: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("本当にこの明細を削除しますか？")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "savings", saving.id));
      showToast("明細を削除しました", "success");
      onDeleted && onDeleted();
    } catch (error: any) {
      console.error("明細削除エラー:", error);
      showToast("削除に失敗しました: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">明細を編集</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            className="w-full border p-2 rounded"
            required
            placeholder="我慢した物"
          />
          <input
            type="text"
            value={amountInput.displayValue}
            onChange={amountInput.handleChange}
            className="w-full border p-2 rounded"
            required
            placeholder="金額"
          />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              {loading ? "更新中..." : "更新"}
            </button>
            <button
              type="button"
              className="flex-1 bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 border border-red-200 transition-colors"
              onClick={handleDelete}
              disabled={loading}
            >
              削除
            </button>
          </div>
        </form>
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

export default EditSavingModal; 