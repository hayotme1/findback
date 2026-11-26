document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('filters');
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const pager = document.getElementById('pager');
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  fillCategorySelect(document.getElementById('categorySelect'));

  // URL'dagi filtrlarni formaga yozamiz (sahifa yangilansa ham saqlanadi)
  const params = new URLSearchParams(location.search);
  for (const el of form.elements) if (el.name && params.has(el.name)) el.value = params.get(el.name);
  let page = Math.max(1, parseInt(params.get('page'), 10) || 1);

  async function load() {
    const query = new URLSearchParams();
    for (const el of form.elements) if (el.name && el.value) query.set(el.name, el.value.trim());
    if (page > 1) query.set('page', page);
    history.replaceState(null, '', query.toString() ? `?${query}` : location.pathname);

    grid.innerHTML = '<div class="loader"></div>';
    try {
      const data = await api(`/items?${query}`);
      grid.innerHTML = data.items.map(itemCard).join('');
      empty.hidden = data.items.length > 0;
      pager.hidden = data.pages <= 1;
      pageInfo.textContent = t('list.page', { page: data.page, pages: data.pages });
      prevBtn.disabled = data.page <= 1;
      nextBtn.disabled = data.page >= data.pages;
    } catch (err) {
      grid.innerHTML = `<p class="alert alert-error">${escapeHtml(errorText(err))}</p>`;
    }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); page = 1; load(); });
  form.querySelectorAll('select').forEach((s) => s.addEventListener('change', () => { page = 1; load(); }));
  prevBtn.addEventListener('click', () => { page--; load(); window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' }); });
  nextBtn.addEventListener('click', () => { page++; load(); window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' }); });

  api('/items/stats').then((s) => {
    document.getElementById('statLost').textContent = s.lost;
    document.getElementById('statFound').textContent = s.found;
    document.getElementById('statResolved').textContent = s.resolved;
  }).catch(() => {});

  load();
});
