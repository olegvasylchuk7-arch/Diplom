-- ===================================================================
--  ТеплоДім — повна схема БД для Supabase (PostgreSQL 15+)
--
--  Один-кліковий деплой:
--    Supabase → SQL Editor → New query → вставити цей файл → Run
--
--  Створює:
--    • 14 таблиць + 2 views
--    • Тригер автостворення профайла
--    • RPC ensure_my_profile() для надійного створення профайла з клієнта
--    • Функцію is_admin() з SECURITY DEFINER (без рекурсії)
--    • Row Level Security на всіх таблицях
--    • Seed-дані: 12 товарів, 15 регіонів, 8 матеріалів стіни,
--      8 замовлень, 6 відгуків, 4 промокоди, 4 статті блогу
-- ===================================================================


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  1.  ДОВІДНИКИ                                                  ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Типи утеплювачів
CREATE TABLE IF NOT EXISTS product_types (
    id        TEXT PRIMARY KEY,
    name_ua   TEXT NOT NULL,
    name_en   TEXT NOT NULL
);

INSERT INTO product_types (id, name_ua, name_en) VALUES
    ('mineral', 'Мінеральна вата',                 'Mineral wool'),
    ('basalt',  'Базальтова вата',                 'Basalt wool'),
    ('eps',     'Пінопласт (EPS)',                 'EPS'),
    ('xps',     'Екструдований пінополістирол',    'XPS'),
    ('pur',     'Пінополіуретан',                  'Polyurethane'),
    ('eco',     'Целюлозний утеплювач',            'Cellulose')
ON CONFLICT (id) DO NOTHING;


-- Регіони України з ДБН-нормами
CREATE TABLE IF NOT EXISTS regions (
    code      TEXT PRIMARY KEY,
    name      TEXT NOT NULL,
    zone      CHAR(3) NOT NULL,        -- I | II | III | IV
    gsop      INT NOT NULL,            -- градусо-доби опалювального періоду
    r_wall    NUMERIC(4,2) NOT NULL,
    r_roof    NUMERIC(4,2) NOT NULL,
    r_floor   NUMERIC(4,2) NOT NULL,
    r_facade  NUMERIC(4,2) NOT NULL,
    r_mansard NUMERIC(4,2) NOT NULL
);

INSERT INTO regions (code, name, zone, gsop, r_wall, r_roof, r_floor, r_facade, r_mansard) VALUES
    ('KYIV',  'Київ та область',       'II',  3850, 3.3, 4.95, 3.75, 3.3, 5.0),
    ('KHAR',  'Харків / Сумська обл.', 'III', 4300, 3.6, 5.4,  4.0,  3.6, 5.4),
    ('LVIV',  'Львів / Тернопіль',     'II',  3900, 3.3, 4.95, 3.75, 3.3, 5.0),
    ('DNIP',  'Дніпро / Запоріжжя',    'II',  3700, 3.3, 4.95, 3.75, 3.3, 5.0),
    ('ODES',  'Одеса',                 'I',   2800, 2.8, 4.2,  3.1,  2.8, 4.5),
    ('MYK',   'Миколаїв / Херсон',     'I',   2900, 2.8, 4.2,  3.1,  2.8, 4.5),
    ('VINN',  'Вінниця / Хмельницька', 'II',  3700, 3.3, 4.95, 3.75, 3.3, 5.0),
    ('POLT',  'Полтава / Черкаси',     'II',  3900, 3.3, 4.95, 3.75, 3.3, 5.0),
    ('SUMY',  'Суми / Чернігів',       'III', 4400, 3.6, 5.4,  4.0,  3.6, 5.4),
    ('ZHYT',  'Житомир / Рівне',       'II',  3850, 3.3, 4.95, 3.75, 3.3, 5.0),
    ('CHERN', 'Чернівці',              'II',  3500, 3.3, 4.95, 3.75, 3.3, 5.0),
    ('IF',    'Івано-Франківськ',      'III', 4000, 3.6, 5.4,  4.0,  3.6, 5.4),
    ('UZH',   'Закарпаття (Ужгород)',  'I',   3200, 2.8, 4.2,  3.1,  2.8, 4.5),
    ('LUTSK', 'Луцьк (Волинь)',        'II',  3700, 3.3, 4.95, 3.75, 3.3, 5.0),
    ('KROP',  'Кропивницький',         'II',  3700, 3.3, 4.95, 3.75, 3.3, 5.0)
