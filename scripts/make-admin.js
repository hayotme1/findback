// Foydalanuvchini admin qilish:  npm run make-admin -- email@example.com
const db = require('../db');

const email = String(process.argv[2] || '').trim().toLowerCase();
if (!email) {
  console.log('Foydalanish: npm run make-admin -- email@example.com');
  process.exit(1);
}

const info = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
if (info.changes) {
  console.log(`✔ ${email} endi admin. Saytdan chiqib, qayta kiring.`);
} else {
  console.log(`✘ ${email} topilmadi. Avval shu email bilan saytda ro'yxatdan o'ting.`);
  process.exit(1);
}
