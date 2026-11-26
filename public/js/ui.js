// Umumiy UI: navbar, footer, kartochkalar va yordamchi funksiyalar

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

const ICONS = {
  location: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  tag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
  image: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/></svg>',
};

function renderHeader() {
  const user = Auth.user;
  const lang = getLang();
  const here = location.pathname.replace(/\/$/, '/index.html');
  const link = (href, key) =>
    `<a href="${href}" class="${here.endsWith(href) ? 'active' : ''}">${escapeHtml(t(key))}</a>`;

  const authLinks = Auth.loggedIn
    ? `${link('/profile.html', 'nav.profile')}
       <button type="button" class="linklike" id="logoutBtn">${escapeHtml(t('nav.logout'))}</button>`
    : `${link('/login.html', 'nav.login')}
       <a href="/register.html" class="btn btn-sm">${escapeHtml(t('nav.register'))}</a>`;

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="container header-inner">
      <a href="/" class="logo"><span class="logo-mark">F</span>FindBack</a>
      <button type="button" class="menu-toggle" aria-label="Menu" aria-expanded="false">☰</button>
      <nav class="nav">
        ${link('/index.html', 'nav.home')}
        ${link('/new.html', 'nav.post')}
        ${authLinks}
        <div class="lang-switch" role="group" aria-label="Language">
          <button type="button" data-lang="uz" class="${lang === 'uz' ? 'on' : ''}">UZ</button>
          <button type="button" data-lang="en" class="${lang === 'en' ? 'on' : ''}">EN</button>
        </div>
      </nav>
    </div>`;
  document.body.prepend(header);

  header.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  const logout = header.querySelector('#logoutBtn');
  if (logout) logout.addEventListener('click', () => { Auth.clear(); location.href = '/'; });
  const toggle = header.querySelector('.menu-toggle');
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  if (user) header.querySelector('.nav').title = user.full_name;
}

function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `<div class="container">© ${new Date().getFullYear()} ${escapeHtml(t('footer.text'))}</div>`;
  document.body.append(footer);
}

function itemCard(item) {
  const img = item.image
    ? `<img src="/uploads/${encodeURIComponent(item.image)}" alt="" loading="lazy">`
    : `<div class="no-image">${ICONS.image}</div>`;
  return `
    <a class="card" href="/item.html?id=${item.id}">
      <div class="card-media">
        ${img}
        <span class="badge badge-${item.type}">${escapeHtml(t(`type.${item.type}`))}</span>
        ${item.status === 'resolved' ? `<span class="badge badge-resolved">${escapeHtml(t('status.resolved'))}</span>` : ''}
      </div>
      <div class="card-body">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="meta">${ICONS.location}<span>${escapeHtml(item.location)}</span></p>
        <p class="meta">${ICONS.calendar}<span>${formatDate(item.event_date)}</span>
          <span class="chip">${escapeHtml(t(`cat.${item.category}`))}</span></p>
      </div>
    </a>`;
}

function showAlert(el, message, kind = 'error') {
  el.className = `alert alert-${kind}`;
  el.textContent = message;
  el.hidden = false;
}

// Tizimga kirmagan bo'lsa login sahifasiga yo'naltiradi
function requireLogin() {
  if (!Auth.loggedIn) {
    location.href = `/login.html?next=${encodeURIComponent(location.pathname + location.search)}`;
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  applyTranslations();
});

const CATEGORIES = ['electronics', 'documents', 'keys', 'bags', 'clothing', 'accessories', 'books', 'other'];

function fillCategorySelect(select) {
  for (const c of CATEGORIES) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = t(`cat.${c}`);
    select.append(opt);
  }
}