ON CONFLICT (code) DO NOTHING;


-- Матеріали стіни (для калькулятора)
CREATE TABLE IF NOT EXISTS wall_materials (
    code        TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    lambda      NUMERIC(5,3),
    default_mm  INT NOT NULL
);

INSERT INTO wall_materials (code, name, lambda, default_mm) VALUES
    ('brick',     'Цегла керамічна',           0.70, 380),
    ('silbrick',  'Силікатна цегла',           0.81, 380),
    ('gasblock',  'Газобетон D500',            0.14, 300),
    ('foamblock', 'Пінобетон D600',            0.22, 300),
    ('wood',      'Дерев''яний брус',          0.15, 150),
    ('concrete',  'Залізобетон',               1.74, 200),
    ('frame',     'Каркасна стіна',            0.18, 150),
    ('none',      'Без існуючої конструкції',  NULL, 0)
ON CONFLICT (code) DO NOTHING;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  2.  ТОВАРИ                                                     ║
-- ╚═══════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS products (
    id              BIGSERIAL PRIMARY KEY,
    sku             TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL,
    brand           TEXT NOT NULL,
    type            TEXT NOT NULL REFERENCES product_types(id),
    lambda          NUMERIC(5,3) NOT NULL,
    density         NUMERIC(6,2) NOT NULL,
    vapor_perm      NUMERIC(5,3) NOT NULL,
    combustibility  TEXT NOT NULL,
    thickness_mm    INT NOT NULL,
    price_per_pack  INT NOT NULL,
    price_per_m3    INT NOT NULL,
    pack_m3         NUMERIC(6,3) NOT NULL,
    pack_area       NUMERIC(6,2) NOT NULL,
    stock           INT NOT NULL DEFAULT 0,
    rating          NUMERIC(2,1) DEFAULT 0,
    reviews_count   INT DEFAULT 0,
    image           TEXT,
    description     TEXT,
    suitable        TEXT[],
    is_hit          BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

INSERT INTO products (sku, name, brand, type, lambda, density, vapor_perm, combustibility, thickness_mm, price_per_pack, price_per_m3, pack_m3, pack_area, stock, rating, reviews_count, image, description, suitable, is_hit) VALUES
('ISO-KL37-100',     'Мінеральна вата ISOVER KL 37',                    'ISOVER',     'mineral', 0.037, 11,  0.51, 'НГ', 100, 940,  1450, 0.648, 6.48, 240, 4.7, 38, 'isover',  'Універсальний рулонний утеплювач для стін, перекриттів, мансардних поверхів. Не горить, добре утримує форму, не дає усадки.', ARRAY['wall','roof','floor','mansard'], TRUE),
('RW-FR-MAX-E-100',  'Базальтова плита ROCKWOOL Frontrock MAX E',       'ROCKWOOL',   'basalt',  0.036, 100, 0.30, 'НГ', 100, 1390, 3850, 0.36,  3.6,  180, 4.9, 54, 'rockwool','Жорстка базальтова плита для фасадів типу «мокрий фасад». Висока механічна міцність, паропроникна, не горить.', ARRAY['wall','facade'], TRUE),
('EPS-80-50',        'Пінопласт ПСБ-С 25 «Термопласт» 50мм',            'Термопласт', 'eps',     0.039, 25,  0.05, 'Г1', 50,  520,  1620, 0.32,  6.4,  600, 4.3, 102,'eps',     'Класичний пінополістирол для фасадного утеплення. Низька ціна, проста монтаж. Не рекомендується для дерев''яних будинків.', ARRAY['wall','facade','floor'], FALSE),
('XPS-PNX-FUND-50',  'XPS Пеноплекс «Фундамент» 50мм',                  'Пеноплекс',  'xps',     0.030, 35,  0.013,'Г3', 50,  1180, 4100, 0.288, 5.76, 95,  4.8, 73, 'xps',     'Екструдований пінополістирол з підвищеною міцністю і водовідштовхуванням. Ідеальний для фундаментів, цоколя, інверсійної покрівлі.', ARRAY['floor','facade'], TRUE),
('KNF-TS040-100',    'Мінвата KNAUF Insulation TS 040 Aquastatik',      'KNAUF',      'mineral', 0.040, 14,  0.55, 'НГ', 100, 825,  1290, 0.64,  6.4,  320, 4.6, 41, 'knauf',   'Плити зі скловолокна з гідрофобною обробкою. Підходять для ненавантажених конструкцій: каркасні стіни, перекриття, мансарда.', ARRAY['wall','roof','mansard'], FALSE),
('PAROC-EXT-100',    'Базальтова плита PAROC eXtra 100мм',              'PAROC',      'basalt',  0.036, 32,  0.35, 'НГ', 100, 1075, 2150, 0.5,   5.0,  210, 4.7, 29, 'paroc',   'Універсальна базальтова плита середньої щільності. Підходить для стін, перекриттів, перегородок і скатних дахів.', ARRAY['wall','roof','floor','mansard'], FALSE),
('PUR-POLYNOR',      'Напилюваний пінополіуретан Polynor',              'Polynor',    'pur',     0.025, 18,  0.05, 'Г2', 50,  1450, 5800, 0.25,  5.0,  80,  4.5, 18, 'pur',     'Однокомпонентний пінополіуретан в балоні для самостійного напилення. Відмінна адгезія, безшовний шар, заповнює щілини.', ARRAY['wall','roof','pipes','mansard'], FALSE),
('URSA-GEO-M25',     'URSA GEO М-25 100мм',                             'URSA',       'mineral', 0.040, 13,  0.50, 'НГ', 100, 850,  1180, 0.72,  7.2,  410, 4.4, 67, 'ursa',    'Економ-варіант скловати для горизонтальних конструкцій: перекриття, горище, мансарда.', ARRAY['roof','floor','mansard'], FALSE),
('TERMOREX-PIPE-50', 'Циліндр базальтовий «ТермоРекс» для труб Ø108мм', 'ТермоРекс',  'basalt',  0.038, 90,  0.30, 'НГ', 50,  480,  6900, 0.069, 1.0,  130, 4.6, 12, 'pipe',    'Базальтовий циліндр для теплоізоляції трубопроводів. Витримує до +650°C. Постачається з фольгованим покриттям.', ARRAY['pipes'], FALSE),
('EKO-CELL-15',      'Ековата «ЕкоІзол» (целюлозна, мішок 15 кг)',      'ЕкоІзол',    'eco',     0.038, 45,  0.30, 'Г2', 100, 590,  1750, 0.333, 3.33, 90,  4.8, 22, 'eco',     'Екологічний утеплювач з вторинної целюлози, оброблений антипіренами і антисептиками. Задувається пневматичним способом.', ARRAY['roof','mansard','wall'], FALSE),
('EPS-PSB35-100',    'Пінопласт ПСБ-С 35 фасадний 100мм',               'Термопласт', 'eps',     0.038, 35,  0.05, 'Г1', 100, 605,  1890, 0.32,  3.2,  470, 4.5, 88, 'eps2',    'Щільний фасадний пінопласт для зовнішнього утеплення стін. Обов''язкове армування сіткою і фінішне декоративне покриття.', ARRAY['wall','facade'], FALSE),
('XPS-TPLX-30',      'XPS «Техноплекс» 30мм',                           'Технониколь','xps',     0.032, 26,  0.011,'Г3', 30,  555,  3700, 0.15,  5.0,  280, 4.6, 35, 'xps2',    'Тонкий XPS для додаткового утеплення підлоги під стяжку або теплу підлогу. Низьке водопоглинання, висока міцність на стиск.', ARRAY['floor'], FALSE)
ON CONFLICT (sku) DO NOTHING;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  3.  ПРОФАЙЛИ ТА АДРЕСИ                                         ║
-- ╚═══════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT UNIQUE,
    name        TEXT,
    phone       TEXT,
    role        TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Тригер автостворення профайла при реєстрації через auth API
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
        CASE WHEN NEW.email = 'admin@teplodim.ua' THEN 'admin' ELSE 'user' END
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- RPC: гарантовано повертає або створює профайл поточного користувача.
-- Викликається з клієнта одразу після login/signUp на випадок, коли
-- тригер не спрацював (буває у Supabase free-плані).
CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    prof    public.profiles;
    uid     UUID := auth.uid();
    uemail  TEXT;
    uname   TEXT;
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT * INTO prof FROM public.profiles WHERE id = uid;
    IF FOUND THEN RETURN prof; END IF;

    SELECT email,
           COALESCE(raw_user_meta_data ->> 'name', split_part(email, '@', 1))
      INTO uemail, uname
      FROM auth.users
     WHERE id = uid;

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        uid, uemail, uname,
        CASE WHEN uemail = 'admin@teplodim.ua' THEN 'admin' ELSE 'user' END
    )
    RETURNING * INTO prof;

    RETURN prof;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_my_profile() TO authenticated;


