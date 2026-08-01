function animateCount(el, to, formatter, duration = 600) {
  const from = 0;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (to - from) * eased);
    el.textContent = formatter(current);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

(async () => {
  const card = document.getElementById('judgementCard');
  const freeBudgetEl = document.getElementById('freeBudget');
  const diningPossibleCountEl = document.getElementById('diningPossibleCount');
  const recentDiningCountEl = document.getElementById('recentDiningCount');
  const balanceEl = document.getElementById('balance');
  const breakdownEl = document.getElementById('breakdown');

  try {
    const data = await Api.getDashboard();
    const isGood = data.freeBudget > 0 && data.diningPossibleCount > 0 && data.recentDiningCount === 0;

    card.classList.remove('ok', 'warn');
    card.classList.add(isGood ? 'ok' : 'warn');
    card.innerHTML = `
      <span class="icon">${isGood ? '🎉' : '🙏'}</span>
      <p class="message">${data.message}</p>
    `;

    [freeBudgetEl, diningPossibleCountEl, recentDiningCountEl, balanceEl].forEach((el) => el.classList.remove('skeleton'));

    animateCount(freeBudgetEl, data.freeBudget, (v) => formatYen(v));
    animateCount(diningPossibleCountEl, data.diningPossibleCount, (v) => `${v}回`);
    animateCount(recentDiningCountEl, data.recentDiningCount, (v) => `${v}回`);
    animateCount(balanceEl, data.balance, (v) => formatYen(v));

    breakdownEl.classList.remove('skeleton');
    breakdownEl.removeAttribute('style');
    breakdownEl.style.fontSize = '14px';
    breakdownEl.style.color = 'var(--color-text-sub)';
    breakdownEl.style.lineHeight = '1.8';
    breakdownEl.innerHTML = `
      予算: ${formatYen(data.budgetAmount)}<br>
      買い出し合計: ${formatYen(data.shoppingSum)}<br>
      外食合計: ${formatYen(data.diningSum)}<br>
      月末までの残り土曜日: ${data.remainingSaturdays}回<br>
      想定買い出し額: ${formatYen(data.assumedShoppingAmount)} / 想定外食単価: ${formatYen(data.assumedDiningPrice)}
    `;
  } catch (err) {
    card.classList.remove('ok');
    card.classList.add('warn');
    card.innerHTML = `<span class="icon">⚠️</span><p class="message">読み込みに失敗しました</p>`;
    console.error(err);
  }
})();
