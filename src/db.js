const { Pool, types } = require('pg');

// DATE型(OID 1082)をJSのDateに変換させず、'YYYY-MM-DD'文字列のまま扱う
// (node-pgのデフォルト変換はサーバーのタイムゾーンにより日付がずれることがあるため)
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = { pool };
