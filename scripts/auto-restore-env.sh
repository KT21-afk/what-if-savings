#!/bin/bash

# pull後に自動で.envファイルを復元するスクリプト

# .envファイルが存在しない場合のみ復元
if [ ! -f .env ]; then
    echo "🔄 .envファイルを自動復元しています..."
    
    # バックアップファイルが存在する場合（推奨）
    if [ -f "scripts/firebase-config-backup.txt" ]; then
        cp scripts/firebase-config-backup.txt .env
        echo "✅ .envファイルをバックアップから復元しました"
        echo "🎉 Firebase設定が自動で復元されました！"
    # .env.exampleが存在する場合（フォールバック）
    elif [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .envファイルを.env.exampleから復元しました"
        echo "⚠️  Firebase設定値を.envファイルに手動で入力してください"
        echo "   または、scripts/firebase-config.shを実行してバックアップを作成してください"
    else
        echo "❌ 復元用のファイルが見つかりません"
        echo "   手動で.envファイルを作成してください"
    fi
fi
