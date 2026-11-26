document.addEventListener('DOMContentLoaded', async () => {
  const box = document.getElementById('item');
  const alertBox = document.getElementById('alert');
  const id = qs('id');

  let item;
  try {
    ({ item } = await api(`/items/${encodeURIComponent(id)}`));
  } catch (err) {
    showAlert(alertBox, err.code === 'not_found' ? t('item.notFound') : errorText(err));
    return;
  }

  document.title = `${item.title} — FindBack`;
  const user = Auth.user;
  const isOwner = user && user.id === item.user_id;

  const contact = Auth.loggedIn
    ? `<dl class="contact">
         <dt>${escapeHtml(t('item.postedBy'))}</dt><dd>${escapeHtml(item.owner_name)}</dd>
         ${item.owner_faculty ? `<dt>${escapeHtml(t('item.faculty'))}</dt><dd>${escapeHtml(item.owner_faculty)}</dd>` : ''}
         <dt>Email</dt><dd><a href="mailto:${escapeHtml(item.owner_email)}">${escapeHtml(item.owner_email)}</a></dd>
         ${item.owner_phone ? `<dt>Tel</dt><dd><a href="tel:${escapeHtml(item.owner_phone)}">${escapeHtml(item.owner_phone)}</a></dd>` : ''}
       </dl>`
    : `<p class="muted">${escapeHtml(t('item.loginToContact'))}
         <a href="/login.html?next=${encodeURIComponent(location.pathname + location.search)}">${escapeHtml(t('nav.login'))}</a></p>`;

  const isAdmin = user && user.role === 'admin';
  const messageBtn = Auth.loggedIn && !isOwner
    ? `<div class="actions"><a class="btn" href="/messages.html?item=${item.id}&with=${item.user_id}">${escapeHtml(t('item.message'))}</a>
         ${isAdmin ? `<button type="button" class="btn btn-danger" id="adminDeleteBtn">${escapeHtml(t('item.adminDelete'))}</button>` : ''}</div>`
    : '';

  const ownerActions = isOwner
    ? `<div class="actions">
         <a class="btn btn-ghost" href="/new.html?edit=${item.id}">${escapeHtml(t('item.edit'))}</a>
         <button type="button" class="btn ${item.status === 'active' ? 'btn-found' : 'btn-ghost'}" id="statusBtn">
           ${escapeHtml(t(item.status === 'active' ? 'item.markResolved' : 'item.markActive'))}</button>
         <button type="button" class="btn btn-danger" id="deleteBtn">${escapeHtml(t('item.delete'))}</button>
       </div>`
    : '';

  box.innerHTML = `
    <div class="detail-media">
      ${item.image ? `<img src="/uploads/${encodeURIComponent(item.image)}" alt="${escapeHtml(item.title)}">` : `<div class="no-image">${ICONS.image}</div>`}
    </div>
    <div class="detail-body">
      <div class="badges">
        <span class="badge badge-${item.type}">${escapeHtml(t(`type.${item.type}`))}</span>
        <span class="badge badge-${item.status === 'resolved' ? 'resolved' : 'active'}">${escapeHtml(t(`status.${item.status}`))}</span>
      </div>
      <h1>${escapeHtml(item.title)}</h1>
      <ul class="facts">
        <li>${ICONS.location}<span><b>${escapeHtml(t('item.location'))}:</b> ${escapeHtml(item.location)}</span></li>
        <li>${ICONS.calendar}<span><b>${escapeHtml(t('item.date'))}:</b> ${formatDate(item.event_date)}</span></li>
        <li>${ICONS.tag}<span><b>${escapeHtml(t('item.category'))}:</b> ${escapeHtml(t(`cat.${item.category}`))}</span></li>
      </ul>
      <p class="description">${item.description ? escapeHtml(item.description) : `<span class="muted">${escapeHtml(t('item.noDescription'))}</span>`}</p>
      <h2>${escapeHtml(t('item.contact'))}</h2>
      ${contact}
      ${messageBtn}
      ${ownerActions}
    </div>`;
  box.hidden = false;

  loadSimilar(item);

  const adminDelete = document.getElementById('adminDeleteBtn');
  if (adminDelete) adminDelete.addEventListener('click', async () => {
    if (!confirm(t('admin.confirmDeleteItem'))) return;
    try {
      await api(`/admin/items/${item.id}`, { method: 'DELETE' });
      location.href = '/admin.html';
    } catch (err) { showAlert(alertBox, errorText(err)); }
  });

  if (!isOwner) return;

  document.getElementById('statusBtn').addEventListener('click', async () => {
    try {
      await api(`/items/${item.id}/status`, { method: 'PATCH', body: { status: item.status === 'active' ? 'resolved' : 'active' } });
      location.reload();
    } catch (err) { showAlert(alertBox, errorText(err)); }
  });

  document.getElementById('deleteBtn').addEventListener('click', async () => {
    if (!confirm(t('item.confirmDelete'))) return;
    try {
      await api(`/items/${item.id}`, { method: 'DELETE' });
      location.href = '/profile.html';
    } catch (err) { showAlert(alertBox, errorText(err)); }
  });
});

// O'xshash e'lonlar: yo'qolgan buyum uchun topilganlar va aksincha
async function loadSimilar(item) {
  if (item.status !== 'active') return;
  try {
    const { items } = await api(`/items/${item.id}/similar`);
    if (!items.length) return;
    const section = document.getElementById('similar');
    section.querySelector('h2').textContent = t(item.type === 'lost' ? 'item.similarFound' : 'item.similarLost');
    section.querySelector('.grid').innerHTML = items.map(itemCard).join('');
    section.hidden = false;
  } catch { /* ignore */ }
}
