import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white">プライバシーポリシー</h1>
        
        <div className="space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">1. 基本方針</h2>
            <p className="mb-3">
              当アプリ「もしも貯金」（以下「本サービス」といいます）は、ユーザーの個人情報の保護を最重要事項と考えています。
            </p>
            <p>
              本プライバシーポリシーは、当社が収集・利用する個人情報の取り扱いについて定めるものです。
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">2. 収集する個人情報</h2>
            <p className="mb-3">当アプリで収集する個人情報は以下の通りです：</p>
            <div className="space-y-2 ml-4">
              <p>• <strong>認証情報</strong>：メールアドレス、パスワード（暗号化して保存）</p>
              <p>• <strong>プロフィール情報</strong>：表示名</p>
              <p>• <strong>貯金データ</strong>：貯金目標、貯金記録、進捗状況</p>
              <p>• <strong>フィードバック</strong>：改善要望、投票情報</p>
              <p>• <strong>利用ログ</strong>：アクセス日時、利用状況（匿名化）</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">3. 個人情報の利用目的</h2>
            <p className="mb-3">収集した個人情報は、以下の目的で利用します：</p>
            <div className="space-y-2 ml-4">
              <p>• ユーザー認証およびアカウント管理</p>
              <p>• 貯金目標の設定・管理・表示</p>
              <p>• 進捗状況の計算・表示</p>
              <p>• 改善要望の管理・分析</p>
              <p>• サービスの品質向上</p>
              <p>• お問い合わせへの対応</p>
              <p>• セキュリティの確保</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">4. 個人情報の管理・保護</h2>
            <div className="space-y-3">
              <p><strong>セキュリティ対策</strong></p>
              <div className="space-y-2 ml-4">
                <p>• Firebase（Google）のセキュアなサーバーで管理</p>
                <p>• 暗号化通信（HTTPS）を使用</p>
                <p>• アクセス制御による保護</p>
                <p>• 定期的なセキュリティ監査</p>
              </div>
              
              <p><strong>データ保持期間</strong></p>
              <p className="ml-4">アカウント削除まで、またはユーザーからの削除要求まで</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">5. 第三者提供</h2>
            <p className="mb-3">以下の場合を除き、個人情報を第三者に提供しません：</p>
            <div className="space-y-2 ml-4">
              <p>• ユーザーの事前の同意がある場合</p>
              <p>• 法令に基づく場合</p>
              <p>• 人の生命、身体または財産の保護のために必要な場合</p>
              <p>• サービスの提供に必要な範囲での委託（委託先は適切に管理）</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">6. ユーザーの権利</h2>
            <p className="mb-3">ユーザーは以下の権利を有します：</p>
            <div className="space-y-2 ml-4">
              <p>• 個人情報の開示請求</p>
              <p>• 個人情報の訂正・追加・削除請求</p>
              <p>• 個人情報の利用停止・消去請求</p>
              <p>• アカウントの削除</p>
              <p>• データのエクスポート</p>
            </div>
            <p className="mt-3 text-sm">
              これらの請求については、お問い合わせフォームまたはメールにて受け付けます。
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">7. Cookie・トラッキング技術</h2>
            <div className="space-y-3">
              <p><strong>Cookieの使用</strong></p>
              <div className="space-y-2 ml-4">
                <p>• 認証セッション管理のためのCookieを使用</p>
                <p>• ユーザー設定の保存</p>
                <p>• セキュリティ向上のため</p>
              </div>
              
              <p><strong>トラッキングについて</strong></p>
              <div className="space-y-2 ml-4">
                <p>• 広告トラッキングは行っていません</p>
                <p>• 分析目的での匿名データ収集は最小限</p>
                <p>• 個人を特定する情報は含まれません</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">8. 未成年者の個人情報</h2>
            <div className="space-y-2">
              <p>• 未成年者の利用については、保護者の同意を得てください</p>
              <p>• 保護者からの個人情報の開示・訂正・削除請求に応じます</p>
              <p>• 未成年者の個人情報は、特に慎重に取り扱います</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">9. プライバシーポリシーの変更</h2>
            <div className="space-y-2">
              <p>• 本ポリシーの内容は、法令の変更やサービスの改善により変更される場合があります</p>
              <p>• 重要な変更がある場合は、事前に通知します</p>
              <p>• 変更後も本サービスを利用することで、変更に同意したものとみなします</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">10. お問い合わせ</h2>
            <p className="mb-3">個人情報の取り扱いに関するお問い合わせは、以下までお願いします：</p>
            <div className="ml-4">
              <p>• アプリ内の「改善要望」機能をご利用ください</p>
              <p>• 緊急の場合は、アプリ内の「設定」からお問い合わせください</p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              制定日：2025年8月5日<br />
              最終更新日：2025年8月5日
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 