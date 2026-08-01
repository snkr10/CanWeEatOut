(() => {
  const monthSelect = document.getElementById('monthSelect');
  const histBudget = document.getElementById('histBudget');
  const histSums = document.getElementById('histSums');
  const shoppingList = document.getElementById('histShoppingList');
  const shoppingEmpty = document.getElementById('histShoppingEmpty');
  const diningList = document.getElementById('histDiningList');
  const diningEmpty = document.getElementById('histDiningEmpty');

  function renderList(listEl, emptyEl, records) {
    listEl.innerHTML = '';
    emptyEl.style.display = records.length === 0 ? 'block' : 'none';
    records.forEach((record) => {
      const li = document.createElement('li');
      li.className = 'record-item';
      li.innerHTML = `
        <span class="date">${record.date}</span>
        <span class="amount">${formatYen(record.amount)}</span>
      `;
      listEl.appendChild(li);
    });
  }

  async function loadMonth(yearMonth) {
    const data = await Api.getHistory(yearMonth);
    histBudget.textContent = data.budgetAmount === null ? '未設定' : formatYen(data.budgetAmount);

    const shoppingSum = data.shoppingRecords.reduce((sum, r) => sum + r.amount, 0);
    const diningSum = data.diningRecords.reduce((sum, r) => sum + r.amount, 0);
    histSums.textContent = `${formatYen(shoppingSum)} / ${formatYen(diningSum)}`;

    renderList(shoppingList, shoppingEmpty, data.shoppingRecords);
    renderList(diningList, diningEmpty, data.diningRecords);
  }

  async function init() {
    let months = await Api.getHistoryMonths();
    const thisMonth = currentYearMonth();
    if (!months.includes(thisMonth)) {
      months = [thisMonth, ...months];
    }

    monthSelect.innerHTML = months
      .map((m) => `<option value="${m}">${m}</option>`)
      .join('');
    monthSelect.value = thisMonth;

    monthSelect.addEventListener('change', () => {
      loadMonth(monthSelect.value).catch((err) => {
        console.error(err);
        showToast('読み込みに失敗しました');
      });
    });

    await loadMonth(monthSelect.value);
  }

  init().catch((err) => {
    console.error(err);
    showToast('読み込みに失敗しました');
  });
})();
