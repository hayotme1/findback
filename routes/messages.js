const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Suhbat faqat e'lon egasi va boshqa bir foydalanuvchi o'rtasida bo'ladi.
// Suhbat (item_id, boshqa foydalanuvchi) juftligi bilan aniqlanadi.
function checkThread(meId, itemId, otherId) {
  const item = db.prepare('SELECT id, user_id, title, type, status, image FROM items WHERE id = ?').get(itemId);
  if (!item) return { error: 'not_found', code: 404 };
  const other = db.prepare('SELECT id, full_name FROM users WHERE id = ?').get(otherId);
  if (!other || other.id === meId) return { error: 'not_found', code: 404 };
  if (item.user_id !== meId && item.user_id !== other.id) return { error: 'forbidden', code: 403 };
  return { item, other };
}

// GET /api/messages — barcha suhbatlar ro'yxati
router.get('/', (req, res) => {
  const me = req.user.id;
  const conversations = db.prepare(`
    WITH threads AS (
      SELECT item_id,
             CASE WHEN sender_id = :me THEN recipient_id ELSE sender_id END AS other_id,
             MAX(id) AS last_id,
             SUM(CASE WHEN recipient_id = :me AND read_at IS NULL THEN 1 ELSE 0 END) AS unread
      FROM messages
      WHERE sender_id = :me OR recipient_id = :me
      GROUP BY item_id, other_id
    )
    SELECT t.item_id, t.other_id, t.unread,
           u.full_name AS other_name,
           i.title AS item_title, i.type AS item_type, i.image AS item_image,
           m.body AS last_body, m.sender_id AS last_sender_id, m.created_at AS last_at
    FROM threads t
    JOIN users u ON u.id = t.other_id
    JOIN items i ON i.id = t.item_id
    JOIN messages m ON m.id = t.last_id
    ORDER BY t.last_id DESC
  `).all({ me });
  res.json({ conversations });
});

// GET /api/messages/unread — o'qilmagan xabarlar soni (menyu uchun)
router.get('/unread', (req, res) => {
  const row = db.prepare('SELECT COUNT(*) AS n FROM messages WHERE recipient_id = ? AND read_at IS NULL').get(req.user.id);
  res.json({ unread: row.n });
});

// GET /api/messages/thread?item=ID&with=USER_ID — bitta suhbat
router.get('/thread', (req, res) => {
  const me = req.user.id;
  const { item, other, error, code } = checkThread(me, Number(req.query.item), Number(req.query.with));
  if (error) return res.status(code).json({ error });

  const messages = db.prepare(`
    SELECT id, sender_id, recipient_id, body, read_at, created_at FROM messages
    WHERE item_id = ? AND ((sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?))
    ORDER BY id
  `).all(item.id, me, other.id, other.id, me);

  db.prepare(`UPDATE messages SET read_at = datetime('now')
              WHERE item_id = ? AND sender_id = ? AND recipient_id = ? AND read_at IS NULL`).run(item.id, other.id, me);

  res.json({ item, other, messages });
});

// POST /api/messages { item_id, recipient_id, body }
router.post('/', (req, res) => {
  const me = req.user.id;
  const body = String(req.body.body || '').trim();
  if (!body || body.length > 2000) return res.status(400).json({ error: 'invalid_message' });

  const { item, other, error, code } = checkThread(me, Number(req.body.item_id), Number(req.body.recipient_id));
  if (error) return res.status(code).json({ error });

  const info = db.prepare('INSERT INTO messages (item_id, sender_id, recipient_id, body) VALUES (?, ?, ?, ?)')
    .run(item.id, me, other.id, body);
  const message = db.prepare('SELECT id, sender_id, recipient_id, body, read_at, created_at FROM messages WHERE id = ?')
    .get(info.lastInsertRowid);
  res.status(201).json({ message });
});

module.exports = router;
