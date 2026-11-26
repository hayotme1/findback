document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const alertBox = document.getElementById('alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await api('/auth/register', { method: 'POST', body: Object.fromEntries(new FormData(form)) });
      Auth.save(token, user);
      location.href = '/';
    } catch (err) {
      showAlert(alertBox, errorText(err));
    }
  });
});
