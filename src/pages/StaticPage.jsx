// Універсальні статичні сторінки: Про нас, Контакти, Доставка, Гарантія, FAQ.
import { useApp } from '../contexts/AppContext';
import { QUESTIONS_FAQ } from '../data/reviews';
import Breadcrumbs from '../components/Breadcrumbs';

export function About() {
  const { lang } = useApp();
  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Про нас' : 'About' },
      ]} />
      <div className="container" style={{ maxWidth: 900 }}>
        <h1>{lang === 'ua' ? 'Про магазин «ТеплоДім»' : 'About TeploDim store'}</h1>
        <p style={{ fontSize: 17 }}>{lang === 'ua'
          ? 'Ми працюємо з 2014 року і допомагаємо українським домовласникам, забудовникам і ремонтним бригадам обирати правильну теплоізоляцію.'
          : 'We have been working since 2014 helping Ukrainian homeowners and builders choose the right insulation.'}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginTop: 24 }}>
          {[
            { v: '8 500+', l: lang === 'ua' ? 'клієнтів' : 'customers' },
            { v: '24', l: lang === 'ua' ? 'області доставки' : 'delivery regions' },
            { v: '12+', l: lang === 'ua' ? 'років на ринку' : 'years on market' },
            { v: '6', l: lang === 'ua' ? 'категорій матеріалів' : 'product categories' },
          ].map((s) => (
            <div key={s.l} className="card center">
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--c-primary)' }}>{s.v}</div>
              <div className="muted">{s.l}</div>
            </div>
          ))}
        </div>
        <h2 className="mt-40">{lang === 'ua' ? 'Чому обирають нас' : 'Why us'}</h2>
        <ul>
          <li>{lang === 'ua' ? 'Прямі поставки від виробників — без посередників і націнок' : 'Direct factory supply'}</li>
          <li>{lang === 'ua' ? 'Розумний калькулятор за ДБН — рахуємо за вас' : 'Smart DBN-based calculator'}</li>
          <li>{lang === 'ua' ? 'Власний склад у Києві — більшість позицій є в наявності' : 'Own warehouse in Kyiv'}</li>
          <li>{lang === 'ua' ? 'Менеджери-інженери, а не «продавачі»' : 'Engineer-managers'}</li>
        </ul>
      </div>
    </>
  );
}

export function Contacts() {
  const { lang } = useApp();
  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Контакти' : 'Contacts' },
      ]} />
      <div className="container" style={{ maxWidth: 900 }}>
        <h1>{lang === 'ua' ? 'Контакти' : 'Contacts'}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginTop: 24 }}>
          <div className="card"><h4>📞 {lang === 'ua' ? 'Телефон' : 'Phone'}</h4><div style={{ fontSize: 18 }}>+380 44 200 5050</div><div className="muted">пн-сб 9:00–19:00</div></div>
          <div className="card"><h4>✉ Email</h4><div style={{ fontSize: 18 }}>shop@teplodim.ua</div><div className="muted">{lang === 'ua' ? 'відповідаємо протягом години' : 'reply within an hour'}</div></div>
          <div className="card"><h4>🏪 {lang === 'ua' ? 'Шоурум' : 'Showroom'}</h4><div style={{ fontSize: 16 }}>{lang === 'ua' ? 'м. Київ, вул. Промислова 14' : 'Kyiv, 14 Promyslova str.'}</div><div className="muted">пн-сб 10:00–18:00</div></div>
          <div className="card"><h4>📦 {lang === 'ua' ? 'Склад' : 'Warehouse'}</h4><div style={{ fontSize: 16 }}>{lang === 'ua' ? 'Бориспільська 9, корпус Б' : 'Boryspilska 9, building B'}</div><div className="muted">{lang === 'ua' ? 'самовивіз — за домовленістю' : 'pickup by appointment'}</div></div>
        </div>
      </div>
    </>
  );
}

export function Delivery() {
  const { lang } = useApp();
  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Доставка та оплата' : 'Delivery & payment' },
      ]} />
      <div className="container" style={{ maxWidth: 900 }}>
        <h1>{lang === 'ua' ? 'Доставка та оплата' : 'Delivery & payment'}</h1>
        <h2 className="mt-20">{lang === 'ua' ? 'Доставка' : 'Delivery'}</h2>
        <ul>
          <li>{lang === 'ua' ? 'Нова Пошта — на відділення (від 165 грн)' : 'Nova Poshta — branch'}</li>
          <li>{lang === 'ua' ? 'Поштомат НП — 24/7 (від 145 грн)' : 'Parcel locker — 24/7'}</li>
          <li>{lang === 'ua' ? 'Адресна доставка кур\'єром (від 280 грн)' : 'Courier delivery'}</li>
          <li>{lang === 'ua' ? 'Вантажне відділення для опту' : 'Cargo branch (wholesale)'}</li>
          <li>{lang === 'ua' ? 'Безкоштовна доставка при замовленні від 15 000 грн' : 'Free shipping over 15 000 UAH'}</li>
        </ul>
        <h2 className="mt-20">{lang === 'ua' ? 'Оплата' : 'Payment'}</h2>
        <ul>
          <li>{lang === 'ua' ? 'Карткою онлайн (LiqPay/Fondy)' : 'Card online (LiqPay/Fondy)'}</li>
          <li>{lang === 'ua' ? 'Післяплата на відділенні (комісія НП 20 + 2%)' : 'Cash on delivery'}</li>
          <li>{lang === 'ua' ? 'Безготівковий розрахунок (для юридичних осіб)' : 'Bank transfer (B2B)'}</li>
        </ul>
      </div>
    </>
  );
}

export function Warranty() {
  const { lang } = useApp();
  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Гарантія та повернення' : 'Warranty & returns' },
      ]} />
      <div className="container" style={{ maxWidth: 900 }}>
        <h1>{lang === 'ua' ? 'Гарантія та повернення' : 'Warranty & returns'}</h1>
        <h2 className="mt-20">{lang === 'ua' ? 'Гарантія 12 місяців' : 'Warranty: 12 months'}</h2>
        <p>{lang === 'ua'
          ? 'На всі товари діє виробнича гарантія 12 місяців з дати продажу. Завантажити гарантійний талон можна у вашому особистому кабінеті.'
          : 'All products covered by 12-month manufacturer warranty.'}</p>
        <h2 className="mt-20">{lang === 'ua' ? 'Повернення' : 'Returns'}</h2>
        <p>{lang === 'ua'
          ? 'Повернення можливе протягом 14 днів з моменту отримання за умови збереження товарного виду та оригінального пакування. Вартість зворотної доставки оплачує покупець.'
          : '14-day return policy with original packaging.'}</p>
      </div>
    </>
  );
}

export function FAQ() {
  const { lang } = useApp();
  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: 'FAQ' },
      ]} />
      <div className="container" style={{ maxWidth: 900 }}>
        <h1>FAQ — {lang === 'ua' ? 'часті питання' : 'frequent questions'}</h1>
        <div className="mt-20">
          {QUESTIONS_FAQ.map((q, i) => (
            <details key={i} className="card mb-10">
              <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '4px 0' }}>{q.q}</summary>
              <p style={{ marginTop: 10 }}>{q.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}

export function NotFound() {
  const { lang } = useApp();
  return (
    <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 100 }}>🤷‍♂️</div>
      <h1>404 — {lang === 'ua' ? 'сторінку не знайдено' : 'page not found'}</h1>
      <p className="muted">{lang === 'ua' ? 'Можливо, ви перейшли за неробочим посиланням.' : 'The link may be broken.'}</p>
    </div>
  );
}
