const express = require('express');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_MONTH_RE = /^\d{4}-\d{2}$/;

function isValidDate(date) {
  return typeof date === 'string' && DATE_RE.test(date);
}

function isValidAmount(amount) {
  return Number.isFinite(amount) && amount >= 0;
}

function toDto(row) {
  return { id: row.id, date: row.record_date, amount: row.amount };
}

// 買い出し記録・外食記録は構造が同一のため、テーブル名を渡してルーターを生成する
function createRecordsRouter(pool, tableName) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const { month } = req.query;
      if (!month || !YEAR_MONTH_RE.test(month)) {
        return res.status(400).json({ error: 'month query parameter (YYYY-MM) is required' });
      }
      const start = `${month}-01`;
      const result = await pool.query(
        `SELECT id, record_date, amount FROM ${tableName}
         WHERE record_date >= $1::date AND record_date < ($1::date + interval '1 month')
         ORDER BY record_date`,
        [start]
      );
      res.json(result.rows.map(toDto));
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const { date, amount } = req.body;
      if (!isValidDate(date) || !isValidAmount(amount)) {
        return res.status(400).json({ error: 'invalid date or amount' });
      }
      const result = await pool.query(
        `INSERT INTO ${tableName} (record_date, amount) VALUES ($1, $2)
         RETURNING id, record_date, amount`,
        [date, amount]
      );
      res.status(201).json(toDto(result.rows[0]));
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { date, amount } = req.body;
      if (!isValidDate(date) || !isValidAmount(amount)) {
        return res.status(400).json({ error: 'invalid date or amount' });
      }
      const result = await pool.query(
        `UPDATE ${tableName} SET record_date = $1, amount = $2, updated_at = now()
         WHERE id = $3
         RETURNING id, record_date, amount`,
        [date, amount, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'not found' });
      }
      res.json(toDto(result.rows[0]));
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING id`, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'not found' });
      }
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createRecordsRouter };
