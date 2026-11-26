const path = require('path');
const express = require('express');
const { PORT, CATEGORIES, ADMIN_EMAIL } = require('./config');
const db = require('./db');

// ADMIN_EMAIL berilgan bo'lsa, o'sha foydalanuvchini admin qilamiz
if (ADMIN_EMAIL) db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(ADMIN_EMAIL);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik fayllar: frontend va yuklangan rasmlar
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API
app.get('/api/categories', (req, res) => res.json({ categories: CATEGORIES }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));

app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));

// Xatolarni ushlash (masalan, rasm juda katta bo'lsa)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'image_too_large' });
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'server_error' });
});

app.listen(PORT, () => {
  console.log(`FindBack ishga tushdi: http://localhost:${PORT}`);
});
