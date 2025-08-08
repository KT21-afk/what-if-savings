import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { useUser } from "./hooks/useUser";
import SavingsForm from "./components/SavingsForm";
import GoalForm from "./components/GoalForm";
import GoalList from "./components/GoalList";
import FeedbackList from "./components/FeedbackList";
import UserSettings from "./components/UserSettings";
import FeedbackAdmin from "./components/FeedbackAdmin";
import UserManagement from "./components/UserManagement";
import Login from "./components/Login";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";

const App: React.FC = () => {
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState("savings");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [goalsUpdateTrigger, setGoalsUpdateTrigger] = useState(0);
  const [feedbackUpdateTrigger, setFeedbackUpdateTrigger] = useState(0);

  const isAdmin = user?.role === "admin";

  // 目標データの更新をトリガー
  const triggerGoalsUpdate = () => {
    setGoalsUpdateTrigger(prev => prev + 1);
  };

  // フィードバックデータの更新をトリガー
  const triggerFeedbackUpdate = () => {
    setFeedbackUpdateTrigger(prev => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setActiveTab("savings");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  // メニュー外クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white flex flex-col">
      {user ? (
        <>
          {/* ヘッダー */}
          <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-gray-200 dark:border-neutral-700">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">もしも貯金</h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    こんにちは、{user.displayName} さん！
                  </p>
                  {isAdmin && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      管理者
                    </span>
                  )}
                </div>
                
                {/* ハンバーガーメニュー */}
                <div className="relative menu-container inline-block">
                  <span
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors inline-flex items-center cursor-pointer"
                    aria-label="メニュー"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </span>
                  
                  {/* ドロップダウンメニュー */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 z-50">
                      <div className="py-1">
                        <span
                          onClick={() => { setActiveTab("userSettings"); setIsMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors inline-block cursor-pointer"
                        >設定</span>
                        <span
                          onClick={() => { setActiveTab("feedback"); setIsMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors inline-block cursor-pointer"
                        >改善要望</span>
                        {isAdmin && (
                          <>
                            <span
                              onClick={() => { setActiveTab("feedbackAdmin"); setIsMenuOpen(false); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors inline-block cursor-pointer"
                            >要望管理</span>
                            <span
                              onClick={() => { setActiveTab("userManagement"); setIsMenuOpen(false); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors inline-block cursor-pointer"
                            >ユーザー管理</span>
                          </>
                        )}
                        <hr className="my-1 border-gray-200 dark:border-neutral-700" />
                        <span
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors inline-block cursor-pointer"
                        >ログアウト</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* メインコンテンツ */}
          <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
            {/* タブ切り替え */}
            <div className="flex border-b border-gray-300 mb-6 sm:mb-8 justify-center">
              <button
                onClick={() => setActiveTab("savings")}
                className={`py-3 px-4 sm:px-6 text-sm sm:text-base font-medium transition-colors ${
                  activeTab === "savings"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                もしも貯金
              </button>
        <button 
                onClick={() => setActiveTab("goalList")}
                className={`py-3 px-4 sm:px-6 text-sm sm:text-base font-medium transition-colors ${
                  activeTab === "goalList"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                目標一覧
          </button>
      </div>

            {/* タブコンテンツ */}
            <div className="flex justify-center w-full">
              <div className="w-full max-w-2xl">
                {activeTab === "savings" && <SavingsForm onGoalsUpdate={triggerGoalsUpdate} />}
                {activeTab === "goals" && <GoalForm onGoalsUpdate={triggerGoalsUpdate} />}
                {activeTab === "goalList" && <GoalList updateTrigger={goalsUpdateTrigger} />}
                {activeTab === "feedback" && <FeedbackList updateTrigger={feedbackUpdateTrigger} onFeedbackUpdate={triggerFeedbackUpdate} />}
                {activeTab === "userSettings" && <UserSettings />}
                {activeTab === "feedbackAdmin" && isAdmin && <FeedbackAdmin updateTrigger={feedbackUpdateTrigger} />}
                {activeTab === "userManagement" && isAdmin && <UserManagement updateTrigger={feedbackUpdateTrigger} />}
                {activeTab === "terms" && <TermsOfService />}
                {activeTab === "privacy" && <PrivacyPolicy />}
              </div>
            </div>
          </main>

          {/* フッター */}
          <footer className="bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 py-6">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  © 2025 もしも貯金. All rights reserved.
                </div>
                <div className="flex space-x-6">
                  <span
                    onClick={() => setActiveTab("terms")}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    利用規約
                  </span>
                  <span
                    onClick={() => setActiveTab("privacy")}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    プライバシーポリシー
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;