-- Допоміжна функція для RLS: чи поточний користувач — адмін?
-- SECURITY DEFINER обходить RLS для profiles, інакше отримаємо рекурсію.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
        FALSE
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;


CREATE TABLE IF NOT EXISTS addresses (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    label       TEXT NOT NULL,
    city        TEXT NOT NULL,
    branch      TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  4.  ЗАМОВЛЕННЯ                                                 ║
-- ╚═══════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS orders (
    id              TEXT PRIMARY KEY,                          -- ORD-YYYY-XXXX
    user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer        TEXT NOT NULL,
    email           TEXT NOT NULL,
    phone           TEXT,
    total           INT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','paid','packed','shipped','delivered','cancelled')),
    payment         TEXT NOT NULL,
    shipping_type   TEXT NOT NULL,
    shipping_city   TEXT,
    shipping_branch TEXT,
    is_b2b          BOOLEAN DEFAULT FALSE,
    company         TEXT,
    edrpou          TEXT,
    comment         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);


CREATE TABLE IF NOT EXISTS order_items (
    id          BIGSERIAL PRIMARY KEY,
    order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products(id),
    qty         INT NOT NULL CHECK (qty > 0),
    price       INT NOT NULL    -- ціна на момент покупки (snapshot)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);


-- Seed для дашборду адмінки
INSERT INTO orders (id, customer, email, phone, total, status, payment, shipping_type, shipping_city, shipping_branch, is_b2b, created_at) VALUES
    ('ORD-2026-0418', 'Андрій Коваленко', 'a.kov@gmail.com',     '+380 67 123 4567', 12480, 'new',       'liqpay','np-branch',   'Київ',   'Відділення №42',         FALSE, NOW()),
    ('ORD-2026-0417', 'Олена Мельник',    'olena.m@ukr.net',     '+380 50 555 1122', 8340,  'paid',      'liqpay','np-branch',   'Львів',  'Відділення №7',          FALSE, NOW() - INTERVAL '1 day'),
    ('ORD-2026-0416', 'Сергій Шевченко',  'svshev@gmail.com',    '+380 93 008 4400', 5210,  'shipped',   'cod',   'np-poshtomat','Харків', 'Поштомат №2541',         FALSE, NOW() - INTERVAL '2 days'),
    ('ORD-2026-0415', 'Тарас Бойко',      'tarasik@email.ua',    '+380 96 712 3300', 18450, 'delivered', 'liqpay','np-branch',   'Дніпро', 'Відділення №15',         FALSE, NOW() - INTERVAL '3 days'),
    ('ORD-2026-0414', 'ТОВ «БудКомфорт»', 'office@budkomfort.ua','+380 44 200 5050', 96400, 'delivered', 'bank',  'np-cargo',    'Київ',   'Вантажне відділення №2', TRUE,  NOW() - INTERVAL '4 days'),
    ('ORD-2026-0413', 'Микола Гайдук',    'mhayduk@email.ua',    '+380 67 333 8821', 4150,  'delivered', 'liqpay','np-poshtomat','Одеса',  'Поштомат №312',          FALSE, NOW() - INTERVAL '5 days'),
    ('ORD-2026-0412', 'Дмитро Поліщук',   'dpol@gmail.com',      '+380 50 612 7733', 6750,  'cancelled', 'cod',   'np-branch',   'Полтава','Відділення №21',         FALSE, NOW() - INTERVAL '6 days'),
    ('ORD-2026-0411', 'Ольга Литвин',     'olya.l@email.ua',     '+380 96 008 7411', 9450,  'delivered', 'liqpay','np-branch',   'Київ',   'Відділення №103',        FALSE, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, qty, price)
SELECT v.order_id, p.id, v.qty, v.price
FROM (VALUES
    ('ORD-2026-0418', 'ISO-KL37-100',    6,  940),
    ('ORD-2026-0418', 'XPS-PNX-FUND-50', 6,  1180),
    ('ORD-2026-0417', 'RW-FR-MAX-E-100', 6,  1390),
    ('ORD-2026-0416', 'EPS-80-50',       10, 520),
    ('ORD-2026-0415', 'PAROC-EXT-100',   12, 1075),
    ('ORD-2026-0415', 'XPS-PNX-FUND-50', 5,  1180),
    ('ORD-2026-0414', 'ISO-KL37-100',    60, 940),
    ('ORD-2026-0414', 'PAROC-EXT-100',   40, 1075),
    ('ORD-2026-0413', 'XPS-TPLX-30',     6,  555),
    ('ORD-2026-0413', 'EPS-PSB35-100',   1,  605),
    ('ORD-2026-0412', 'EPS-PSB35-100',   10, 605),
    ('ORD-2026-0411', 'RW-FR-MAX-E-100', 5,  1390),
    ('ORD-2026-0411', 'XPS-TPLX-30',     4,  555)
) AS v(order_id, sku, qty, price)
JOIN products p ON p.sku = v.sku
ON CONFLICT DO NOTHING;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  5.  ВІДГУКИ                                                    ║
-- ╚═══════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS reviews (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
    author      TEXT NOT NULL,
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text        TEXT NOT NULL,
    photos      TEXT[] DEFAULT ARRAY[]::TEXT[],
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','rejected')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

INSERT INTO reviews (product_id, author, rating, text, status, created_at)
SELECT p.id, v.author, v.rating, v.text, 'approved', NOW() - (v.days || ' days')::INTERVAL
FROM (VALUES
    ('ISO-KL37-100',    'Андрій К.', 5, 'Брав 6 рулонів на горище 50м². Дуже зручно розгортається, не пилить як стара скловата. Тримає тепло — за зиму платіжки впали на третину.', 5),
    ('ISO-KL37-100',    'Ольга М.',  4, 'Якісна вата, але у двох рулонах був пошкоджений пакет. Магазин замінив без проблем.', 20),
    ('RW-FR-MAX-E-100', 'Сергій В.', 5, 'Rockwool Frontrock — це класика для мокрого фасаду. 100мм на стіну з газоблоку, тримається на дюбель-парасолях ідеально. Ціна кусається, але якість того варта.', 12),
    ('EPS-80-50',       'Дмитро П.', 4, 'Дешево і сердито. Утеплював гараж, для цієї задачі підходить. На житло я б все ж вату взяв.', 30),
    ('XPS-PNX-FUND-50', 'Микола Г.', 5, 'Утеплював цоколь і вимощення. Пеноплекс просто звір — не вбираєш воду, ріжеться легко, тримає форму. Беріть не вагаючись.', 18),
    ('PUR-POLYNOR',     'Тарас Я.',  4, 'Поліуретан в балоні — рятувальник для важкодоступних місць. Балон 1кг = ~1м² шар 50мм. Лайфхак: працювати при +15°C мінімум.', 8)
) AS v(sku, author, rating, text, days)
JOIN products p ON p.sku = v.sku;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  6.  ПРОМОКОДИ                                                  ║
-- ╚═══════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS promocodes (
    code        TEXT PRIMARY KEY,
    type        TEXT NOT NULL CHECK (type IN ('percent','fixed','shipping')),
    value       INT NOT NULL DEFAULT 0,
    min_order   INT NOT NULL DEFAULT 0,
    active      BOOLEAN DEFAULT TRUE,
    description TEXT,
    used_count  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO promocodes (code, type, value, min_order, active, description, used_count) VALUES
    ('WELCOME10',  'percent',  10, 1500,  TRUE,  'Знижка для нових клієнтів',  142),
    ('SPRING2026', 'percent',  7,  3000,  TRUE,  'Весняна акція 2026',         38),
    ('FREEDLV',    'shipping', 0,  5000,  TRUE,  'Безкоштовна доставка',       91),
    ('B2B-15',     'percent',  15, 50000, FALSE, 'Опт від 50 000 грн',         12)
ON CONFLICT (code) DO NOTHING;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  7.  WISHLIST + ЗБЕРЕЖЕНІ РОЗРАХУНКИ                            ║
-- ╚═══════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS wishlist (
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id)
);


CREATE TABLE IF NOT EXISTS calc_saves (
    id                BIGSERIAL PRIMARY KEY,
    user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    object_type       TEXT NOT NULL,
    object_type_name  TEXT NOT NULL,
    region_code       TEXT NOT NULL,
    region_name       TEXT NOT NULL,
    area              NUMERIC(8,2) NOT NULL,
    recommended_mm    INT NOT NULL,
    insulation_id     BIGINT NOT NULL REFERENCES products(id),
    insulation_name   TEXT NOT NULL,
    packs             INT NOT NULL,
    total_price       INT NOT NULL,
    saved_at          TIMESTAMPTZ DEFAULT NOW()
);


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  8.  СТАТТІ БЛОГУ                                               ║
-- ╚═══════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS blog_categories (
    id    TEXT PRIMARY KEY,
    name  TEXT NOT NULL
);
INSERT INTO blog_categories (id, name) VALUES
    ('guide',   'Інструкції'),
    ('compare', 'Порівняння'),
    ('norms',   'Норми та ДБН'),
    ('news',    'Новини')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS blog_posts (
    id                TEXT PRIMARY KEY,
    title             TEXT NOT NULL,
    category          TEXT REFERENCES blog_categories(id),
    excerpt           TEXT,
    author            TEXT,
    read_min          INT,
    published_at      DATE,
    content           JSONB NOT NULL,
    related_products  BIGINT[] DEFAULT ARRAY[]::BIGINT[],
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO blog_posts (id, title, category, excerpt, author, read_min, published_at, content, related_products) VALUES
('mansard-howto',  'Як правильно утеплити мансарду: покрокова інструкція',
    'guide',  'Розбираємо тонкощі монтажу утеплювача між кроквами, влаштування пароізоляції та вентильованого зазору.',
    'Олег Терлецький', 8, '2026-03-12',
    '[{"type":"p","text":"Мансардне приміщення — одне з найскладніших місць у будинку для утеплення."},{"type":"h2","text":"Який утеплювач обрати"},{"type":"p","text":"Найкраще себе показують волокнисті матеріали — мінеральна або базальтова вата щільністю 30-50 кг/м³."}]'::jsonb,
    ARRAY[1,5,8,10]::BIGINT[]),
('mineral-vs-eps', 'Мінеральна вата vs пінопласт: що обрати для фасаду',
    'compare', 'Чесне порівняння двох найпопулярніших утеплювачів за вісьмома параметрами.',
    'Олена Гриценко', 6, '2026-02-28',
    '[{"type":"p","text":"Питання «вата чи пінопласт» виникає у кожного, хто планує утеплення фасаду."},{"type":"h2","text":"Теплопровідність"},{"type":"p","text":"Мінеральна вата λ ≈ 0.036–0.040, пінопласт ПСБ-С 25 λ ≈ 0.039."}]'::jsonb,
    ARRAY[2,3,6,11]::BIGINT[]),
('dbn-thickness', 'ДБН В.2.6-31:2021 — нормативи товщини утеплення',
    'norms', 'Розповідаємо, як читати таблиці нормативного опору теплопередачі.',
    'Олег Терлецький', 10, '2026-02-10',
    '[{"type":"p","text":"ДБН В.2.6-31 регламентує мінімальні значення приведеного опору теплопередачі."}]'::jsonb,
    ARRAY[1,2,4]::BIGINT[]),
('pipe-insulation', 'Як утеплити трубопровід в землі та на повітрі',
    'guide', 'Циліндри, мати, спінений каучук — що використовувати для холодних і гарячих трубопроводів.',
    'Іван Бойко', 5, '2026-01-22',
    '[{"type":"p","text":"Теплоізоляція трубопроводів виконує дві задачі: запобігає замерзанню води і знижує тепловтрати."}]'::jsonb,
    ARRAY[9,7]::BIGINT[])
ON CONFLICT (id) DO NOTHING;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  9.  ЛОГИ АДМІНКИ                                               ║
-- ╚═══════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS admin_logs (
    id          BIGSERIAL PRIMARY KEY,
    admin_email TEXT NOT NULL,
    action      TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO admin_logs (admin_email, action, created_at) VALUES
    ('admin@teplodim.ua',   'Імпортовано 47 товарів з CSV-файла prices_2026q2.csv', NOW() - INTERVAL '2 days'),
    ('manager@teplodim.ua', 'Підтверджено модерацію 4 відгуків',                    NOW() - INTERVAL '3 days'),
    ('admin@teplodim.ua',   'Опубліковано статтю «Як правильно утеплити мансарду»', NOW() - INTERVAL '4 days');


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  10. VIEW                                                       ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Замовлення з вкладеними позиціями (JSON-агрегація)
CREATE OR REPLACE VIEW v_orders_full AS
SELECT
    o.*,
    COALESCE(json_agg(
        json_build_object(
            'product_id', oi.product_id,
            'name', p.name,
            'sku', p.sku,
            'qty', oi.qty,
            'price', oi.price,
            'sum', oi.qty * oi.price
        ) ORDER BY oi.id
    ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN products p ON p.id = oi.product_id
GROUP BY o.id;


-- Топ-товари за обсягом продажів
CREATE OR REPLACE VIEW v_top_products AS
SELECT
    p.id, p.name, p.brand, p.image,
    COALESCE(SUM(oi.qty), 0) AS sold_qty,
    COALESCE(SUM(oi.qty * oi.price), 0) AS revenue
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status <> 'cancelled'
GROUP BY p.id
ORDER BY sold_qty DESC;


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  11. ROW LEVEL SECURITY                                         ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Профайли: кожен бачить свій, адмін — усі
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_self_read"      ON profiles;
DROP POLICY IF EXISTS "profiles_admin_read_all" ON profiles;
DROP POLICY IF EXISTS "profiles_self_update"    ON profiles;
DROP POLICY IF EXISTS "profiles_self_insert"    ON profiles;
CREATE POLICY "profiles_self_read"      ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_admin_read_all" ON profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "profiles_self_update"    ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_self_insert"    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Адреси: лише власник
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "addresses_owner" ON addresses;
CREATE POLICY "addresses_owner" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Замовлення: користувач бачить свої, адмін — усі; створювати — будь-хто (для гостьових)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_self_read"    ON orders;
DROP POLICY IF EXISTS "orders_insert_any"   ON orders;
DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_self_read"    ON orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_insert_any"   ON orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE USING (public.is_admin());

-- Позиції замовлень
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "items_select" ON order_items;
DROP POLICY IF EXISTS "items_insert" ON order_items;
CREATE POLICY "items_select" ON order_items FOR SELECT USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "items_insert" ON order_items FOR INSERT WITH CHECK (TRUE);

-- Відгуки: усі бачать approved, авторизовані можуть створювати, адмін — модерує
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_read_approved" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_auth"   ON reviews;
DROP POLICY IF EXISTS "reviews_admin_update"  ON reviews;
CREATE POLICY "reviews_read_approved" ON reviews FOR SELECT USING (
    status = 'approved' OR auth.uid() = user_id OR public.is_admin()
);
CREATE POLICY "reviews_insert_auth"   ON reviews FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "reviews_admin_update"  ON reviews FOR UPDATE USING (public.is_admin());

-- Wishlist і збережені розрахунки: лише власник
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wishlist_owner" ON wishlist;
CREATE POLICY "wishlist_owner" ON wishlist FOR ALL USING (auth.uid() = user_id);

ALTER TABLE calc_saves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "calc_owner" ON calc_saves;
CREATE POLICY "calc_owner" ON calc_saves FOR ALL USING (auth.uid() = user_id);

-- Промокоди: читання — усі, керування — лише адмін
ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promocodes_read"        ON promocodes;
DROP POLICY IF EXISTS "promocodes_admin_write" ON promocodes;
CREATE POLICY "promocodes_read"        ON promocodes FOR SELECT USING (TRUE);
CREATE POLICY "promocodes_admin_write" ON promocodes FOR ALL
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Логи адміна
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "logs_admin" ON admin_logs;
CREATE POLICY "logs_admin" ON admin_logs FOR ALL
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Товари
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_read_all"    ON products;
DROP POLICY IF EXISTS "products_admin_write" ON products;
CREATE POLICY "products_read_all"    ON products FOR SELECT USING (TRUE);
CREATE POLICY "products_admin_write" ON products FOR ALL
    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Публічні довідники (read-only)
ALTER TABLE product_types   ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_materials  ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read" ON product_types;   CREATE POLICY "public_read" ON product_types   FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "public_read" ON regions;         CREATE POLICY "public_read" ON regions         FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "public_read" ON wall_materials;  CREATE POLICY "public_read" ON wall_materials  FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "public_read" ON blog_posts;      CREATE POLICY "public_read" ON blog_posts      FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "public_read" ON blog_categories; CREATE POLICY "public_read" ON blog_categories FOR SELECT USING (TRUE);


-- ===================================================================
--  Готово. Перейдіть у Table Editor — побачите всі таблиці з даними.
-- ===================================================================
