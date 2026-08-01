# CanWeEatOut（今日、外食していい？）

食費の残予算と直近の外食頻度から、外食してよいかを判断する家族用Webアプリ。

## セットアップ

```bash
npm install
cp .env.example .env
# .env の DATABASE_URL を Neon の接続文字列に書き換える
npm run migrate   # テーブル作成
npm run dev        # http://localhost:3000
```

## デプロイ（Render）

1. Neonでデータベースを作成し、接続文字列を取得
2. Renderで新規Web Serviceを作成し、このリポジトリを接続
   - Build Command: `npm install`
   - Start Command: `npm start`
   - 環境変数 `DATABASE_URL` にNeonの接続文字列を設定
3. 初回のみ `npm run migrate` をローカルまたはRenderのShellから実行してテーブルを作成

## ドキュメント
- [要件定義](外食判断アプリ-要件定義.md)
- [DBスキーマ設計](docs/db-schema.md)
- [ディレクトリ構成・API設計](docs/architecture.md)
