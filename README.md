# ТеплоДім — інтернет-магазин теплоізоляції

Дипломна робота • React 19 + Vite + Supabase (PostgreSQL).

## Можливості

- **Розумний калькулятор за ДБН В.2.6-31** — 5-кроковий майстер: тип об'єкта → регіон → розміри → утеплювач → результат
- **Каталог із фільтрами** (тип, бренд, λ, горючість, ціна, рейтинг)
- **Порівняння до 4 товарів** з підсвічуванням найкращих параметрів
- **Відгуки** з модерацією
- **Кабінет** — замовлення, збережені розрахунки, обране, адреси, документи (PDF)
- **Чекаут** з імітацією API Нової Пошти + LiqPay
- **Адмінка** — дашборд із графіками (Chart.js), CRUD товарів і промокодів, CSV-імпорт, журнал дій
- **Двомовність** UA / EN
- **Чат-бот** rule-based

## Запуск

```bash
npm install
npm run dev      # розробка на http://localhost:5173
npm run build    # збірка в dist/
```

## База даних

Перед запуском потрібно підключити Supabase — див. [`database/README.md`](./database/README.md).

Коротко:
1. Створити проєкт на supabase.com
2. У SQL Editor виконати `database/schema.sql`
3. Скопіювати ключі в `.env` (зразок у `.env.example`)
4. У Supabase Authentication → Users створити адміна `admin@teplodim.ua`

## Структура

```
src/
├─ components/   Header, Footer, ProductCard, Modal, Chatbot…
├─ contexts/     AppContext (кошик, авторизація, тости)
├─ data/         статичні довідники + fallback-дані
├─ lib/          supabase клієнт, api модулі
├─ pages/        Home, Catalog, Product, Calculator, Cart, Checkout, Account, Blog
│  └─ admin/     Dashboard, Orders, Products, Promotions, Reviews, Logs
├─ styles/       global.css, admin.css
└─ utils/        calculator, pdf, format, storage

database/
├─ schema.sql   повна схема БД (14 таблиць, 2 view, RLS, тригери, RPC, seed)
└─ README.md    інструкція з підключення
```

## Стек

- React 19, react-router-dom 6
- Vite 8
- Supabase (PostgreSQL + Auth)
- Chart.js + react-chartjs-2 — графіки дашборду
- Vanilla CSS, без UI-бібліотек
- localStorage для кошика і порівняння (працює без БД)

## Дипломна робота

© 2026 Олег
