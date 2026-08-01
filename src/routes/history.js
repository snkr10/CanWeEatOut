const express = require('express');
const { pool } = require('../db');

const router = express.Router();
const YEAR_MONTH_RE = /^\d{4}-\d{2}$/;

router.get('/months', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ym FROM (
        SELECT year_month AS ym FROM monthly_budgets
        UNION
        SELECT date_trunc('month', record_date)::date AS ym FROM shopping_records
        UNION
        SELECT date_trunc('month', record_date)::date AS ym FROM dining_records
      ) months
      ORDER BY ym DESC
    `);
    res.json(result.rows.map((r) => r.ym.slice(0, 7)));
  } catch (err) {
    next(err);
  }
});

router.get('/:yearMonth', async (req, res, next) => {
  try {
    const { yearMonth } = req.params;
    if (!YEAR_MONTH_RE.test(yearMonth)) {
      return res.status(400).json({ error: 'yearMonth must be YYYY-MM' });
    }
    const start = `${yearMonth}-01`;

    const [budgetResult, shoppingResult, diningResult] = await Promise.all([
      pool.query('SELECT budget_amount FROM monthly_budgets WHERE year_month = $1', [start]),
      pool.query(
        `SELECT id, record_date, amount FROM shopping_records
         WHERE record_date >= $1::date AND record_date < ($1::date + interval '1 month')
         ORDER BY record_date`,
        [start]
      ),
      pool.query(
        `SELECT id, record_date, amount FROM dining_records
         WHERE record_date >= $1::date AND record_date < ($1::date + interval '1 month')
         ORDER BY record_date`,
        [start]
      ),
    ]);

    res.json({
      yearMonth,
      budgetAmount: budgetResult.rows.length > 0 ? budgetResult.rows[0].budget_amount : null,
      shoppingRecords: shoppingResult.rows.map((r) => ({ id: r.id, date: r.record_date, amount: r.amount })),
      diningRecords: diningResult.rows.map((r) => ({ id: r.id, date: r.record_date, amount: r.amount })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
