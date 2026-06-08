import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { BLOG_POSTS } from '../data/blog';
import ProductCard from '../components/ProductCard';
import RatingStars from '../components/RatingStars';
import { formatDate } from '../utils/format';

const ICONS = { mineral: '🟨', basalt: '🟫', eps: '🤍', xps: '🟦', pur: '🟧', eco: '🟩' };

export default function Home() {
  const { t, lang, reviews, products, productTypes } = useApp();
  const hits = products.filter((p) => p.isHit).slice(0, 8);
  const approvedReviews = reviews.filter((r) => r.status === 'approved').slice(0, 3);

  return (
    <>
      <section className="hero-block">
        <div className="container">
          <div>
            <h1>{t('home.hero.title')}</h1>
            <p>{t('home.hero.text')}</p>
            <div className="hero-cta">
              <Link to="/calculator" className="btn btn-accent btn-lg">🧮 {t('home.hero.cta')}</Link>
              <Link to="/catalog" className="btn btn-outline btn-lg" style={{ background: 'transparent', color: '#fff', borderColor: '#fff' }}>
                {t('home.hero.cta2')}
              </Link>
            </div>
          </div>
          <div className="hero-illu">
            <div className="tile"><div className="v">12+</div><div className="l">{lang === 'ua' ? 'років на ринку' : 'years on market'}</div></div>
            <div className="tile"><div className="v">8 500+</div><div className="l">{lang === 'ua' ? 'клієнтів' : 'customers'}</div></div>
            <div className="tile"><div className="v">{products.length * 6}+</div><div className="l">{lang === 'ua' ? 'товарів у каталозі' : 'products in catalog'}</div></div>
            <div className="tile"><div className="v">24/25</div><div className="l">{lang === 'ua' ? 'областей доставки' : 'regions of delivery'}</div></div>
          </div>
        </div>
      </section>

      {/* Категорії */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>{lang === 'ua' ? 'Категорії товарів' : 'Product categories'}</h2>
          </div>
          <div className="tiles-grid">
            {productTypes.map((tp) => (
              <Link key={tp.id} to={`/catalog?type=${tp.id}`} className="tile-select">
                <div className="icon">{ICONS[tp.id]}</div>
                <div className="name">{lang === 'ua' ? tp.name : tp.nameEn}</div>
                <div className="hint">{products.filter((p) => p.type === tp.id).length} {lang === 'ua' ? 'товарів' : 'items'}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Калькулятор CTA */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)', borderRadius: 20, margin: '0 20px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 30, alignItems: 'center' }}>
          <div>
            <h2 style={{ color: '#E65100' }}>🧮 {lang === 'ua' ? 'Розумний калькулятор утеплення' : 'Smart insulation calculator'}</h2>
            <p style={{ fontSize: 16 }}>{lang === 'ua'
              ? 'Не вгадуйте товщину «на око» — отримайте точну рекомендацію за ДБН В.2.6-31. Калькулятор враховує регіон, тип конструкції, матеріал стіни і відразу пропонує товари з потрібною кількістю упаковок.'
              : 'No more guessing — get an accurate recommendation following Ukrainian DBN V.2.6-31 standard. The calculator considers region, structure type, wall material and suggests products with required pack count.'}
            </p>
            <ul style={{ marginTop: 14, paddingLeft: 20 }}>
              <li>{lang === 'ua' ? '24 регіони України з власною температурною зоною' : '24 Ukrainian regions with their own temperature zone'}</li>
              <li>{lang === 'ua' ? '6 типів конструкцій (стіна, дах, підлога, фасад, мансарда, труби)' : '6 structure types (wall, roof, floor, facade, mansard, pipes)'}</li>
              <li>{lang === 'ua' ? 'Облік існуючої товщини стіни (цегла, газоблок, дерево…)' : 'Existing wall composition is taken into account'}</li>
              <li>{lang === 'ua' ? 'Запас на нахлести і відходи (+10–15%)' : 'Built-in waste factor (+10–15%)'}</li>
            </ul>
          </div>
          <Link to="/calculator" className="btn btn-accent btn-lg">{lang === 'ua' ? 'Розрахувати →' : 'Calculate →'}</Link>
        </div>
      </section>

      {/* Хіти */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>🔥 {t('home.products.title')}</h2>
            <Link to="/catalog" className="btn btn-outline">{t('home.products.all')} →</Link>
          </div>
          <div className="product-grid">
            {hits.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Переваги */}
      <section className="section">
        <div className="container">
          <h2>{t('home.features.title')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginTop: 24 }}>
            {[
              { i: '🚚', n: lang === 'ua' ? 'Доставка по Україні' : 'Delivery across Ukraine', t: lang === 'ua' ? 'Нова Пошта на відділення, поштомати, кур\'єр' : 'Nova Poshta branches, parcel lockers, courier' },
              { i: '🛡', n: lang === 'ua' ? 'Гарантія 12 міс.' : '12 months warranty', t: lang === 'ua' ? 'Сертифіковані виробники, оригінальна продукція' : 'Certified manufacturers, genuine products' },
              { i: '💳', n: lang === 'ua' ? 'Зручна оплата' : 'Easy payment', t: lang === 'ua' ? 'LiqPay, післяплата, безнал для юросіб' : 'LiqPay, cash on delivery, B2B invoices' },
              { i: '📞', n: lang === 'ua' ? 'Підтримка щодня' : 'Daily support', t: lang === 'ua' ? 'Менеджер-консультант пн-сб 9:00–19:00' : 'Sales support Mon-Sat 9:00–19:00' },
            ].map((f) => (
              <div key={f.i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>{f.i}</div>
                <h4>{f.n}</h4>
                <div className="muted" style={{ fontSize: 14 }}>{f.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Відгуки */}
      {approvedReviews.length > 0 && (
        <section className="section">
          <div className="container">
            <h2>{lang === 'ua' ? 'Що кажуть клієнти' : 'What customers say'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 24 }}>
              {approvedReviews.map((r) => (
                <div key={r.id} className="card">
                  <RatingStars value={r.rating} />
                  <p style={{ marginTop: 10 }}>{r.text}</p>
                  <div style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 12 }}>
                    {r.author} • {formatDate(r.date, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Блог */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>{t('home.blog.title')}</h2>
            <Link to="/blog" className="btn btn-outline">{lang === 'ua' ? 'Усі статті' : 'All articles'} →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {BLOG_POSTS.slice(0, 3).map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="card" style={{ color: 'inherit', display: 'block' }}>
                <div className="tag tag-primary">{lang === 'ua' ? 'Стаття' : 'Article'}</div>
                <h4 style={{ margin: '12px 0 8px' }}>{post.title}</h4>
                <p className="muted" style={{ fontSize: 14 }}>{post.excerpt}</p>
                <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>
                  {formatDate(post.date, lang)} • {post.readMin} {lang === 'ua' ? 'хв читання' : 'min read'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
