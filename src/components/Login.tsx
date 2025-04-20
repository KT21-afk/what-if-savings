import { signInWithPopup, UserCredential } from 'firebase/auth';
import { auth, provider } from '../firebase';

const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      console.log("ログイン成功:", result.user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("ログイン失敗:", error.message);
      } else {
        console.error("ログイン失敗: 不明なエラー", error);
      }
      
    }
  };

  return (
    <div className="text-center mt-10">
      <button 
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Googleでログイン
      </button>
    </div>
  );
};

export default Login;