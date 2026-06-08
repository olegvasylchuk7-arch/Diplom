# База даних

PostgreSQL у хмарі Supabase. Один SQL-файл — повне розгортання з нуля.

## 🚀 Підключення за 5 хвилин

### 1. Створіть проєкт Supabase

1. Відкрийте **https://supabase.com** → **Start your project**
2. Зареєструйтесь (через GitHub або email)
3. **New project**:
   - **Name:** `teplodim`
   - **Region:** **Central EU (Frankfurt)** — найближче до України
   - **Pricing Plan:** Free
4. Зачекайте ~1 хв.

### 2. Залийте схему

1. У боковому меню → **SQL Editor** → **+ New query**
2. Відкрийте файл [`schema.sql`](./schema.sql), скопіюйте все, вставте в редактор
3. Натисніть **Run** (або `Ctrl+Enter`)
4. Має з'явитися `Success. No rows returned`

Перевірте: **Table Editor** → побачите всі таблиці з даними.

### 3. Отримайте ключі

**Settings → Data API** (або через зелену кнопку **Connect** угорі):
- **Project URL** → починається з `https://...supabase.co`
- **Publishable / anon key** → довгий рядок

### 4. Підключіть фронтенд

У корені проєкту (`Web/`) створіть файл `.env`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...або sb_publishable_...
```

Перезапустіть dev-сервер:
```bash
npm run dev
```

### 5. Створіть адміна

1. **Authentication → Users → Add user → Create new user**
2. **Email:** `admin@teplodim.ua`
3. **Password:** мінімум 6 символів
4. ✅ **Auto Confirm User** — увімкнути
5. **Create user**

Тригер автоматично присвоїть йому `role='admin'`.

---

## 📊 Що створено

**14 таблиць:**

| Таблиця           | Призначення                                          |
|-------------------|------------------------------------------------------|
| `product_types`   | Категорії утеплювачів                                |
| `regions`         | 15 регіонів України з нормами ДБН (R за зонами I–IV) |
| `wall_materials`  | Цегла, газоблок, дерево… (для калькулятора)          |
| `products`        | Каталог товарів (12 у seed)                          |
| `profiles`        | Розширення `auth.users` — імʼя, телефон, роль        |
| `addresses`       | Адреси доставки                                      |
| `orders`          | Замовлення                                           |
| `order_items`     | Позиції замовлень                                    |
| `reviews`         | Відгуки з модерацією                                 |
| `promocodes`      | Промокоди                                            |
| `wishlist`        | Обране                                               |
| `calc_saves`      | Збережені розрахунки калькулятора                    |
| `blog_categories` | Категорії блогу                                      |
| `blog_posts`      | Статті з JSONB-контентом                             |
| `admin_logs`      | Журнал дій адмінів                                   |

**2 view:** `v_orders_full` (замовлення з вкладеними позиціями), `v_top_products` (топ за продажами).

**Функції / RPC:**
- `handle_new_user()` — тригер, створює профайл при реєстрації
- `ensure_my_profile()` — клієнтський RPC: гарантує наявність профайла
- `is_admin()` — перевірка ролі для RLS (SECURITY DEFINER, без рекурсії)

**Row Level Security** увімкнено на всіх таблицях.

---

## 🔒 Правила доступу

| Таблиця                  | Читання                       | Запис                  |
|--------------------------|-------------------------------|------------------------|
| `products`, довідники    | усі                           | адмін                  |
| `orders`                 | власник + адмін               | будь-хто (для гостьових) |
| `order_items`            | власник замовлення + адмін    | будь-хто               |
| `reviews`                | усі (тільки `approved`)       | авторизовані; модерація — адмін |
| `promocodes`             | усі                           | адмін                  |
| `wishlist`, `calc_saves`, `addresses` | тільки власник   | тільки власник         |
| `admin_logs`             | тільки адмін                  | тільки адмін           |

---

## 🛠 Корисні запити

```sql
-- Виторг за останні 30 днів
SELECT DATE(created_at) AS day, SUM(total) AS revenue
FROM orders
WHERE status <> 'cancelled' AND created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY day;

-- Топ-5 клієнтів
SELECT customer, COUNT(*) AS orders, SUM(total) AS spent
FROM orders
WHERE status = 'delivered'
GROUP BY customer
ORDER BY spent DESC
LIMIT 5;

-- Кількість товарів за категоріями
SELECT pt.name_ua, COUNT(*) AS qty
FROM products p
JOIN product_types pt ON pt.id = p.type
GROUP BY pt.name_ua;
```

---

## 🆘 Скинути БД до початкового стану

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```
…а потім знову залити `schema.sql`.
