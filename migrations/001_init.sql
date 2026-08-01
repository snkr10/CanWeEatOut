-- 月ごとの食費予算
CREATE TABLE IF NOT EXISTS monthly_budgets (
    id SERIAL PRIMARY KEY,
    year_month DATE NOT NULL UNIQUE,      -- その月の1日 (例: 2026-08-01)
    budget_amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 買い出し記録
CREATE TABLE IF NOT EXISTS shopping_records (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shopping_records_date ON shopping_records (record_date);

-- 外食記録
CREATE TABLE IF NOT EXISTS dining_records (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dining_records_date ON dining_records (record_date);

-- 設定値（常に1行のみ）
CREATE TABLE IF NOT EXISTS settings (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    assumed_shopping_amount INTEGER NOT NULL DEFAULT 7000,
    assumed_dining_price INTEGER NOT NULL DEFAULT 3900,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
