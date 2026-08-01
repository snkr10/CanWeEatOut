(() => {
  const form = document.getElementById('budgetForm');
  const amountInput = document.getElementById('budgetAmount');
  const monthLabel = document.getElementById('monthLabel');

  let yearMonth = currentYearMonth();

  async function load() {
    // dashboardは未設定なら前月値で自動作成してくれるので、それを利用して初期表示する
    const dashboard = await Api.getDashboard();
    yearMonth = dashboard.yearMonth;
    monthLabel.textContent = `${yearMonth} の予算`;
    amountInput.value = dashboard.budgetAmount;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount < 0) {
      showToast('入力内容を確認してください');
      return;
    }
    try {
      await Api.putBudget(yearMonth, amount);
      showToast('保存しました');
    } catch (err) {
      showToast('保存に失敗しました');
      console.error(err);
    }
  });

  load().catch((err) => {
    console.error(err);
    showToast('読み込みに失敗しました');
  });
})();
