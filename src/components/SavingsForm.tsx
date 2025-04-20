import { useState, FormEvent } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Savings } from "../type/Savings";

const SavingsForm: React.FC = () => {
  const [category, setCategory] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert("ログインが必要です");
      return;
    }

    const data: Savings = {
      userId: user.uid,
      category,
      itemName,
      amount: Number(amount),
      timestamp: Timestamp.now(),
      memo: memo || "",
    };

    try {
      await addDoc(collection(db, "savings"), data);
      setCategory("");
      setItemName("");
      setAmount("");
      setMemo("");
      setSuccess(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("登録失敗:", error.message);
      } else {
        console.log("登録失敗: 不明なエラー", error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">もしも貯金を登録</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="カテゴリ（任意）"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="我慢した物"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="金額（円）"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          placeholder="メモ（任意）"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button 
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
          >
          登録
        </button>
        {success && <p className="text-green-600 text-sm">登録に成功しました！</p>}
      </form>
    </div>
  );
};

export default SavingsForm;