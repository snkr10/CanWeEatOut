(async () => {
  const card = document.getElementById('judgementCard');
  try {
    const data = await Api.getDashboard();

    card.classList.remove('ok', 'warn');
    card.classList.add(data.freeBudget > 0 && data.diningPossibleCount > 0 && data.recentDiningCount === 0 ? 'ok' : 'warn');
    card.innerHTML = `<p class="message">${data.message}</p>`;

    document.getElementById('freeBudget').textContent = formatYen(data.freeBudget);
    document.getElementById('diningPossibleCount').textContent = `${data.diningPossibleCount}回`;
    document.getElementById('recentDiningCount').textContent = `${data.recentDiningCount}回`;
    document.getElementById('balance').textContent = formatYen(data.balance);

    document.getElementById('breakdown').innerHTML = `
      予算: ${formatYen(data.budgetAmount)}<br>
      買い出し合計: ${formatYen(data.shoppingSum)}<br>
      外食合計: ${formatYen(data.diningSum)}<br>
      月末までの残り土曜日: ${data.remainingSaturdays}回<br>
      想定買い出し額: ${formatYen(data.assumedShoppingAmount)} / 想定外食単価: ${formatYen(data.assumedDiningPrice)}
    `;
  } catch (err) {
    card.innerHTML = `<p class="message">読み込みに失敗しました</p>`;
    console.error(err);
  }
})();
