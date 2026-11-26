document.addEventListener('DOMContentLoaded', async () => {
  if (!requireLogin()) return;

  const alertBox = document.getElementById('alert');
  const wrap = document.getElementById('tableWrap');
  const search = document.getElementById('adminSearch');
  const tabs = document.querySelectorAll('.tab');
  let tab = qs('tab') === 'users' ? 'users' : 'items';
  let debounce;

  async function loadStats() {
    const stats = await api('/admin/stats');
    document.querySelectorAll('#adminStats [data-k]').forEach((el) => { el.textContent = stats[el.dataset.k]; });
    document.getElementById('adminStats').hidden = false;
  }

  function itemsTable(items) {
    if (!items.length) return `<p class="empty">${escapeHtml(t('list.empty'))}</p>`;
    return `<table class="table">
      <thead><tr><th>#</th><th>${escapeHtml(t('form.title'))}</th><th>${escapeHtml(t('admin.type'))}</th>
        <th>${escapeHtml(t('admin.owner'))}</th><th>${escapeHtml(t('admin.status'))}</th><th>${escapeHtml(t('admin.created'))}</th><th></th></tr></thead>
      <tbody>${items.map((i) => `
        <tr>
          <td class="muted">${i.id}</td>
          <td><a href="/item.html?id=${i.id}">${escapeHtml(i.title)}</a><div class="muted small">${escapeHtml(i.location)}</div></td>
          <td><span class="badge badge-${i.type}">${escapeHtml(t(`type.${i.type}`))}</span></td>
          <td>${escapeHtml(i.owner_name)}<div class="muted small">${escapeHtml(i.owner_email)}</div></td>
          <td>${escapeHtml(t(`status.${i.status}`))}</td>
          <td class="nowrap">${formatDate(i.created_at)}</td>
          <td><button type="button" class="btn btn-danger btn-sm" data-del-item="${i.id}">${escapeHtml(t('admin.delete'))}</button></td>
        </tr>`).join('')}</tbody></table>`;
  }

  function usersTable(users) {
    const me = Auth.user;
    if (!users.length) return `<p class="empty">${escapeHtml(t('list.empty'))}</p>`;
    return `<table class="table">
      <thead><tr><th>#</th><th>${escapeHtml(t('admin.name'))}</th><th>${escapeHtml(t('admin.role'))}</th>
        <th>${escapeHtml(t('admin.itemsCount'))}</th><th>${escapeHtml(t('admin.created'))}</th><th></th></tr></thead>
      <tbody>${users.map((u) => {
        const self = u.id === me.id;
        return `
        <tr>
          <td class="muted">${u.id}</td>
          <td>${escapeHtml(u.full_name)} ${self ? `<span class="muted">${escapeHtml(t('admin.you'))}</span>` : ''}
            <div class="muted small">${escapeHtml([u.email, u.phone, u.faculty].filter(Boolean).join(' · '))}</div></td>
          <td><span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-active'}">${escapeHtml(t(`role.${u.role}`))}</span></td>
          <td>${u.items_count}</td>
          <td class="nowrap">${formatDate(u.created_at)}</td>
          <td class="nowrap">${self ? '' : `
            <button type="button" class="btn btn-ghost btn-sm" data-role="${u.id}" data-next="${u.role === 'admin' ? 'user' : 'admin'}">
              ${escapeHtml(t(u.role === 'admin' ? 'admin.makeUser' : 'admin.makeAdmin'))}</button>
            <button type="button" class="btn btn-danger btn-sm" data-del-user="${u.id}">${escapeHtml(t('admin.delete'))}</button>`}</td>
        </tr>`;
      }).join('')}</tbody></table>`;
  }

  async function loadTable() {
    tabs.forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    const q = encodeURIComponent(search.value.trim());
    try {
      if (tab === 'items') wrap.innerHTML = itemsTable((await api(`/admin/items?q=${q}`)).items);
      else wrap.innerHTML = usersTable((await api(`/admin/users?q=${q}`)).users);
    } catch (err) {
      showAlert(alertBox, errorText(err));
    }
  }

  tabs.forEach((b) => b.addEventListener('click', () => {
    tab = b.dataset.tab;
    history.replaceState(null, '', `?tab=${tab}`);
    loadTable();
  }));
  search.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(loadTable, 250); });

  wrap.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    try {
      if (btn.dataset.delItem) {
        if (!confirm(t('admin.confirmDeleteItem'))) return;
        await api(`/admin/items/${btn.dataset.delItem}`, { method: 'DELETE' });
      } else if (btn.dataset.delUser) {
        if (!confirm(t('admin.confirmDeleteUser'))) return;
        await api(`/admin/users/${btn.dataset.delUser}`, { method: 'DELETE' });
      } else if (btn.dataset.role) {
        await api(`/admin/users/${btn.dataset.role}/role`, { method: 'PATCH', body: { role: btn.dataset.next } });
      } else return;
      loadStats();
      loadTable();
    } catch (err) {
      showAlert(alertBox, errorText(err));
    }
  });

  try {
    await loadStats();
  } catch (err) {
    showAlert(alertBox, errorText(err));
    document.querySelector('.tabs').hidden = true;
    return;
  }
  loadTable();
});
