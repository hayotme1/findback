const fs = require('fs');
const path = require('path');
const express = require('express');
const db = require('../db');
const { CATEGORIES } = require('../config');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const PAGE_SIZE = 12;

function removeImage(filename) {
  if (!filename) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(filename)), () => {});
}

// Forma ma'lumotlarini tekshiradi; xato bo'lsa { error } qaytaradi.
function validateItem(body) {
  const data = {
    type: String(body.type || ''),
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    category: String(body.category || ''),
    location: String(body.location || '').trim(),
    event_date: String(body.event_date || ''),
  };
  if (!['lost', 'found'].includes(data.type)) return { error: 'invalid_type' };
  if (data.title.length < 2 || data.title.length > 120) return { error: 'invalid_title' };
  if (data.description.length > 2000) return { error: 'invalid_description' };
  if (!CATEGORIES.includes(data.category)) return { error: 'invalid_category' };
  if (data.location.length < 2 || data.location.length > 200) return { error: 'invalid_location' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.event_date)) return { error: 'invalid_date' };
  return { data };
}

const SELECT_ITEM = `
  SELECT i.*, u.full_name AS owner_name
  FROM items i JOIN users u ON u.id = i.user_id
`;

// GET /api/items?q=&type=&category=&status=&page=
router.get('/', (req, res) => {
  const where = [];
  const params = [];
  const { q, type, category } = req.query;
  const status = req.query.status || 'active';

  if (q) {
    where.push('(i.title LIKE ? OR i.description LIKE ? OR i.location LIKE ?)');
    const like = `%${String(q).trim()}%`;
    params.push(like, like, like);
  }
  if (type === 'lost' || type === 'found') { where.push('i.type = ?'); params.push(type); }
  if (CATEGORIES.includes(category)) { where.push('i.category = ?'); params.push(category); }
  if (status === 'active' || status === 'resolved') { where.push('i.status = ?'); params.push(status); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const total = db.prepare(`SELECT COUNT(*) AS n FROM items i ${whereSql}`).get(...params).n;
  const items = db
    .prepare(`${SELECT_ITEM} ${whereSql} ORDER BY i.created_at DESC, i.id DESC LIMIT ? OFFSET ?`)
    .all(...params, PAGE_SIZE, (page - 1) * PAGE_SIZE);

  res.json({ items, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), total });
});

// GET /api/items/stats — bosh sahifadagi raqamlar
router.get('/stats', (req, res) => {
  const row = db.prepare(`
    SELECT
      SUM(CASE WHEN type = 'lost'  AND status = 'active' THEN 1 ELSE 0 END) AS lost,
      SUM(CASE WHEN type = 'found' AND status = 'active' THEN 1 ELSE 0 END) AS found,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
    FROM items
  `).get();
  res.json({ lost: row.lost || 0, found: row.found || 0, resolved: row.resolved || 0 });
});

// GET /api/items/mine — foydalanuvchining o'z e'lonlari
router.get('/mine', requireAuth, (req, res) => {
  const items = db.prepare(`${SELECT_ITEM} WHERE i.user_id = ? ORDER BY i.created_at DESC, i.id DESC`).all(req.user.id);
  res.json({ items });
});

