(() => {
  const recordType = document.body.dataset.recordType; // 'shopping' | 'dining'
  const api = {
    list: recordType === 'shopping' ? Api.listShopping : Api.listDining,
    create: recordType === 'shopping' ? Api.createShopping : Api.createDining,
    update: recordType === 'shopping' ? Api.updateShopping : Api.updateDining,
    remove: recordType === 'shopping' ? Api.deleteShopping : Api.deleteDining,
  };

  const form = document.getElementById('recordForm');
  const recordIdInput = document.getElementById('recordId');
  const dateInput = document.getElementById('recordDate');
  const amountInput = document.getElementById('recordAmount');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const listEl = document.getElementById('recordList');
  const emptyState = document.getElementById('emptyState');

  dateInput.value = todayStr();

  function resetForm() {
    recordIdInput.value = '';
    dateInput.value = todayStr();
    amountInput.value = '';
    formTitle.textContent = '新規登録';
    submitBtn.textContent = '登録する';
    cancelEditBtn.style.display = 'none';
  }

  function startEdit(record) {
    recordIdInput.value = record.id;
    dateInput.value = record.date;
    amountInput.value = record.amount;
    formTitle.textContent = '記録を編集';
    submitBtn.textContent = '更新する';
    cancelEditBtn.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadList() {
    const month = currentYearMonth();
    const records = await api.list(month);
    listEl.innerHTML = '';
    emptyState.style.display = records.length === 0 ? 'block' : 'none';

    records.forEach((record) => {
      const li = document.createElement('li');
      li.className = 'record-item';
      li.innerHTML = `
        <span class="date">${record.date}</span>
        <span class="amount">${formatYen(record.amount)}</span>
        <span class="actions">
          <button class="icon-btn edit" data-action="edit">編集</button>
          <button class="icon-btn delete" data-action="delete">削除</button>
        </span>
      `;
      li.querySelector('[data-action="edit"]').addEventListener('click', () => startEdit(record));
      li.querySelector('[data-action="delete"]').addEventListener('click', () => handleDelete(record));
      listEl.appendChild(li);
    });
  }

  async function handleDelete(record) {
    if (!confirm(`${record.date} / ${formatYen(record.amount)} を削除しますか？`)) return;
    try {
      await api.remove(record.id);
      showToast('削除しました');
      await loadList();
    } catch (err) {
      showToast('削除に失敗しました');
      console.error(err);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = dateInput.value;
    const amount = Number(amountInput.value);
    if (!date || !Number.isFinite(amount) || amount < 0) {
      showToast('入力内容を確認してください');
      return;
    }

    try {
      if (recordIdInput.value) {
        await api.update(recordIdInput.value, date, amount);
        showToast('更新しました');
      } else {
        await api.create(date, amount);
        showToast('登録しました');
      }
      resetForm();
      await loadList();
    } catch (err) {
      showToast('保存に失敗しました');
      console.error(err);
    }
  });

  cancelEditBtn.addEventListener('click', resetForm);

  loadList().catch((err) => {
    console.error(err);
    showToast('読み込みに失敗しました');
  });
})();
