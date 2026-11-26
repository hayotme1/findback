document.addEventListener('DOMContentLoaded', async () => {
  if (!requireLogin()) return;

  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');

  try {
    const [{ user }, { items }] = await Promise.all([api('/auth/me'), api('/items/mine')]);
    document.getElementById('avatar').textContent = user.full_name.trim().charAt(0).toUpperCase();
    document.getElementById('userName').textContent = user.full_name;
    document.getElementById('userInfo').textContent = [user.email, user.phone, user.faculty].filter(Boolean).join(' · ');
    grid.innerHTML = items.map(itemCard).join('');
    empty.hidden = items.length > 0;
  } catch (err) {
    if (err.status === 401) return requireLogin();
    grid.innerHTML = `<p class="alert alert-error">${escapeHtml(errorText(err))}</p>`;
  }
});