// Matnni so'zlarga ajratadi (3 harfdan uzunlari, kichik harflarda)
function words(text) {
  return new Set(String(text || '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 3));
}
function overlap(a, b) {
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return n;
}

// GET /api/items/:id/similar — qarama-qarshi turdagi (yo'qolgan ↔ topilgan) o'xshash e'lonlar
router.get('/:id/similar', (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });

  const candidates = db.prepare(`${SELECT_ITEM}
    WHERE i.type = ? AND i.status = 'active' AND i.user_id != ?
    ORDER BY i.created_at DESC LIMIT 300`).all(item.type === 'lost' ? 'found' : 'lost', item.user_id);

  const title = words(item.title);
  const desc = words(item.description);
  const loc = words(item.location);
  const day = 24 * 60 * 60 * 1000;
  const itemTime = Date.parse(item.event_date);

  const scored = candidates.map((c) => {
    const cTitle = words(c.title);
    const cDesc = words(c.description);
    let score = 0;
    if (c.category === item.category) score += 3;
    score += 3 * overlap(title, cTitle);
    score += overlap(title, cDesc) + overlap(desc, cTitle) + overlap(desc, cDesc);
    score += 2 * overlap(loc, words(c.location));
    const days = Math.abs(Date.parse(c.event_date) - itemTime) / day;
    if (days <= 7) score += 2; else if (days <= 30) score += 1;
    return { ...c, score };
  });

  // Yetarlicha o'xshashlarini qoldiramiz (kategoriya, umumiy so'zlar, yaqin sana)
  const items = scored
    .filter((c) => c.score >= 4)
    .sort((a, b) => b.score - a.score || b.id - a.id)
    .slice(0, 4);
  res.json({ items });
});

// GET /api/items/:id — bitta e'lon (egasining aloqa ma'lumotlari bilan)
router.get('/:id', (req, res) => {
  const item = db.prepare(`
    SELECT i.*, u.full_name AS owner_name, u.email AS owner_email, u.phone AS owner_phone, u.faculty AS owner_faculty
    FROM items i JOIN users u ON u.id = i.user_id WHERE i.id = ?
  `).get(req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json({ item });
});

// POST /api/items — yangi e'lon
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  const { data, error } = validateItem(req.body);
  if (error) { removeImage(req.file && req.file.filename); return res.status(400).json({ error }); }

  const info = db.prepare(`
    INSERT INTO items (user_id, type, title, description, category, location, event_date, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, data.type, data.title, data.description, data.category, data.location, data.event_date,
    req.file ? req.file.filename : null);

  res.status(201).json({ item: db.prepare(`${SELECT_ITEM} WHERE i.id = ?`).get(info.lastInsertRowid) });
});

// Faqat e'lon egasiga ruxsat beradi
function loadOwnItem(req, res, next) {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  const fail = (code, error) => { removeImage(req.file && req.file.filename); res.status(code).json({ error }); };
  if (!item) return fail(404, 'not_found');
  if (item.user_id !== req.user.id) return fail(403, 'forbidden');
  req.item = item;
  next();
}

// PUT /api/items/:id — tahrirlash
router.put('/:id', requireAuth, upload.single('image'), loadOwnItem, (req, res) => {
  const { data, error } = validateItem(req.body);
  if (error) { removeImage(req.file && req.file.filename); return res.status(400).json({ error }); }

  let image = req.item.image;
  if (req.file) { removeImage(image); image = req.file.filename; }
  else if (req.body.remove_image === '1') { removeImage(image); image = null; }

  db.prepare(`
    UPDATE items SET type = ?, title = ?, description = ?, category = ?, location = ?, event_date = ?, image = ?
    WHERE id = ?
  `).run(data.type, data.title, data.description, data.category, data.location, data.event_date, image, req.item.id);

  res.json({ item: db.prepare(`${SELECT_ITEM} WHERE i.id = ?`).get(req.item.id) });
});

// PATCH /api/items/:id/status — "topildi/qaytarildi" yoki qayta faollashtirish
router.patch('/:id/status', requireAuth, loadOwnItem, (req, res) => {
  const status = req.body.status;
  if (!['active', 'resolved'].includes(status)) return res.status(400).json({ error: 'invalid_status' });
  db.prepare('UPDATE items SET status = ? WHERE id = ?').run(status, req.item.id);
  res.json({ ok: true, status });
});

// DELETE /api/items/:id
router.delete('/:id', requireAuth, loadOwnItem, (req, res) => {
  db.prepare('DELETE FROM items WHERE id = ?').run(req.item.id);
  removeImage(req.item.image);
  res.json({ ok: true });
});

module.exports = router;
