import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white">利用規約</h1>
        
        <div className="space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">第1条（適用）</h2>
            <p className="mb-3">
              本利用規約（以下「本規約」といいます）は、本サービス「もしも貯金」（以下「本サービス」といいます）の利用条件を定めるものです。
            </p>
            <p>
              ユーザーは、本規約に従って本サービスを利用するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">第2条（定義）</h2>
            <div className="space-y-2">
              <p><strong>1.</strong> 「本サービス」とは、ユーザーの貯金目標管理と進捗追跡を目的としたWebアプリケーションをいいます。</p>
              <p><strong>2.</strong> 「ユーザー」とは、本サービスを利用する個人をいいます。</p>
              <p><strong>3.</strong> 「コンテンツ」とは、本サービス上でユーザーが投稿、送信、保存する情報をいいます。</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">第3条（利用登録）</h2>
            <div className="space-y-2">
              <p><strong>1.</strong> 本サービスの利用には、有効なメールアドレスとパスワードによる登録が必要です。</p>
              <p><strong>2.</strong> ユーザーは、登録時に正確かつ完全な情報を提供するものとします。</p>
              <p><strong>3.</strong> 未成年者の利用については、保護者の同意を得てください。</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">第4条（利用者の責任）</h2>
            <div className="space-y-2">
              <p><strong>1.</strong> ユーザーは、自己の責任においてアカウント情報を管理するものとします。</p>
              <p><strong>2.</strong> ユーザーは、本サービスの利用により生じた損害について、当社は責任を負わないものとします。</p>
              <p><strong>3.</strong> ユーザーは、本サービスの利用にあたり、法令を遵守するものとします。</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">第5条（禁止事項）</h2>
            <p className="mb-3">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：</p>
            <div className="space-y-2 ml-4">
              <p>• 虚偽の情報の登録</p>
              <p>• 他者のアカウントの不正利用</p>
              <p>• システムに負荷をかける行為</p>
              <p>• 法令違反行為</p>
              <p>• 他のユーザーに迷惑をかける行為</p>
              <p>• 本サービスの運営を妨害する行為</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">第6条（サービスの変更・停止）</h2>
            <div className="space-y-2">
              <p><strong>1.</strong> 当社は、事前の通知なく、本サービスの内容を変更または停止することがあります。</p>
              <p><strong>2.</strong> 当社は、本サービスの変更または停止により生じた損害について、責任を負わないものとします。</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">第7条（免責事項）</h2>
            <div className="space-y-2">
              <p><strong>1.</strong> 当社は、本サービスの完全性、正確性、有用性を保証しません。</p>
              <p><strong>2.</strong> 当社は、データの損失、破損、漏洩について責任を負いません。</p>
              <p><strong>3.</strong> 当社は、本サービスの利用により生じた間接損害について責任を負いません。</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">第8条（知的財産権）</h2>
            <div className="space-y-2">
              <p><strong>1.</strong> 本サービスに関する知的財産権は、当社または当社にライセンスを許諾している者に帰属します。</p>
              <p><strong>2.</strong> ユーザーが投稿したコンテンツの著作権は、当該ユーザーに帰属します。</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">第9条（利用規約の変更）</h2>
            <div className="space-y-2">
              <p><strong>1.</strong> 当社は、必要に応じて本規約を変更することがあります。</p>
              <p><strong>2.</strong> 本規約の変更は、本サービス上での告知により効力を生じるものとします。</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">第10条（準拠法・管轄裁判所）</h2>
            <div className="space-y-2">
              <p><strong>1.</strong> 本規約の解釈にあたっては、日本法を準拠法とします。</p>
              <p><strong>2.</strong> 本規約に関して紛争が生じた場合には、東京地方裁判所を第一審の専属管轄裁判所とします。</p>
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

export default TermsOfService; 