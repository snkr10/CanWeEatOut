const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT assumed_shopping_amount, assumed_dining_price FROM settings WHERE id = 1'
    );
    res.json(toDto(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const { assumedShoppingAmount, assumedDiningPrice } = req.body;
    if (
      !Number.isFinite(assumedShoppingAmount) ||
      assumedShoppingAmount <= 0 ||
      !Number.isFinite(assumedDiningPrice) ||
      assumedDiningPrice <= 0
    ) {
      return res.status(400).json({ error: 'invalid values' });
    }
    const result = await pool.query(
      `UPDATE settings SET assumed_shopping_amount = $1, assumed_dining_price = $2, updated_at = now()
       WHERE id = 1
       RETURNING assumed_shopping_amount, assumed_dining_price`,
      [assumedShoppingAmount, assumedDiningPrice]
    );
    res.json(toDto(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

function toDto(row) {
  return {
    assumedShoppingAmount: row.assumed_shopping_amount,
    assumedDiningPrice: row.assumed_dining_price,
  };
}

module.exports = router;
