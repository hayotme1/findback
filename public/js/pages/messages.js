document.addEventListener('DOMContentLoaded', () => {
  if (!requireLogin()) return;

  const chat = document.getElementById('chat');
  const list = document.getElementById('chatList');
  const thread = document.getElementById('thread');
  const alertBox = document.getElementById('alert');
  const me = Auth.user;

  let current = null; // { item, with }
  let lastId = 0;
  let timer = null;

  function timeText(sqlDate) {
    const d = new Date(sqlDate.replace(' ', 'T') + 'Z');
    const today = new Date().toDateString() === d.toDateString();
    return today
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async function loadList() {
    try {
      const { conversations } = await api('/messages');
      if (!conversations.length && !current) {
        list.innerHTML = `<p class="muted chat-empty">${escapeHtml(t('msg.empty'))}</p>`;
        return;
      }
      list.innerHTML = conversations.map((c) => {
        const active = current && current.item === c.item_id && current.with === c.other_id;
        const prefix = c.last_sender_id === me.id ? `${t('msg.you')}: ` : '';
        return `
          <a class="chat-row ${active ? 'active' : ''}" href="?item=${c.item_id}&with=${c.other_id}" data-item="${c.item_id}" data-with="${c.other_id}">
            <div class="avatar sm">${escapeHtml(c.other_name.charAt(0).toUpperCase())}</div>
            <div class="chat-row-body">
              <div class="chat-row-top"><b>${escapeHtml(c.other_name)}</b><small>${timeText(c.last_at)}</small></div>
              <div class="chat-row-item"><span class="dot dot-${c.item_type}"></span>${escapeHtml(c.item_title)}</div>
              <div class="chat-row-last">${escapeHtml(prefix + c.last_body)}</div>
            </div>
            ${c.unread ? `<span class="nav-badge">${c.unread}</span>` : ''}
          </a>`;
      }).join('');
    } catch (err) {
      showAlert(alertBox, errorText(err));
    }
  }

  function bubble(m) {
    const mine = m.sender_id === me.id;
    return `<div class="bubble ${mine ? 'mine' : ''}"><p>${escapeHtml(m.body)}</p><small>${timeText(m.created_at)}</small></div>`;
  }

  async function openThread(itemId, withId, { silent = false } = {}) {
    current = { item: itemId, with: withId };
    if (!silent) {
      chat.classList.add('has-thread');
      thread.innerHTML = '<div class="loader"></div>';
    }
    try {
      const data = await api(`/messages/thread?item=${itemId}&with=${withId}`);
      const newest = data.messages.length ? data.messages[data.messages.length - 1].id : 0;
      if (silent && newest === lastId) return;
      lastId = newest;

      const box = thread.querySelector('.messages');
      if (silent && box) {
        const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
        box.innerHTML = data.messages.map(bubble).join('');
        if (atBottom) box.scrollTop = box.scrollHeight;
        loadList();
        updateUnreadBadge();
        return;
      }

      thread.innerHTML = `
        <header class="thread-head">
          <button type="button" class="linklike thread-back">${escapeHtml(t('msg.back'))}</button>
          <div class="avatar sm">${escapeHtml(data.other.full_name.charAt(0).toUpperCase())}</div>
          <div>
            <b>${escapeHtml(data.other.full_name)}</b>
            <a class="thread-item" href="/item.html?id=${data.item.id}">
              <span class="badge badge-${data.item.type}">${escapeHtml(t(`type.${data.item.type}`))}</span> ${escapeHtml(data.item.title)}</a>
          </div>
        </header>
        <div class="messages">${data.messages.length ? data.messages.map(bubble).join('') : `<p class="muted center chat-hint">${escapeHtml(t('msg.first'))}</p>`}</div>
        <form class="composer">
          <textarea name="body" rows="1" maxlength="2000" required placeholder="${escapeHtml(t('msg.placeholder'))}"></textarea>
          <button type="submit" class="btn">${escapeHtml(t('msg.send'))}</button>
        </form>`;

      const box2 = thread.querySelector('.messages');
      box2.scrollTop = box2.scrollHeight;
      const form = thread.querySelector('.composer');
      const input = form.elements.body;
      input.focus();
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
      });
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = input.value.trim();
        if (!body) return;
        input.disabled = true;
        try {
          await api('/messages', { method: 'POST', body: { item_id: itemId, recipient_id: withId, body } });
          input.value = '';
          await openThread(itemId, withId, { silent: true });
          const b = thread.querySelector('.messages');
          b.scrollTop = b.scrollHeight;
        } catch (err) {
          showAlert(alertBox, errorText(err));
        } finally {
          input.disabled = false;
          input.focus();
        }
      });
      thread.querySelector('.thread-back').addEventListener('click', () => {
        chat.classList.remove('has-thread');
        history.replaceState(null, '', location.pathname);
      });

      loadList();
      updateUnreadBadge();
    } catch (err) {
      thread.innerHTML = '';
      showAlert(alertBox, errorText(err));
    }
  }

  list.addEventListener('click', (e) => {
    const row = e.target.closest('.chat-row');
    if (!row) return;
    e.preventDefault();
    history.replaceState(null, '', row.getAttribute('href'));
    alertBox.hidden = true;
    openThread(Number(row.dataset.item), Number(row.dataset.with));
  });

  const startItem = Number(qs('item'));
  const startWith = Number(qs('with'));
  loadList();
  if (startItem && startWith) openThread(startItem, startWith);

  // Har 5 soniyada yangi xabarlarni tekshiramiz
  timer = setInterval(() => {
    if (document.hidden) return;
    if (current) openThread(current.item, current.with, { silent: true });
    else loadList();
  }, 5000);
  window.addEventListener('beforeunload', () => clearInterval(timer));
});
