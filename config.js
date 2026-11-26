// Asosiy sozlamalar
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Tokenlarni imzolash uchun maxfiy kalit. JWT_SECRET berilmagan bo'lsa,
// birinchi ishga tushishda tasodifiy kalit yaratilib data/jwt-secret fayliga
// saqlanadi (bu fayl gitga kirmaydi), shuning uchun kodni ko'rgan odam uni bilmaydi.
function loadSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const file = path.join(__dirname, 'data', 'jwt-secret');
  try {
    return fs.readFileSync(file, 'utf8').trim();
  } catch {
    const secret = crypto.randomBytes(48).toString('hex');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, secret, { mode: 0o600 });
    return secret;
  }
}
const JWT_SECRET = loadSecret();

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET,
  JWT_EXPIRES_IN: '7d',
  CATEGORIES: ['electronics', 'documents', 'keys', 'bags', 'clothing', 'accessories', 'books', 'other'],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
  // Shu email bilan ro'yxatdan o'tgan foydalanuvchi avtomatik admin bo'ladi
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
};
