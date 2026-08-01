// 確保金・外食可能回数・判定メッセージを算出する
function computeJudgement({
  budgetAmount,
  shoppingSum,
  diningSum,
  remainingWeekends,
  assumedShoppingAmount,
  assumedDiningPrice,
  recentDiningCount,
}) {
  const balance = budgetAmount - shoppingSum - diningSum;
  const reserved = remainingWeekends * assumedShoppingAmount;
  const freeBudget = balance - reserved;
  const diningPossibleCount = freeBudget > 0 ? Math.floor(freeBudget / assumedDiningPrice) : 0;

  let headline;
  let detail;
  if (freeBudget < 0) {
    headline = '今日は控えめに';
    detail = 'すでに使いすぎています';
  } else if (diningPossibleCount <= 0) {
    headline = '今日は控えめに';
    detail = '自由枠がほぼ残っていません';
  } else if (recentDiningCount >= 2) {
    headline = '今日は控えめに';
    detail = '直近の外食が続いています';
  } else if (recentDiningCount === 1) {
    headline = '今日は外食OK';
    detail = 'ただしギリギリなので計画的に';
  } else {
    headline = '今日は外食OK！';
    detail = '';
  }

  return { balance, freeBudget, diningPossibleCount, headline, detail };
}

module.exports = { computeJudgement };
