import { useParams, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import RatingStars from '../components/RatingStars';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductCard from '../components/ProductCard';
import { formatPrice, formatDate } from '../utils/format';

const ICONS = { mineral: '🟨', basalt: '🟫', eps: '🤍', xps: '🟦', pur: '🟧', eco: '🟩' };

export default function Product() {
  const { id } = useParams();
  const { addToCart, toggleCompare, toggleWishlist, compare, wishlist, lang, reviews, addReview, user,
          products, productTypes, getProduct } = useApp();
  const product = getProduct(id);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ author: user?.name || '', rating: 5, text: '' });

  if (!product) return <Navigate to="/catalog" replace />;

  const inCompare = compare.includes(product.id);
  const inWishlist = wishlist.includes(product.id);
  const productReviews = reviews.filter((r) => r.productId === product.id && r.status === 'approved');
  const type = productTypes.find((t) => t.id === product.type);
  const related = products.filter((p) => p.type === product.type && p.id !== product.id).slice(0, 4);

  const submitReview = (e) => {
    e.preventDefault();
    if (!reviewForm.author.trim() || !reviewForm.text.trim()) return;
    addReview({ ...reviewForm, productId: product.id });
    setReviewForm({ author: user?.name || '', rating: 5, text: '' });
  };

  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Каталог' : 'Catalog', to: '/catalog' },
        { label: lang === 'ua' ? type?.name : type?.nameEn, to: `/catalog?type=${product.type}` },
        { label: product.name },
      ]} />

      <div className="container">
        <div className="product-detail">
          <div className="product-gallery">{ICONS[product.type] || '📦'}</div>
          <div className="product-info">
            <div className="brand-line">{product.brand} • SKU {product.sku}</div>
            <h1>{product.name}</h1>
            <div className="flex-center" style={{ gap: 8 }}>
              <RatingStars value={product.rating} size="lg" />
              <span className="muted">{product.rating} • {product.reviewsCount} {lang === 'ua' ? 'відгуків' : 'reviews'}</span>
            </div>

            <div className="price-block">
              <span className="price-main">{formatPrice(product.pricePerPack, lang)}</span>
              <span className="price-unit">/ {lang === 'ua' ? 'упаковка' : 'pack'} ({product.packM3} м³)</span>
            </div>
            <div className="muted" style={{ fontSize: 14 }}>
              {formatPrice(product.pricePerM3, lang)} {lang === 'ua' ? 'за м³' : 'per m³'} •
              {' '}{product.stock > 0
                ? <span style={{ color: 'var(--c-primary-2)', fontWeight: 600 }}>● {lang === 'ua' ? 'В наявності' : 'In stock'}</span>
                : <span style={{ color: 'var(--c-danger)' }}>{lang === 'ua' ? 'Немає в наявності' : 'Out of stock'}</span>}
            </div>

            <p style={{ marginTop: 16 }}>{product.description}</p>

            <table className="specs-table">
              <tbody>
                <tr><td>{lang === 'ua' ? 'Теплопровідність λ' : 'Thermal conductivity λ'}</td>
                    <td>{product.lambda} {lang === 'ua' ? 'Вт/(м·К)' : 'W/(m·K)'}</td></tr>
                <tr><td>{lang === 'ua' ? 'Щільність' : 'Density'}</td>
                    <td>{product.density} {lang === 'ua' ? 'кг/м³' : 'kg/m³'}</td></tr>
                <tr><td>{lang === 'ua' ? 'Паропроникність' : 'Vapor permeability'}</td>
                    <td>{product.vaporPerm} {lang === 'ua' ? 'мг/(м·год·Па)' : 'mg/(m·h·Pa)'}</td></tr>
                <tr><td>{lang === 'ua' ? 'Горючість' : 'Combustibility'}</td>
                    <td>{product.combustibility}</td></tr>
                <tr><td>{lang === 'ua' ? 'Товщина' : 'Thickness'}</td>
                    <td>{product.thicknessMm} мм</td></tr>
                <tr><td>{lang === 'ua' ? 'Об\'єм упаковки' : 'Pack volume'}</td>
                    <td>{product.packM3} м³ ({product.packArea} м²)</td></tr>
              </tbody>
            </table>

            <div className="flex-center mt-20" style={{ gap: 12, flexWrap: 'wrap' }}>
              <div className="cart-item">
                <div className="qty-control">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
                  <button onClick={() => setQty((q) => q + 1)}>+</button>
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => addToCart(product.id, qty)}>
                🛒 {lang === 'ua' ? 'Додати в кошик' : 'Add to cart'}
              </button>
            </div>

            <div className="flex-center mt-20" style={{ gap: 8 }}>
              <button className={`btn ${inWishlist ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => toggleWishlist(product.id)}>
                ♡ {lang === 'ua' ? 'В обране' : 'Wishlist'}
              </button>
              <button className={`btn ${inCompare ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => toggleCompare(product.id)}>
                ⚖ {lang === 'ua' ? 'Порівняти' : 'Compare'}
              </button>
              <Link to="/calculator" className="btn btn-ghost btn-sm">🧮 {lang === 'ua' ? 'Скільки треба?' : 'How much do I need?'}</Link>
            </div>
          </div>
        </div>

        {/* Таби */}
        <div className="card mt-40">
          <div className="tabs-row">
            <button className={tab === 'description' ? 'active' : ''} onClick={() => setTab('description')}>
              {lang === 'ua' ? 'Опис' : 'Description'}
            </button>
            <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>
              {lang === 'ua' ? 'Відгуки' : 'Reviews'} ({productReviews.length})
            </button>
            <button className={tab === 'delivery' ? 'active' : ''} onClick={() => setTab('delivery')}>
              {lang === 'ua' ? 'Доставка' : 'Delivery'}
            </button>
          </div>

          {tab === 'description' && (
            <div>
              <p>{product.description}</p>
              <h4 className="mt-20">{lang === 'ua' ? 'Підходить для:' : 'Suitable for:'}</h4>
              <ul>
                {product.suitable?.map((s) => (
                  <li key={s}>{({
                    wall: lang === 'ua' ? 'утеплення стін' : 'wall insulation',
                    roof: lang === 'ua' ? 'утеплення покрівлі' : 'roof insulation',
                    floor: lang === 'ua' ? 'утеплення підлоги' : 'floor insulation',
                    facade: lang === 'ua' ? 'утеплення фасаду («мокрий» фасад)' : 'facade insulation',
                    mansard: lang === 'ua' ? 'утеплення мансарди' : 'mansard insulation',
                    pipes: lang === 'ua' ? 'теплоізоляції трубопроводів' : 'pipe insulation',
                  })[s] || s}</li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'reviews' && (
            <div>
              {productReviews.length === 0 && <p className="muted">{lang === 'ua' ? 'Поки що немає відгуків. Будьте першим!' : 'No reviews yet. Be the first!'}</p>}
              {productReviews.map((r) => (
                <div key={r.id} className="review-card">
                  <div className="head">
                    <div>
                      <div className="author">{r.author}</div>
                      <RatingStars value={r.rating} />
                    </div>
                    <div className="date">{formatDate(r.date, lang)}</div>
                  </div>
                  <p>{r.text}</p>
                </div>
              ))}

              <form onSubmit={submitReview} className="card mt-20" style={{ background: '#f8faf8' }}>
                <h4>{lang === 'ua' ? 'Залишити відгук' : 'Write a review'}</h4>
                <div className="field-row">
                  <div className="field-group">
                    <label className="label">{lang === 'ua' ? 'Ваше ім\'я' : 'Your name'}</label>
                    <input className="input" required value={reviewForm.author}
                      onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })} />
                  </div>
                  <div className="field-group">
                    <label className="label">{lang === 'ua' ? 'Оцінка' : 'Rating'}</label>
                    <RatingStars value={reviewForm.rating} editable onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} size="lg" />
                  </div>
                </div>
                <div className="field-group">
                  <label className="label">{lang === 'ua' ? 'Ваш відгук' : 'Your review'}</label>
                  <textarea className="textarea" required rows={4} value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    placeholder={lang === 'ua' ? 'Розкажіть про досвід використання...' : 'Tell us about your experience...'}
                  />
                </div>
                <button type="submit" className="btn btn-primary">{lang === 'ua' ? 'Надіслати' : 'Submit'}</button>
                <div className="muted mt-10" style={{ fontSize: 12 }}>
                  {lang === 'ua' ? 'Відгук з\'явиться після модерації.' : 'Your review will appear after moderation.'}
                </div>
              </form>
            </div>
          )}

          {tab === 'delivery' && (
            <div>
              <h4>{lang === 'ua' ? 'Способи доставки' : 'Delivery options'}</h4>
              <ul>
                <li>{lang === 'ua' ? 'Нова Пошта — відділення (від 165 грн)' : 'Nova Poshta — branches (from 165 UAH)'}</li>
                <li>{lang === 'ua' ? 'Поштомат НП (24/7)' : 'NP parcel locker (24/7)'}</li>
                <li>{lang === 'ua' ? 'Кур\'єр НП «під двері»' : 'NP courier «door to door»'}</li>
                <li>{lang === 'ua' ? 'Вантажне відділення (для опту)' : 'Cargo branch (for wholesale)'}</li>
              </ul>
              <h4 className="mt-20">{lang === 'ua' ? 'Способи оплати' : 'Payment methods'}</h4>
              <ul>
                <li>{lang === 'ua' ? 'Карткою онлайн (LiqPay)' : 'Card online (LiqPay)'}</li>
                <li>{lang === 'ua' ? 'Післяплата на відділенні' : 'Cash on delivery'}</li>
                <li>{lang === 'ua' ? 'Безготівковий розрахунок (для юросіб)' : 'Bank transfer (for legal entities)'}</li>
              </ul>
            </div>
          )}
        </div>

        {/* Схожі */}
        {related.length > 0 && (
          <section className="mt-40">
            <h2>{lang === 'ua' ? 'Схожі товари' : 'Related products'}</h2>
            <div className="product-grid mt-20">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
