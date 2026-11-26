document.addEventListener('DOMContentLoaded', async () => {
  if (!requireLogin()) return;

  const form = document.getElementById('itemForm');
  const alertBox = document.getElementById('alert');
  const submitBtn = form.querySelector('button[type="submit"]');
  const editId = qs('edit');

  fillCategorySelect(document.getElementById('categorySelect'));
  form.elements.event_date.value = new Date().toISOString().slice(0, 10);
  form.elements.event_date.max = form.elements.event_date.value;
  if (qs('type') === 'found') form.elements.type.value = 'found';

  if (editId) {
    document.getElementById('formTitle').textContent = t('form.editTitle');
    try {
      const { item } = await api(`/items/${encodeURIComponent(editId)}`);
      if (!Auth.user || item.user_id !== Auth.user.id) { showAlert(alertBox, t('err.forbidden')); form.hidden = true; return; }
      for (const name of ['type', 'title', 'category', 'location', 'event_date', 'description']) form.elements[name].value = item[name] || '';
      if (item.image) {
        const box = document.getElementById('currentImage');
        box.querySelector('img').src = `/uploads/${encodeURIComponent(item.image)}`;
        box.hidden = false;
      }
    } catch (err) {
      showAlert(alertBox, errorText(err));
      form.hidden = true;
      return;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = t('form.saving');
    try {
      const data = new FormData(form);
      if (!form.elements.image.files.length) data.delete('image');
      const { item } = await api(editId ? `/items/${encodeURIComponent(editId)}` : '/items', {
        method: editId ? 'PUT' : 'POST',
        form: data,
      });
      location.href = `/item.html?id=${item.id}`;
    } catch (err) {
      if (err.status === 401) return requireLogin();
      showAlert(alertBox, errorText(err));
      submitBtn.disabled = false;
      submitBtn.textContent = t('form.submit');
    }
  });
});
