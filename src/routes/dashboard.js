const express = require('express');
const { pool } = require('../db');
const {
  getJstNow,
  formatDate,
  getYearMonth,
  getMonthRange,
  addMonths,
  countRemainingWeekends,
} = require('../utils/date');
const { computeJudgement } = require('../services/judgement');

const router = express.Router();

async function getOrCreateCurrentBudget(yearMonth) {
  const existing = await pool.query(
    'SELECT budget_amount FROM monthly_budgets WHERE year_month = $1',
    [`${yearMonth}-01`]
  );
  if (existing.rows.length > 0) {
    return existing.rows[0].budget_amount;
  }

  const prevMonth = addMonths(yearMonth, -1);
  const prevBudget = await pool.query(
    'SELECT budget_amount FROM monthly_budgets WHERE year_month = $1',
    [`${prevMonth}-01`]
  );
  const budgetAmount = prevBudget.rows.length > 0 ? prevBudget.rows[0].budget_amount : 0;

  const inserted = await pool.query(
    `INSERT INTO monthly_budgets (year_month, budget_amount) VALUES ($1, $2)
     ON CONFLICT (year_month) DO NOTHING
     RETURNING budget_amount`,
    [`${yearMonth}-01`, budgetAmount]
  );
  return inserted.rows.length > 0 ? inserted.rows[0].budget_amount : budgetAmount;
}

router.get('/', async (req, res, next) => {
  try {
    const now = getJstNow();
    const todayStr = formatDate(now);
    const yearMonth = getYearMonth(now);

    const budgetAmount = await getOrCreateCurrentBudget(yearMonth);
    const { start, end } = getMonthRange(yearMonth);

    const [shoppingSumResult, shoppingDatesResult, diningSumResult, settingsResult] = await Promise.all([
      pool.query(
        'SELECT COALESCE(SUM(amount), 0) AS sum FROM shopping_records WHERE record_date BETWEEN $1 AND $2',
        [start, end]
      ),
      pool.query(
        'SELECT DISTINCT record_date FROM shopping_records WHERE record_date BETWEEN $1 AND $2',
        [start, end]
      ),
      pool.query(
        'SELECT COALESCE(SUM(amount), 0) AS sum FROM dining_records WHERE record_date BETWEEN $1 AND $2',
        [start, end]
      ),
      pool.query('SELECT assumed_shopping_amount, assumed_dining_price FROM settings WHERE id = 1'),
    ]);

    const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const recentDiningResult = await pool.query(
      'SELECT COUNT(*) AS count FROM dining_records WHERE record_date BETWEEN $1 AND $2',
      [formatDate(sevenDaysAgo), todayStr]
    );

    const settings = settingsResult.rows[0];
    const shoppingDates = new Set(shoppingDatesResult.rows.map((r) => r.record_date));
    const remainingWeekends = countRemainingWeekends(now, yearMonth, shoppingDates);
    const shoppingSum = Number(shoppingSumResult.rows[0].sum);
    const diningSum = Number(diningSumResult.rows[0].sum);
    const recentDiningCount = Number(recentDiningResult.rows[0].count);

    const judgement = computeJudgement({
      budgetAmount,
      shoppingSum,
      diningSum,
      remainingWeekends,
      assumedShoppingAmount: settings.assumed_shopping_amount,
      assumedDiningPrice: settings.assumed_dining_price,
      recentDiningCount,
    });

    res.json({
      yearMonth,
      today: todayStr,
      budgetAmount,
      shoppingSum,
      diningSum,
      remainingWeekends,
      assumedShoppingAmount: settings.assumed_shopping_amount,
      assumedDiningPrice: settings.assumed_dining_price,
      recentDiningCount,
      ...judgement,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
