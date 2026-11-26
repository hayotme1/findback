const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const db = require('../db');

// Tokenni tekshiradi. Token bo'lmasa yoki noto'g'ri bo'lsa 401 qaytaradi.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'auth_required' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id };
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}

// Faqat adminlar uchun (requireAuth dan keyin ishlatiladi)
function requireAdmin(req, res, next) {
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  next();
}

module.exports = { requireAuth, requireAdmin };
