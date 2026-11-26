const fs = require('fs');
const path = require('path');
const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
function removeImage(filename) {
  if (filename) fs.unlink(path.join(UPLOAD_DIR, path.basename(filename)), () => {});
}

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  const one = (sql) => db.prepare(sql).get().n;
  res.json({
    users: one('SELECT COUNT(*) AS n FROM users'),
    items: one('SELECT COUNT(*) AS n FROM items'),
    lost: one("SELECT COUNT(*) AS n FROM items WHERE type = 'lost' AND status = 'active'"),
    found: one("SELECT COUNT(*) AS n FROM items WHERE type = 'found' AND status = 'active'"),
    resolved: one("SELECT COUNT(*) AS n FROM items WHERE status = 'resolved'"),
    messages: one('SELECT COUNT(*) AS n FROM messages'),
  });
});

// GET /api/admin/items?q= — barcha e'lonlar (har qanday holatda)
router.get('/items', (req, res) => {
  const q = String(req.query.q || '').trim();
  const like = `%${q}%`;
  const items = db.prepare(`
    SELECT i.id, i.type, i.title, i.category, i.location, i.status, i.created_at, i.user_id,
           u.full_name AS owner_name, u.email AS owner_email
    FROM items i JOIN users u ON u.id = i.user_id
    WHERE (? = '' OR i.title LIKE ? OR i.location LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)
    ORDER BY i.id DESC LIMIT 500
  `).all(q, like, like, like, like);
  res.json({ items });
});

// DELETE /api/admin/items/:id
router.delete('/items/:id', (req, res) => {
  const item = db.prepare('SELECT id, image FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });
  db.prepare('DELETE FROM items WHERE id = ?').run(item.id);
  removeImage(item.image);
  res.json({ ok: true });
});

// GET /api/admin/users?q=
router.get('/users', (req, res) => {
  const q = String(req.query.q || '').trim();
  const like = `%${q}%`;
  const users = db.prepare(`
    SELECT u.id, u.full_name, u.email, u.phone, u.faculty, u.role, u.created_at,
           (SELECT COUNT(*) FROM items i WHERE i.user_id = u.id) AS items_count
    FROM users u
    WHERE (? = '' OR u.full_name LIKE ? OR u.email LIKE ?)
    ORDER BY u.id DESC LIMIT 500
  `).all(q, like, like);
  res.json({ users });
});

// PATCH /api/admin/users/:id/role { role: 'user' | 'admin' }
router.patch('/users/:id/role', (req, res) => {
  const role = req.body.role;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'invalid_role' });
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'cannot_change_self' });
  const info = db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true, role });
});

// DELETE /api/admin/users/:id — foydalanuvchi va uning barcha e'lonlari
router.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'cannot_change_self' });
  const images = db.prepare('SELECT image FROM items WHERE user_id = ? AND image IS NOT NULL').all(id);
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  if (!info.changes) return res.status(404).json({ error: 'not_found' });
  images.forEach((r) => removeImage(r.image));
  res.json({ ok: true });
});

module.exports = router;
