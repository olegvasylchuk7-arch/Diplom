// Fallback-замовлення для роботи без БД.

export const ORDER_STATUSES = [
  { code: 'new',       name: 'Нове',         color: '#1976D2' },
  { code: 'paid',      name: 'Оплачено',     color: '#7B1FA2' },
  { code: 'packed',    name: 'Зібрано',      color: '#F57C00' },
  { code: 'shipped',   name: 'Відправлено',  color: '#0288D1' },
  { code: 'delivered', name: 'Доставлено',   color: '#388E3C' },
  { code: 'cancelled', name: 'Скасовано',    color: '#D32F2F' },
];

const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const SEED_ORDERS = [
  {
    id: 'ORD-2026-0418', customer: 'Андрій Коваленко', email: 'a.kov@gmail.com',
    phone: '+380 67 123 4567', date: daysAgo(0), total: 12480, status: 'new',
    items: [
      { productId: 1, qty: 6, price: 940 },
      { productId: 4, qty: 6, price: 1180 },
    ],
    shipping: { type: 'np-branch', city: 'Київ', branch: 'Відділення №42' },
    payment: 'liqpay',
  },
  {
    id: 'ORD-2026-0417', customer: 'Олена Мельник', email: 'olena.m@ukr.net',
    phone: '+380 50 555 1122', date: daysAgo(1), total: 8340, status: 'paid',
    items: [
      { productId: 2, qty: 6, price: 1390 },
    ],
    shipping: { type: 'np-branch', city: 'Львів', branch: 'Відділення №7' },
    payment: 'liqpay',
  },
  {
    id: 'ORD-2026-0416', customer: 'Сергій Шевченко', email: 'svshev@gmail.com',
    phone: '+380 93 008 4400', date: daysAgo(2), total: 5210, status: 'shipped',
    items: [
      { productId: 3, qty: 10, price: 520 },
    ],
    shipping: { type: 'np-poshtomat', city: 'Харків', branch: 'Поштомат №2541' },
    payment: 'cod',
  },
  {
    id: 'ORD-2026-0415', customer: 'Тарас Бойко', email: 'tarasik@email.ua',
    phone: '+380 96 712 3300', date: daysAgo(3), total: 18450, status: 'delivered',
    items: [
      { productId: 6, qty: 12, price: 1075 },
      { productId: 4, qty: 5, price: 1180 },
    ],
    shipping: { type: 'np-branch', city: 'Дніпро', branch: 'Відділення №15' },
    payment: 'liqpay',
  },
  {
    id: 'ORD-2026-0414', customer: 'ТОВ «БудКомфорт»', email: 'office@budkomfort.ua',
    phone: '+380 44 200 5050', date: daysAgo(4), total: 96400, status: 'delivered',
    items: [
      { productId: 1, qty: 60, price: 940 },
      { productId: 6, qty: 40, price: 1075 },
    ],
    shipping: { type: 'np-cargo', city: 'Київ', branch: 'Вантажне відділення №2' },
    payment: 'bank',
    isB2B: true,
  },
  {
    id: 'ORD-2026-0413', customer: 'Микола Гайдук', email: 'mhayduk@email.ua',
    phone: '+380 67 333 8821', date: daysAgo(5), total: 4150, status: 'delivered',
    items: [
      { productId: 12, qty: 6, price: 555 },
      { productId: 11, qty: 1, price: 605 },
    ],
    shipping: { type: 'np-poshtomat', city: 'Одеса', branch: 'Поштомат №312' },
    payment: 'liqpay',
  },
  {
    id: 'ORD-2026-0412', customer: 'Дмитро Поліщук', email: 'dpol@gmail.com',
    phone: '+380 50 612 7733', date: daysAgo(6), total: 6750, status: 'cancelled',
    items: [
      { productId: 11, qty: 10, price: 605 },
    ],
    shipping: { type: 'np-branch', city: 'Полтава', branch: 'Відділення №21' },
    payment: 'cod',
  },
  {
    id: 'ORD-2026-0411', customer: 'Ольга Литвин', email: 'olya.l@email.ua',
    phone: '+380 96 008 7411', date: daysAgo(7), total: 9450, status: 'delivered',
    items: [
      { productId: 2, qty: 5, price: 1390 },
      { productId: 12, qty: 4, price: 555 },
    ],
    shipping: { type: 'np-branch', city: 'Київ', branch: 'Відділення №103' },
    payment: 'liqpay',
  },
];

export const PROMOCODES_SEED = [
  { code: 'WELCOME10',  type: 'percent', value: 10, minOrder: 1500, active: true,
    description: 'Знижка для нових клієнтів', usedCount: 142 },
  { code: 'SPRING2026', type: 'percent', value: 7,  minOrder: 3000, active: true,
    description: 'Весняна акція 2026', usedCount: 38 },
  { code: 'FREEDLV',    type: 'shipping', value: 0, minOrder: 5000, active: true,
    description: 'Безкоштовна доставка', usedCount: 91 },
  { code: 'B2B-15',     type: 'percent', value: 15, minOrder: 50000, active: false,
    description: 'Опт від 50 000 грн', usedCount: 12 },
];

export const ADMIN_LOGS_SEED = [
  { id: 1, ts: daysAgo(0) + ' 14:23', admin: 'manager@magazyn.ua', action: 'Змінено статус замовлення ORD-2026-0417 з «new» на «paid»' },
  { id: 2, ts: daysAgo(0) + ' 12:08', admin: 'manager@magazyn.ua', action: 'Додано товар «XPS Техноплекс 30мм» (SKU XPS-TPLX-30)' },
  { id: 3, ts: daysAgo(1) + ' 18:11', admin: 'admin@magazyn.ua',   action: 'Створено промокод SPRING2026 (7%, мін. 3000 грн)' },
  { id: 4, ts: daysAgo(1) + ' 11:42', admin: 'manager@magazyn.ua', action: 'Відмінено замовлення ORD-2026-0412 (запит клієнта)' },
  { id: 5, ts: daysAgo(2) + ' 09:30', admin: 'admin@magazyn.ua',   action: 'Імпортовано 47 товарів з CSV-файла prices_2026q2.csv' },
  { id: 6, ts: daysAgo(3) + ' 16:54', admin: 'manager@magazyn.ua', action: 'Підтверджено модерацію 4 відгуків' },
  { id: 7, ts: daysAgo(4) + ' 10:15', admin: 'admin@magazyn.ua',   action: 'Опубліковано статтю «Як правильно утеплити мансарду»' },
];

// Об'ємні знижки у кошику
export const VOLUME_DISCOUNTS = [
  { fromM3: 10, percent: 5  },
  { fromM3: 30, percent: 8  },
  { fromM3: 50, percent: 10 },
];
