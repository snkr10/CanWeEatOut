# CanWeEatOut ディレクトリ構成・API設計

## ディレクトリ構成

```
CanWeEatOut/
├─ docs/
│  ├─ db-schema.md
│  └─ architecture.md
├─ migrations/
│  └─ 001_init.sql            # docs/db-schema.md のCREATE TABLE一式
├─ src/
│  ├─ server.js                # エントリポイント(Express起動)
│  ├─ db.js                    # Neon(Postgres)接続プール
│  ├─ routes/
│  │  ├─ dashboard.js          # GET /api/dashboard
│  │  ├─ budgets.js            # /api/budgets
│  │  ├─ shopping.js           # /api/shopping
│  │  ├─ dining.js             # /api/dining
│  │  ├─ settings.js           # /api/settings
│  │  └─ history.js            # /api/history
│  └─ services/
│     └─ judgement.js          # 確保金・外食可能回数・判定メッセージの計算ロジック
├─ public/                     # 静的フロントエンド(素のHTML/CSS/JS)
│  ├─ index.html                # トップ画面
│  ├─ shopping.html             # 買い出し記録 入力・編集・削除
│  ├─ dining.html                # 外食記録 入力・編集・削除
│  ├─ budget.html                 # 食費予算 設定
│  ├─ settings.html               # 想定買い出し額・想定外食単価 設定
│  ├─ history.html                # 過去履歴閲覧
│  ├─ css/
│  │  └─ style.css               # 共通スタイル(レスポンシブ)
│  └─ js/
│     ├─ api.js                  # fetch共通処理
│     ├─ top.js
│     ├─ shopping.js
│     ├─ dining.js
│     ├─ budget.js
│     ├─ settings.js
│     └─ history.js
├─ .env.example                 # DATABASE_URL など
├─ .gitignore
├─ package.json
└─ render.yaml                  # Render用デプロイ設定(任意)
```

- `src/` = バックエンド(Express)、`public/` = フロントエンド(静的配信)というシンプルな2分割
- Express側は `express.static('public')` でフロントを配信 + `/api/*` でAPIを提供する単一サービス構成（Render上は1つのWeb Serviceで完結）
- 認証なしなのでミドルウェアは最小限（CORSは同一オリジン配信のため基本不要）

## APIエンドポイント設計

共通事項:
- 日付は `YYYY-MM-DD`、月指定は `YYYY-MM` 形式のクエリパラメータ `month` を使用
- レスポンスはJSON、金額は円単位の整数

### トップ画面

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/dashboard` | 自由枠・外食可能回数・直近7日頻度・判定メッセージをまとめて返す。当月の`monthly_budgets`が無ければ前月値を自動コピーして作成してから計算する |

### 食費予算

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/budgets/:yearMonth` | 指定月の予算を取得（例: `/api/budgets/2026-08`） |
| PUT | `/api/budgets/:yearMonth` | 指定月の予算を新規作成 or 更新（月初の手動設定・修正用） `{ "budgetAmount": 30000 }` |

### 買い出し記録

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/shopping?month=YYYY-MM` | 指定月の買い出し記録一覧 |
| POST | `/api/shopping` | 新規登録 `{ "date": "2026-08-02", "amount": 7000 }` |
| PUT | `/api/shopping/:id` | 編集 `{ "date": "...", "amount": ... }` |
| DELETE | `/api/shopping/:id` | 削除 |

### 外食記録

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/dining?month=YYYY-MM` | 指定月の外食記録一覧 |
| POST | `/api/dining` | 新規登録 `{ "date": "2026-08-02", "amount": 3500 }` |
| PUT | `/api/dining/:id` | 編集 |
| DELETE | `/api/dining/:id` | 削除 |

### 設定値

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/settings` | 想定買い出し額・想定外食単価を取得 |
| PUT | `/api/settings` | 更新 `{ "assumedShoppingAmount": 7000, "assumedDiningPrice": 3900 }` |

### 履歴閲覧

| Method | Path | 説明 |
|---|---|---|
| GET | `/api/history/months` | データが存在する年月の一覧（画面の月セレクタ用） |
| GET | `/api/history/:yearMonth` | 指定月の予算・買い出し記録・外食記録をまとめて取得 |

## judgement.js の責務（判定ロジックの実装場所）
1. 残高 = 予算 − 当月買い出し合計 − 当月外食合計
2. 残り土曜日数 × 想定買い出し額 を残高から差し引き「自由枠」を算出
3. 自由枠が負数なら外食可能回数は0、そうでなければ `Math.floor(自由枠 / 想定外食単価)`
4. 直近7日間の外食件数を集計（0/1/2以上で3段階）
5. 2と4を踏まえてメッセージを決定（自由枠マイナス時は強めの「今日は控えめに」を優先表示）

この設計で問題なければ実装に入ります。ページ遷移や画面項目で先に決めておきたいことがあれば教えてください（無ければこのまま実装を開始します）。
