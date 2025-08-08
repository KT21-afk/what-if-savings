import { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "../type/User";
import Toast from "./Toast";

interface UserManagementProps {
  updateTrigger?: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ updateTrigger = 0 }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    uid: "",
    displayName: "",
    email: "",
    role: "user" as "user" | "admin"
  });
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(usersData);
    } catch (error) {
      console.error("ユーザー取得エラー:", error);
      showToast("ユーザーの取得に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [updateTrigger]);

  const handleRoleChange = async (user: User, newRole: "user" | "admin") => {
    try {
      const userRef = doc(db, "users", user.id!);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: Timestamp.now()
      });
      
      showToast(`ユーザー「${user.displayName}」の権限を「${newRole === "admin" ? "管理者" : "一般ユーザー"}」に変更しました`, "success");
      fetchUsers();
    } catch (error) {
      console.error("権限変更エラー:", error);
      showToast("権限の変更に失敗しました", "error");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.uid.trim() || !newUser.displayName.trim() || !newUser.email.trim()) {
      showToast("全ての項目を入力してください", "error");
      return;
    }

    try {
      const userData: Omit<User, "id"> = {
        uid: newUser.uid,
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, "users", newUser.uid), userData);
      
      showToast(`ユーザー「${newUser.displayName}」を作成しました`, "success");
      setNewUser({ uid: "", displayName: "", email: "", role: "user" });
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("ユーザー作成エラー:", error);
      showToast("ユーザーの作成に失敗しました", "error");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto p-4">
        <h2 className="text-lg font-semibold mb-4">ユーザー管理</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">ユーザー管理</h2>
      </div>
      
      {users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">ユーザーが登録されていません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-md p-4 border">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  user.role === "admin" 
                    ? "bg-red-100 text-red-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {user.role === "admin" ? "管理者" : "一般ユーザー"}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 mb-3">
                登録日: {user.createdAt.toDate().toLocaleDateString('ja-JP')}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleRoleChange(user, "user")}
                  disabled={user.role === "user"}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    user.role === "user"
                      ? "bg-gray-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  } disabled:opacity-50`}
                >
                  一般ユーザー
                </button>
                <button
                  onClick={() => handleRoleChange(user, "admin")}
                  disabled={user.role === "admin"}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    user.role === "admin"
                      ? "bg-red-500 text-white"
                      : "bg-red-100 hover:bg-red-200 text-red-800"
                  } disabled:opacity-50`}
                >
                  管理者
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新規ユーザー作成モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">新規ユーザー作成</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UID
                </label>
                <input
                  type="text"
                  value={newUser.uid}
                  onChange={e => setNewUser(prev => ({ ...prev, uid: e.target.value }))}
                  className="w-full border p-2 rounded"
                  required
                  placeholder="Firebase AuthのUID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  表示名
                </label>
                <input
                  type="text"
                  value={newUser.displayName}
                  onChange={e => setNewUser(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full border p-2 rounded"
                  required
                  placeholder="表示名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border p-2 rounded"
                  required
                  placeholder="メールアドレス"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  権限
                </label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value as "user" | "admin" }))}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="user">一般ユーザー</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
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

export default UserManagement; 