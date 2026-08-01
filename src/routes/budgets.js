const express = require('express');
const { pool } = require('../db');

const router = express.Router();

const YEAR_MONTH_RE = /^\d{4}-\d{2}$/;

router.get('/:yearMonth', async (req, res, next) => {
  try {
    const { yearMonth } = req.params;
    if (!YEAR_MONTH_RE.test(yearMonth)) {
      return res.status(400).json({ error: 'yearMonth must be YYYY-MM' });
    }
    const result = await pool.query(
      'SELECT year_month, budget_amount FROM monthly_budgets WHERE year_month = $1',
      [`${yearMonth}-01`]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(toDto(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

router.put('/:yearMonth', async (req, res, next) => {
  try {
    const { yearMonth } = req.params;
    const { budgetAmount } = req.body;
    if (!YEAR_MONTH_RE.test(yearMonth)) {
      return res.status(400).json({ error: 'yearMonth must be YYYY-MM' });
    }
    if (!Number.isFinite(budgetAmount) || budgetAmount < 0) {
      return res.status(400).json({ error: 'invalid budgetAmount' });
    }
    const result = await pool.query(
      `INSERT INTO monthly_budgets (year_month, budget_amount)
       VALUES ($1, $2)
       ON CONFLICT (year_month) DO UPDATE SET budget_amount = $2, updated_at = now()
       RETURNING year_month, budget_amount`,
      [`${yearMonth}-01`, budgetAmount]
    );
    res.json(toDto(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

function toDto(row) {
  return {
    yearMonth: row.year_month.slice(0, 7),
    budgetAmount: row.budget_amount,
  };
}

module.exports = router;
