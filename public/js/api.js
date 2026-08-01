const Api = (() => {
  async function request(path, options = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data && data.error) || `request failed: ${res.status}`);
    }
    return data;
  }

  return {
    getDashboard: () => request('/api/dashboard'),

    getBudget: (yearMonth) => request(`/api/budgets/${yearMonth}`).catch(() => null),
    putBudget: (yearMonth, budgetAmount) =>
      request(`/api/budgets/${yearMonth}`, {
        method: 'PUT',
        body: JSON.stringify({ budgetAmount }),
      }),

    getSettings: () => request('/api/settings'),
    putSettings: (assumedShoppingAmount, assumedDiningPrice) =>
      request('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ assumedShoppingAmount, assumedDiningPrice }),
      }),

    listShopping: (month) => request(`/api/shopping?month=${month}`),
    createShopping: (date, amount) =>
      request('/api/shopping', { method: 'POST', body: JSON.stringify({ date, amount }) }),
    updateShopping: (id, date, amount) =>
      request(`/api/shopping/${id}`, { method: 'PUT', body: JSON.stringify({ date, amount }) }),
    deleteShopping: (id) => request(`/api/shopping/${id}`, { method: 'DELETE' }),

    listDining: (month) => request(`/api/dining?month=${month}`),
    createDining: (date, amount) =>
      request('/api/dining', { method: 'POST', body: JSON.stringify({ date, amount }) }),
    updateDining: (id, date, amount) =>
      request(`/api/dining/${id}`, { method: 'PUT', body: JSON.stringify({ date, amount }) }),
    deleteDining: (id) => request(`/api/dining/${id}`, { method: 'DELETE' }),

    getHistoryMonths: () => request('/api/history/months'),
    getHistory: (yearMonth) => request(`/api/history/${yearMonth}`),
  };
})();

function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function currentYearMonth() {
  return todayStr().slice(0, 7);
}

function formatYen(amount) {
  return `¥${Number(amount).toLocaleString('ja-JP')}`;
}

function showToast(message) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2000);
}
