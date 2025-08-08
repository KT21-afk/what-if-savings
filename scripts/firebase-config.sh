#!/bin/bash

# Firebase設定値を保存するスクリプト
# 初回設定時に実行して、設定値を保存しておく

echo "🔥 Firebase設定値を保存します..."

# 現在の.envファイルから設定値を読み取り
if [ -f .env ]; then
    echo "📝 現在の.envファイルから設定値を読み取ります..."
    
    # 設定値を変数に保存
    API_KEY=$(grep VITE_FIREBASE_APIKEY .env | cut -d'=' -f2)
    AUTH_DOMAIN=$(grep VITE_FIREBASE_AUTH_DOMAIN .env | cut -d'=' -f2)
    PROJECT_ID=$(grep VITE_FIREBASE_PROJECT_ID .env | cut -d'=' -f2)
    STORAGE_BUCKET=$(grep VITE_FIREBASE_STORAGE_BUCKET .env | cut -d'=' -f2)
    SENDER_ID=$(grep VITE_FIREBASE_MESSAGING_SENDER_ID .env | cut -d'=' -f2)
    APP_ID=$(grep VITE_FIREBASE_MESSAGING_APP_ID .env | cut -d'=' -f2)
    MEASUREMENT_ID=$(grep VITE_FIREBASE_MEASUREMENT_ID .env | cut -d'=' -f2)
    
    # 設定値をファイルに保存
    cat > scripts/firebase-config-backup.txt << EOF
# Firebase設定値のバックアップ
# このファイルは機密情報を含むため、Gitにコミットしないでください
VITE_FIREBASE_APIKEY=$API_KEY
VITE_FIREBASE_AUTH_DOMAIN=$AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=$PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=$SENDER_ID
VITE_FIREBASE_MESSAGING_APP_ID=$APP_ID
VITE_FIREBASE_MEASUREMENT_ID=$MEASUREMENT_ID
EOF
    
    echo "✅ Firebase設定値を保存しました: scripts/firebase-config-backup.txt"
    echo "⚠️  このファイルは機密情報を含むため、Gitにコミットしないでください"
else
    echo "❌ .envファイルが見つかりません"
    echo "   先に.envファイルを作成してFirebase設定を入力してください"
fi
