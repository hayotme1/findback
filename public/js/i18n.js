// Ikki tilli matnlar: o'zbek (uz) va ingliz (en)
const I18N = {
  uz: {
    'nav.home': 'Bosh sahifa',
    'nav.post': 'E\'lon joylash',
    'nav.profile': 'Kabinetim',
    'nav.login': 'Kirish',
    'nav.register': 'Ro\'yxatdan o\'tish',
    'nav.logout': 'Chiqish',

    'hero.title': 'Yo\'qotdingizmi? Topdingizmi?',
    'hero.subtitle': 'Universitet hududida yo\'qolgan va topilgan buyumlarni egasiga qaytaramiz.',
    'hero.lost': 'Yo\'qotdim',
    'hero.found': 'Topdim',
    'stats.lost': 'Yo\'qolgan',
    'stats.found': 'Topilgan',
    'stats.resolved': 'Egasiga qaytarilgan',

    'filter.search': 'Qidirish: nomi, tavsifi yoki joyi…',
    'filter.allTypes': 'Barcha turlar',
    'filter.allCategories': 'Barcha kategoriyalar',
    'filter.active': 'Faol e\'lonlar',
    'filter.resolved': 'Hal qilinganlar',
    'filter.submit': 'Qidirish',
    'list.empty': 'Hech narsa topilmadi.',
    'list.prev': '← Oldingi',
    'list.next': 'Keyingi →',
    'list.page': 'Sahifa {page} / {pages}',

    'type.lost': 'Yo\'qolgan',
    'type.found': 'Topilgan',
    'status.active': 'Faol',
    'status.resolved': 'Hal qilindi',

    'cat.electronics': 'Elektronika',
    'cat.documents': 'Hujjatlar',
    'cat.keys': 'Kalitlar',
    'cat.bags': 'Sumkalar',
    'cat.clothing': 'Kiyim-kechak',
    'cat.accessories': 'Aksessuarlar',
    'cat.books': 'Kitob va daftarlar',
    'cat.other': 'Boshqa',

    'item.location': 'Joyi',
    'item.date': 'Sana',
    'item.category': 'Kategoriya',
    'item.postedBy': 'E\'lon beruvchi',
    'item.contact': 'Bog\'lanish',
    'item.faculty': 'Fakultet',
    'item.noDescription': 'Tavsif berilmagan.',
    'item.loginToContact': 'Aloqa ma\'lumotlarini ko\'rish uchun tizimga kiring.',
    'item.edit': 'Tahrirlash',
    'item.markResolved': 'Hal qilindi deb belgilash',
    'item.markActive': 'Qayta faollashtirish',
    'item.delete': 'O\'chirish',
    'item.confirmDelete': 'Rostdan ham bu e\'lonni o\'chirmoqchimisiz?',
    'item.back': '← Orqaga',
    'item.notFound': 'E\'lon topilmadi.',

    'form.newTitle': 'Yangi e\'lon',
    'form.editTitle': 'E\'lonni tahrirlash',
    'form.type': 'E\'lon turi',
    'form.title': 'Buyum nomi',
    'form.titlePh': 'Masalan: Qora rangli hamyon',
    'form.description': 'Tavsif',
    'form.descriptionPh': 'Rangi, belgilari, ichida nima borligi…',
    'form.category': 'Kategoriya',
    'form.location': 'Joyi',
    'form.locationPh': 'Masalan: 3-bino, 204-xona',
    'form.date': 'Sana',
    'form.image': 'Rasm (ixtiyoriy, 5 MB gacha)',
    'form.removeImage': 'Joriy rasmni o\'chirish',
    'form.submit': 'Saqlash',
    'form.saving': 'Saqlanmoqda…',

    'auth.loginTitle': 'Tizimga kirish',
    'auth.registerTitle': 'Ro\'yxatdan o\'tish',
    'auth.fullName': 'To\'liq ism',
    'auth.email': 'Email',
    'auth.password': 'Parol',
    'auth.passwordHint': 'Kamida 6 ta belgi',
    'auth.phone': 'Telefon (ixtiyoriy)',
    'auth.faculty': 'Fakultet (ixtiyoriy)',
    'auth.loginBtn': 'Kirish',
    'auth.registerBtn': 'Ro\'yxatdan o\'tish',
    'auth.noAccount': 'Akkauntingiz yo\'qmi?',
    'auth.haveAccount': 'Akkauntingiz bormi?',

    'profile.title': 'Mening kabinetim',
    'profile.myItems': 'Mening e\'lonlarim',
    'profile.empty': 'Sizda hali e\'lon yo\'q.',

    'footer.text': 'FindBack — universitet yo\'qolgan buyumlar xizmati',

    'err.auth_required': 'Iltimos, avval tizimga kiring.',
    'err.invalid_token': 'Sessiya tugadi. Qayta kiring.',
    'err.invalid_credentials': 'Email yoki parol noto\'g\'ri.',
    'err.email_taken': 'Bu email allaqachon ro\'yxatdan o\'tgan.',
    'err.invalid_name': 'Ismni to\'g\'ri kiriting.',
    'err.invalid_email': 'Email noto\'g\'ri.',
    'err.weak_password': 'Parol kamida 6 ta belgidan iborat bo\'lsin.',
    'err.invalid_type': 'E\'lon turini tanlang.',
    'err.invalid_title': 'Buyum nomini kiriting (2–120 belgi).',
    'err.invalid_description': 'Tavsif juda uzun.',
    'err.invalid_category': 'Kategoriyani tanlang.',
    'err.invalid_location': 'Joyni kiriting.',
    'err.invalid_date': 'Sanani kiriting.',
    'err.invalid_image': 'Faqat JPG, PNG, WEBP yoki GIF rasm yuklang.',
    'err.image_too_large': 'Rasm hajmi 5 MB dan oshmasin.',
    'err.forbidden': 'Bu amalga ruxsatingiz yo\'q.',
    'err.not_found': 'Topilmadi.',
    'err.network': 'Server bilan aloqa yo\'q.',
    'err.server_error': 'Serverda xatolik yuz berdi.',
  },

  en: {
    'nav.home': 'Home',
    'nav.post': 'Post an item',
    'nav.profile': 'My account',
    'nav.login': 'Log in',
    'nav.register': 'Sign up',
    'nav.logout': 'Log out',

    'hero.title': 'Lost something? Found something?',
    'hero.subtitle': 'We help return items lost and found on campus to their owners.',
    'hero.lost': 'I lost something',
    'hero.found': 'I found something',
    'stats.lost': 'Lost',
    'stats.found': 'Found',
    'stats.resolved': 'Returned to owner',

    'filter.search': 'Search by name, description or place…',
    'filter.allTypes': 'All types',
    'filter.allCategories': 'All categories',
    'filter.active': 'Active posts',
    'filter.resolved': 'Resolved',
    'filter.submit': 'Search',
    'list.empty': 'Nothing found.',
    'list.prev': '← Previous',
    'list.next': 'Next →',
    'list.page': 'Page {page} of {pages}',

    'type.lost': 'Lost',
    'type.found': 'Found',
    'status.active': 'Active',
    'status.resolved': 'Resolved',

    'cat.electronics': 'Electronics',
    'cat.documents': 'Documents',
    'cat.keys': 'Keys',
    'cat.bags': 'Bags',
    'cat.clothing': 'Clothing',
    'cat.accessories': 'Accessories',
    'cat.books': 'Books & notebooks',
    'cat.other': 'Other',

    'item.location': 'Location',
    'item.date': 'Date',
    'item.category': 'Category',
    'item.postedBy': 'Posted by',
    'item.contact': 'Contact',
    'item.faculty': 'Faculty',
    'item.noDescription': 'No description provided.',
    'item.loginToContact': 'Log in to see contact details.',
    'item.edit': 'Edit',
    'item.markResolved': 'Mark as resolved',
    'item.markActive': 'Reactivate',
    'item.delete': 'Delete',
    'item.confirmDelete': 'Are you sure you want to delete this post?',
    'item.back': '← Back',
    'item.notFound': 'Post not found.',

    'form.newTitle': 'New post',
    'form.editTitle': 'Edit post',
    'form.type': 'Post type',
    'form.title': 'Item name',
    'form.titlePh': 'e.g. Black leather wallet',
    'form.description': 'Description',
    'form.descriptionPh': 'Color, marks, what was inside…',
    'form.category': 'Category',
    'form.location': 'Location',
    'form.locationPh': 'e.g. Building 3, room 204',
    'form.date': 'Date',
    'form.image': 'Photo (optional, up to 5 MB)',
    'form.removeImage': 'Remove current photo',
    'form.submit': 'Save',
    'form.saving': 'Saving…',

    'auth.loginTitle': 'Log in',
    'auth.registerTitle': 'Create an account',
    'auth.fullName': 'Full name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.passwordHint': 'At least 6 characters',
    'auth.phone': 'Phone (optional)',
    'auth.faculty': 'Faculty (optional)',
    'auth.loginBtn': 'Log in',
    'auth.registerBtn': 'Sign up',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.haveAccount': 'Already have an account?',

    'profile.title': 'My account',
    'profile.myItems': 'My posts',
    'profile.empty': 'You have no posts yet.',

    'footer.text': 'FindBack — campus lost & found service',

    'err.auth_required': 'Please log in first.',
    'err.invalid_token': 'Your session has expired. Please log in again.',
    'err.invalid_credentials': 'Wrong email or password.',
    'err.email_taken': 'This email is already registered.',
    'err.invalid_name': 'Please enter your name.',
    'err.invalid_email': 'Invalid email.',
    'err.weak_password': 'Password must be at least 6 characters.',
    'err.invalid_type': 'Choose a post type.',
    'err.invalid_title': 'Enter the item name (2–120 characters).',
    'err.invalid_description': 'Description is too long.',
    'err.invalid_category': 'Choose a category.',
    'err.invalid_location': 'Enter the location.',
    'err.invalid_date': 'Enter the date.',
    'err.invalid_image': 'Only JPG, PNG, WEBP or GIF images are allowed.',
    'err.image_too_large': 'Image must be under 5 MB.',
    'err.forbidden': 'You are not allowed to do this.',
    'err.not_found': 'Not found.',
    'err.network': 'Cannot reach the server.',
    'err.server_error': 'Something went wrong on the server.',
  },
};

function getLang() {
  try { return localStorage.getItem('lang') === 'en' ? 'en' : 'uz'; } catch { return 'uz'; }
}

function setLang(lang) {
  try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
  location.reload();
}

// t('list.page', { page: 1, pages: 3 })
function t(key, vars) {
  const dict = I18N[getLang()];
  let s = dict[key] ?? I18N.uz[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

// HTML'dagi data-i18n, data-i18n-placeholder atributlarini tarjima qiladi
function applyTranslations(root = document) {
  document.documentElement.lang = getLang();
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
}
