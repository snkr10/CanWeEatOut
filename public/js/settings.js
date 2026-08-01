(() => {
  const form = document.getElementById('settingsForm');
  const shoppingInput = document.getElementById('assumedShoppingAmount');
  const diningInput = document.getElementById('assumedDiningPrice');

  async function load() {
    const settings = await Api.getSettings();
    shoppingInput.value = settings.assumedShoppingAmount;
    diningInput.value = settings.assumedDiningPrice;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const assumedShoppingAmount = Number(shoppingInput.value);
    const assumedDiningPrice = Number(diningInput.value);
    if (
      !Number.isFinite(assumedShoppingAmount) ||
      assumedShoppingAmount <= 0 ||
      !Number.isFinite(assumedDiningPrice) ||
      assumedDiningPrice <= 0
    ) {
      showToast('入力内容を確認してください');
      return;
    }
    try {
      await Api.putSettings(assumedShoppingAmount, assumedDiningPrice);
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
