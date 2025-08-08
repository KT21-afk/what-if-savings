# もしも貯金アプリ

「もしも貯金」を記録・管理するWebアプリケーションです。

## 機能

- 目標の設定・管理
- 貯金記録の作成・編集・削除
- 進捗率の自動計算
- ユーザー認証（メール・Google）
- フィードバックシステム
- 管理者機能

## 技術スタック

- React + TypeScript
- Vite
- Firebase (Authentication, Firestore)
- Tailwind CSS

## セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/KT21-afk/what-if-savings.git
cd what-if-savings
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
```bash
# .env.exampleをコピー
cp .env.example .env

# .envファイルを編集してFirebase設定を入力
# Firebaseコンソールから取得した設定値を入力してください
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

## Firebase設定

Firebaseコンソールから以下の設定値を取得して`.env`ファイルに設定してください：

- `VITE_FIREBASE_APIKEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_MESSAGING_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## デプロイ

```bash
npm run build
npm run preview
```
