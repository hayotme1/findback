// Asosiy sozlamalar. Ishlab chiqarishda (production) JWT_SECRET ni albatta
// muhit o'zgaruvchisi orqali bering.
const JWT_SECRET = process.env.JWT_SECRET || 'findback-dev-secret-change-me';

if (!process.env.JWT_SECRET) {
  console.warn('[!] JWT_SECRET o\'rnatilmagan — vaqtinchalik (dev) kalit ishlatilmoqda.');
}

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET,
  JWT_EXPIRES_IN: '7d',
  CATEGORIES: ['electronics', 'documents', 'keys', 'bags', 'clothing', 'accessories', 'books', 'other'],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
  // Shu email bilan ro'yxatdan o'tgan foydalanuvchi avtomatik admin bo'ladi
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
};
