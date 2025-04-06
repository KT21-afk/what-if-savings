import React, {useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./components/Login";

function App() {
  const [user, setUser] = useState(null);

  // ログアウト処理
  const handleLogout  = async () => {
    try {
      await signOut(auth);
      console.log("ログアウト成功");
    } catch (error) {
      console.log("ログアウト失敗", error);
    }
  };

  useEffect(() => {
    // ログイン状態の監視
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      {user ? (
        <div className="text-center mt-10">
        <p>こんにちは、{user.displayName} さん！</p>
        <img src={user.photoURL} alt="User Avatar" className="rounded-full w-16 h-16 mx-auto" />
        <p>{user.email}</p>

        {/* ログアウトボタン */}
        <button 
          onClick = {handleLogout}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
            ログアウト
          </button>
      </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;