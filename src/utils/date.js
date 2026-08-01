const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

// サーバーのタイムゾーンに関わらず、日本時間としての「今」を返す
// (返り値はUTCフィールドとしてJSTの年月日時刻を保持するDateオブジェクト)
function getJstNow() {
  const now = new Date();
  return new Date(now.getTime() + JST_OFFSET_MS);
}

function formatDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYearMonth(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getMonthRange(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0)); // 当月末日
  return { start: formatDate(start), end: formatDate(end) };
}

function addMonths(yearMonth, delta) {
  const [y, m] = yearMonth.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return getYearMonth(d);
}

// today以降、当該月の末日までの土曜日の数(todayが土曜なら含む)
function countRemainingSaturdays(today, yearMonth) {
  const { end } = getMonthRange(yearMonth);
  const endDate = new Date(`${end}T00:00:00Z`);
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  let count = 0;
  while (cursor <= endDate) {
    if (cursor.getUTCDay() === 6) count += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

module.exports = {
  getJstNow,
  formatDate,
  getYearMonth,
  getMonthRange,
  addMonths,
  countRemainingSaturdays,
};
