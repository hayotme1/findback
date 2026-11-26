# FindBack 🔎

Universitet hududida **yo'qolgan va topilgan buyumlar** platformasi (Lost & Found).
Sayt o'zbek va ingliz tillarida ishlaydi.

## Imkoniyatlar

- Ro'yxatdan o'tish va tizimga kirish (parollar bcrypt bilan shifrlanadi, JWT token)
- "Yo'qotdim" / "Topdim" e'lonlarini rasm bilan joylash
- Qidiruv hamda tur, kategoriya va holat bo'yicha filtrlash, sahifalash
- E'lon sahifasida egasining aloqa ma'lumotlari (faqat tizimga kirganlar uchun)
- O'z e'lonini tahrirlash, o'chirish, "hal qilindi" deb belgilash
- Shaxsiy kabinet
- **Sayt ichida xabar yozish (chat)**: e'lon egasi bilan to'g'ridan-to'g'ri yozishish, o'qilmagan xabarlar soni menyuda
- **O'xshash e'lonlar**: yo'qolgan buyum sahifasida unga mos topilgan e'lonlar (va aksincha) avtomatik ko'rsatiladi
- **Admin panel**: statistika, barcha e'lonlar va foydalanuvchilarni boshqarish (o'chirish, admin qilish)
- UZ / EN til almashtirish, telefon uchun moslashgan dizayn, qorong'i rejim

## Texnologiyalar

| Qism | Texnologiya |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| Ma'lumotlar bazasi | SQLite (Node.js'ga o'rnatilgan `node:sqlite`) |
| Rasm yuklash | Multer |
| Autentifikatsiya | bcryptjs + JSON Web Token |

## Ishga tushirish

Kompyuterda [Node.js](https://nodejs.org) (22.13 yoki undan yangi versiya) o'rnatilgan bo'lishi kerak.

```bash
npm install
npm start
```

Brauzerda oching: http://localhost:3000

Kod o'zgarganda server avtomatik qayta ishga tushishi uchun: `npm run dev`.

### Admin qilish

Avval saytda oddiy ro'yxatdan o'ting, keyin terminalda:

```bash
npm run make-admin -- sizning@email.uz
```

Saytdan chiqib, qayta kiring — menyuda **Admin** bo'limi paydo bo'ladi.

### Sozlamalar (ixtiyoriy)

| O'zgaruvchi | Vazifasi | Standart qiymat |
|---|---|---|
| `PORT` | Server porti | `3000` |
| `JWT_SECRET` | Tokenlar uchun maxfiy kalit (internetga joylashda **albatta** o'rnating) | dev kalit |
| `ADMIN_EMAIL` | Shu email egasi avtomatik admin bo'ladi | — |
| `DB_PATH` | Ma'lumotlar bazasi fayli | `data/findback.db` |

## Loyiha tuzilmasi

```
findback/
├── server.js            # Express server
├── config.js            # Sozlamalar va kategoriyalar
├── db.js                # SQLite jadvallari
├── middleware/
│   ├── auth.js          # JWT tekshiruvi
│   └── upload.js        # Rasm yuklash (multer)
├── routes/
│   ├── auth.js          # /api/auth — ro'yxatdan o'tish, kirish
│   ├── items.js         # /api/items — e'lonlar va o'xshash e'lonlar
│   ├── messages.js      # /api/messages — chat
│   └── admin.js         # /api/admin — admin panel
├── scripts/
│   └── make-admin.js    # Foydalanuvchini admin qilish
├── public/              # Frontend
│   ├── index.html       # Bosh sahifa: e'lonlar ro'yxati
│   ├── item.html        # Bitta e'lon
│   ├── new.html         # E'lon joylash / tahrirlash
│   ├── messages.html    # Xabarlar (chat)
│   ├── admin.html       # Admin panel
│   ├── login.html, register.html, profile.html
│   ├── css/style.css
│   └── js/
│       ├── i18n.js      # UZ/EN tarjimalar
│       ├── api.js       # Backend bilan ishlash
│       ├── ui.js        # Umumiy UI (menyu, kartochkalar)
│       └── pages/       # Har bir sahifaning skripti
├── data/                # SQLite fayli (gitga kirmaydi)
└── uploads/             # Yuklangan rasmlar (gitga kirmaydi)
```

## API

| Metod | Yo'l | Tavsif |
|---|---|---|
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Kirish |
| GET | `/api/auth/me` | Joriy foydalanuvchi 🔒 |
| GET | `/api/items?q=&type=&category=&status=&page=` | E'lonlar ro'yxati |
| GET | `/api/items/stats` | Statistika |
| GET | `/api/items/mine` | Mening e'lonlarim 🔒 |
| GET | `/api/items/:id` | Bitta e'lon |
| POST | `/api/items` | Yangi e'lon (multipart, `image` maydoni) 🔒 |
| PUT | `/api/items/:id` | Tahrirlash 🔒 (faqat egasi) |
| PATCH | `/api/items/:id/status` | `active` / `resolved` 🔒 (faqat egasi) |
| DELETE | `/api/items/:id` | O'chirish 🔒 (faqat egasi) |
| GET | `/api/items/:id/similar` | O'xshash e'lonlar |
| GET | `/api/messages` | Suhbatlar ro'yxati 🔒 |
| GET | `/api/messages/unread` | O'qilmagan xabarlar soni 🔒 |
| GET | `/api/messages/thread?item=&with=` | Bitta suhbat 🔒 |
| POST | `/api/messages` | Xabar yuborish `{ item_id, recipient_id, body }` 🔒 |
| GET | `/api/admin/stats`, `/api/admin/items`, `/api/admin/users` | Admin ma'lumotlari 🛡 |
| DELETE | `/api/admin/items/:id`, `/api/admin/users/:id` | Admin o'chirishi 🛡 |
| PATCH | `/api/admin/users/:id/role` | Rolni o'zgartirish `{ role }` 🛡 |

🔒 — `Authorization: Bearer <token>` sarlavhasi kerak. 🛡 — faqat adminlar uchun.
