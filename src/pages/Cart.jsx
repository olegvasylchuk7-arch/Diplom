import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp, MAX_QTY } from '../contexts/AppContext';
import { formatPrice, formatNumber } from '../utils/format';
import { VOLUME_DISCOUNTS } from '../data/orders';
import { generateQuotePDF } from '../utils/pdf';
import Breadcrumbs from '../components/Breadcrumbs';

const ICONS = { mineral: '🟨', basalt: '🟫', eps: '🤍', xps: '🟦', pur: '🟧', eco: '🟩' };

export default function Cart() {
  const { lang, cartTotals, updateCartQty, removeFromCart, applyPromocode, promocode, setPromocode, clearCart } = useApp();
  const [promoInput, setPromoInput] = useState('');
  const [b2bCustomer, setB2bCustomer] = useState('');

  const { items, subtotal, volumeM3, volumePct, volumeDiscount, promoDiscount, total } = cartTotals;

  const nextTier = VOLUME_DISCOUNTS.find((v) => volumeM3 < v.fromM3);

  if (items.length === 0) {
    return (
      <>
        <Breadcrumbs items={[
          { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
          { label: lang === 'ua' ? 'Кошик' : 'Cart' },
        ]} />
        <div className="container">
          <div className="card center" style={{ padding: 60 }}>
            <div style={{ fontSize: 60 }}>🛒</div>
            <h2>{lang === 'ua' ? 'Кошик порожній' : 'Cart is empty'}</h2>
            <p className="muted">{lang === 'ua'
              ? 'Перейдіть до каталогу або скористайтесь калькулятором — і ми додамо все потрібне.'
              : 'Browse the catalog or use the calculator.'}</p>
            <div className="flex-center mt-20" style={{ justifyContent: 'center', gap: 10 }}>
              <Link to="/catalog" className="btn btn-primary">{lang === 'ua' ? 'У каталог' : 'Catalog'}</Link>
              <Link to="/calculator" className="btn btn-outline">{lang === 'ua' ? 'Калькулятор' : 'Calculator'}</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleGenerateQuote = () => {
    generateQuotePDF({
      items: items.map((it) => ({ product: it.product, qty: it.qty, price: it.product.pricePerPack })),
      total,
      customer: b2bCustomer || 'ТОВ «Покупець»',
    });
  };

  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Кошик' : 'Cart' },
      ]} />

      <div className="container">
        <div className="space-between">
          <h1>{lang === 'ua' ? 'Кошик' : 'Cart'}</h1>
          <button className="btn btn-ghost btn-sm" onClick={clearCart}>{lang === 'ua' ? 'Очистити' : 'Clear'}</button>
        </div>

        <div className="cart-layout mt-20">
          <div>
            {items.map((it) => (
              <div key={it.productId} className="cart-item">
                <div className="ci-image">{ICONS[it.product.type] || '📦'}</div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--c-text-2)', textTransform: 'uppercase' }}>{it.product.brand}</div>
                  <Link to={`/product/${it.product.id}`} style={{ fontWeight: 600, fontSize: 15 }}>
                    {it.product.name}
                  </Link>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    {formatPrice(it.product.pricePerPack, lang)} × {it.qty} {lang === 'ua' ? 'уп.' : 'pcs'}
                    {' '}({(it.product.packM3 * it.qty).toFixed(2)} м³)
                  </div>
                  {it.fromCalc && (
                    <span className="tag tag-accent mt-10" style={{ display: 'inline-block' }}>
                      📐 {lang === 'ua' ? 'З калькулятора' : 'From calculator'}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--c-primary)' }}>
                    {formatPrice(it.product.pricePerPack * it.qty, lang)}
                  </div>
                  <div className="qty-control mt-10">
                    <button onClick={() => updateCartQty(it.productId, it.qty - 1)}>−</button>
                    <input type="number" min="0" max={MAX_QTY} value={it.qty}
                      onChange={(e) => updateCartQty(it.productId, Math.min(MAX_QTY, Math.max(0, Number(e.target.value) || 0)))} />
                    <button onClick={() => updateCartQty(it.productId, it.qty + 1)}>+</button>
                  </div>
                  <button className="btn btn-ghost btn-sm mt-10" onClick={() => removeFromCart(it.productId)}>
                    ✕ {lang === 'ua' ? 'Видалити' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}

            {/* B2B блок */}
            <div className="card mt-20">
              <h4>📄 {lang === 'ua' ? 'Для юридичних осіб' : 'For legal entities'}</h4>
              <p className="muted" style={{ fontSize: 13 }}>
                {lang === 'ua'
                  ? 'Згенеруйте комерційну пропозицію в PDF з реквізитами та ПДВ.'
                  : 'Generate a commercial offer in PDF with VAT.'}
              </p>
              <div className="field-row mt-20">
                <input
                  className="input"
                  placeholder={lang === 'ua' ? 'Найменування контрагента' : 'Counterparty name'}
                  value={b2bCustomer}
                  onChange={(e) => setB2bCustomer(e.target.value)}
                />
                <button className="btn btn-outline" onClick={handleGenerateQuote}>
                  📄 {lang === 'ua' ? 'КП у PDF' : 'Quote as PDF'}
                </button>
              </div>
            </div>
          </div>

          <aside className="cart-summary card">
            <h3>{lang === 'ua' ? 'Підсумок' : 'Summary'}</h3>

            <div className="sum-row">
              <span>{lang === 'ua' ? 'Об\'єм матеріалу' : 'Volume'}</span>
              <strong>{formatNumber(volumeM3, 2)} м³</strong>
            </div>
            <div className="sum-row">
              <span>{lang === 'ua' ? 'Сума товарів' : 'Subtotal'}</span>
              <strong>{formatPrice(subtotal, lang)}</strong>
            </div>

            {volumeDiscount > 0 && (
              <div className="sum-row" style={{ color: 'var(--c-primary-2)' }}>
                <span>{lang === 'ua' ? `Об'ємна знижка (-${volumePct}%)` : `Volume discount (-${volumePct}%)`}</span>
                <strong>−{formatPrice(volumeDiscount, lang)}</strong>
              </div>
            )}

            {nextTier && (
              <div className="discount-info">
                💡 {lang === 'ua'
                  ? `Ще ${formatNumber(nextTier.fromM3 - volumeM3, 1)} м³ — і знижка ${nextTier.percent}%`
                  : `Add ${formatNumber(nextTier.fromM3 - volumeM3, 1)} m³ more for ${nextTier.percent}% discount`}
              </div>
            )}

            {promoDiscount > 0 && (
              <div className="sum-row" style={{ color: 'var(--c-accent)' }}>
                <span>{lang === 'ua' ? `Промокод ${promocode.code}` : `Promo ${promocode.code}`}</span>
                <strong>−{formatPrice(promoDiscount, lang)}</strong>
              </div>
            )}

            <div className="sum-row total">
              <span>{lang === 'ua' ? 'До сплати' : 'Total'}</span>
              <strong>{formatPrice(total, lang)}</strong>
            </div>

            {/* промокод */}
            <div className="field-group mt-20">
              <label className="label">{lang === 'ua' ? 'Промокод' : 'Promo code'}</label>
              {promocode ? (
                <div className="flex-center" style={{ gap: 8 }}>
                  <span className="tag tag-accent" style={{ flex: 1 }}>{promocode.code} ✓</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPromocode(null)}>✕</button>
                </div>
              ) : (
                <div className="flex-center" style={{ gap: 6 }}>
                  <input className="input" placeholder="WELCOME10" value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)} />
                  <button className="btn btn-outline btn-sm" onClick={() => {
                    if (applyPromocode(promoInput)) setPromoInput('');
                  }}>OK</button>
                </div>
              )}
            </div>

            <Link to="/checkout" className="btn btn-primary btn-lg btn-block mt-20">
              {lang === 'ua' ? 'Оформити замовлення →' : 'Checkout →'}
            </Link>

            <div className="muted mt-10" style={{ fontSize: 12, textAlign: 'center' }}>
              🔒 {lang === 'ua' ? 'Безпечна оплата через LiqPay' : 'Secure payment via LiqPay'}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
