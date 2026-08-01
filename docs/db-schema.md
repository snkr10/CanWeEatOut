# CanWeEatOut DBスキーマ設計

## 設計方針
- 認証なし・家族共有のため `user_id` は持たせない
- 金額はすべて円単位の整数（小数不要）→ `INTEGER`
- 買い出し記録・外食記録は「月」への外部キーを持たせず、`record_date` の範囲検索（当月1日〜末日）で月ごとの集計・履歴を出す
  - 月をまたぐ移動や、月初予算未設定でも記録だけ先に入れられるようにするため
- 想定買い出し額・想定外食単価は家族で1つだけ設定すればよいので、`settings` テーブルは常に1行のみ（`id=1`固定）で管理する
- 月初予算未設定時は「前月と同額を自動でDB保存」する仕様のため、`monthly_budgets` はアプリ側のロジック（月初回アクセス検出時に前月レコードをコピー）で自動生成される

## テーブル定義

```sql
-- 月ごとの食費予算
CREATE TABLE monthly_budgets (
    id SERIAL PRIMARY KEY,
    year_month DATE NOT NULL UNIQUE,      -- その月の1日 (例: 2026-08-01)
    budget_amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 買い出し記録
CREATE TABLE shopping_records (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_shopping_records_date ON shopping_records (record_date);

-- 外食記録
CREATE TABLE dining_records (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dining_records_date ON dining_records (record_date);

-- 設定値（常に1行のみ）
CREATE TABLE settings (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    assumed_shopping_amount INTEGER NOT NULL DEFAULT 7000,  -- 想定買い出し額
    assumed_dining_price INTEGER NOT NULL DEFAULT 3900,     -- 想定外食単価
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO settings (id) VALUES (1);
```

## 計算ロジックとの対応
- 残高 = `monthly_budgets.budget_amount`（今月）− `shopping_records` 当月合計 − `dining_records` 当月合計
- 確保金 = 残高 − (今日から月末までの残り週末回数 × `assumed_shopping_amount`)
  - 「残り週末回数」は土曜・日曜のペアを1週末として数える
  - その週末の土曜・日曜のどちらかにすでに買い出し記録があれば、その週末は「済んだ実績」として除外する（実績と確保金の二重計上を防ぐため）
  - 今日が日曜の場合は、まだ終わっていない「今週末（昨日の土曜を含む）」から数える
- 外食可能回数 = `FLOOR(確保金 / assumed_dining_price)`（マイナス時は0扱い）
- 直近7日頻度 = `dining_records` の `record_date >= 今日-6日` の件数

## 確定した仕様メモ（要件定義書の曖昧点への回答）
| 項目 | 決定内容 |
|---|---|
| 残り週末回数の数え方 | 土曜+日曜を1週末としてカウント。どちらかに買い出し記録があればその週末は除外（二重計上防止） |
| 想定外食単価の初期値 | 3,900円 |
| 月初予算未設定時の挙動 | 前月と同額を自動的にDBへ保存（確認不要） |
| 自由枠がマイナスの場合 | 外食可能回数は0回、「今日は控えめに」を強く表示 |
| 外食可能回数の端数処理 | 切り捨て（FLOOR） |
