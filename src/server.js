require('dotenv').config();
const express = require('express');
const path = require('path');

const { pool } = require('./db');
const dashboardRouter = require('./routes/dashboard');
const budgetsRouter = require('./routes/budgets');
const settingsRouter = require('./routes/settings');
const historyRouter = require('./routes/history');
const { createRecordsRouter } = require('./routes/records');

const app = express();
app.use(express.json());

app.use('/api/dashboard', dashboardRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/history', historyRouter);
app.use('/api/shopping', createRecordsRouter(pool, 'shopping_records'));
app.use('/api/dining', createRecordsRouter(pool, 'dining_records'));

app.use(express.static(path.join(__dirname, '..', 'public')));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CanWeEatOut server listening on port ${PORT}`);
});
