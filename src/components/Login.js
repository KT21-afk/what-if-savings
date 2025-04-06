import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';

const Login = () => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("ログイン成功:", result.user);
    } catch (error) {
      console.error("ログイン失敗:", error);
    }
  };

  return (
    <div className="text-center mt-10">
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
        Googleでログイン
      </button>
    </div>
  );
};

export default Login;