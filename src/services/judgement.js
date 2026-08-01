// 確保金・外食可能回数・判定メッセージを算出する
function computeJudgement({
  budgetAmount,
  shoppingSum,
  diningSum,
  remainingSaturdays,
  assumedShoppingAmount,
  assumedDiningPrice,
  recentDiningCount,
}) {
  const balance = budgetAmount - shoppingSum - diningSum;
  const reserved = remainingSaturdays * assumedShoppingAmount;
  const freeBudget = balance - reserved;
  const diningPossibleCount = freeBudget > 0 ? Math.floor(freeBudget / assumedDiningPrice) : 0;

  let message;
  if (freeBudget < 0) {
    message = '今日は控えめに。すでに使いすぎています。';
  } else if (diningPossibleCount <= 0) {
    message = '今日は控えめに。自由枠がほぼ残っていません。';
  } else if (recentDiningCount >= 2) {
    message = '今日は控えめに。直近の外食が続いています。';
  } else if (recentDiningCount === 1) {
    message = '今日は外食OK。ただしギリギリなので計画的に。';
  } else {
    message = '今日は外食OK！';
  }

  return { balance, freeBudget, diningPossibleCount, message };
}

module.exports = { computeJudgement };
