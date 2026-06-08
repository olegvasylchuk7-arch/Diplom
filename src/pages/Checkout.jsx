import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { NP_CITIES, getBranches, SHIPPING_TYPES } from '../data/novaposhta';
import { formatPrice } from '../utils/format';
import { generateOrderId } from '../utils/format';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Checkout() {
  const navigate = useNavigate();
  const { lang, user, cartTotals, clearCart, createOrder, pushToast, addLog } = useApp();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    shippingType: 'np-branch',
    cityRef: '',
    branchRef: '',
    payment: 'liqpay',
    comment: '',
    isB2B: false,
    company: '',
    edrpou: '',
  });

  if (cartTotals.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const shippingInfo = SHIPPING_TYPES.find((s) => s.code === form.shippingType);
  const shippingCost = cartTotals.freeShipping ? 0 : shippingInfo?.price || 0;
  const grandTotal = cartTotals.total + shippingCost;

  const branches = useMemo(
    () => form.cityRef ? getBranches(form.cityRef, form.shippingType) : [],
    [form.cityRef, form.shippingType]
  );

  const cityName = NP_CITIES.find((c) => c.ref === form.cityRef)?.name || '';
  const branch = branches.find((b) => b.ref === form.branchRef);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submitOrder = async (e) => {
    e.preventDefault();
    const id = generateOrderId();
    const order = {
      id,
      userId: user?.id || null,
      customer: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: form.phone,
      date: new Date().toISOString().slice(0, 10),
      total: grandTotal,
      status: 'new',
      items: cartTotals.items.map((it) => ({
        productId: it.productId, qty: it.qty, price: it.product.pricePerPack,
      })),
      shipping: { type: form.shippingType, city: cityName, branch: branch?.address || '' },
      payment: form.payment,
      comment: form.comment,
      isB2B: form.isB2B,
      company: form.isB2B ? form.company : undefined,
      edrpou: form.isB2B ? form.edrpou : undefined,
    };
    try {
      await createOrder(order);
      addLog(`Створено нове замовлення ${id} на суму ${grandTotal} грн`);
      clearCart();
      pushToast(lang === 'ua' ? 'Замовлення оформлено!' : 'Order placed!', 'success');
      navigate(`/account?tab=orders&highlight=${id}`);
    } catch (err) {
      pushToast(err.message || 'Помилка створення замовлення', 'error');
    }
  };

  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Кошик' : 'Cart', to: '/cart' },
        { label: lang === 'ua' ? 'Оформлення' : 'Checkout' },
      ]} />

      <div className="container">
        <h1>{lang === 'ua' ? 'Оформлення замовлення' : 'Checkout'}</h1>

        <form onSubmit={submitOrder} className="cart-layout mt-20">
          <div>
            {/* 1. Контакти */}
            <div className="card mb-20">
              <h3>1. {lang === 'ua' ? 'Контактні дані' : 'Contact details'}</h3>

              <div className="field-row">
                <div className="field-group">
                  <label className="label">{lang === 'ua' ? 'Ім\'я' : 'First name'} *</label>
                  <input className="input" required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                </div>
                <div className="field-group">
                  <label className="label">{lang === 'ua' ? 'Прізвище' : 'Last name'} *</label>
                  <input className="input" required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                </div>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label className="label">Email *</label>
                  <input type="email" className="input" required value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
                <div className="field-group">
                  <label className="label">{lang === 'ua' ? 'Телефон' : 'Phone'} *</label>
                  <input type="tel" className="input" required placeholder="+380 ___ ___ __ __"
                    value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </div>
              </div>

              <label className="filter-option mt-10">
                <input type="checkbox" checked={form.isB2B} onChange={(e) => set('isB2B', e.target.checked)} />
                {lang === 'ua' ? 'Я представляю юридичну особу (потрібні ПДВ-документи)' : 'B2B order (VAT documents required)'}
              </label>

              {form.isB2B && (
                <div className="field-row mt-10">
                  <div className="field-group">
                    <label className="label">{lang === 'ua' ? 'Назва компанії' : 'Company name'}</label>
                    <input className="input" value={form.company} onChange={(e) => set('company', e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label className="label">{lang === 'ua' ? 'ЄДРПОУ' : 'Tax ID'}</label>
                    <input className="input" value={form.edrpou} onChange={(e) => set('edrpou', e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Доставка */}
            <div className="card mb-20">
              <h3>2. {lang === 'ua' ? 'Доставка' : 'Shipping'}</h3>

              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Спосіб доставки' : 'Shipping method'}</label>
                <div style={{ display: 'grid', gap: 8 }}>
                  {SHIPPING_TYPES.map((s) => (
                    <label key={s.code} className="filter-option" style={{ padding: 10, border: '1px solid var(--c-border)', borderRadius: 8 }}>
                      <input type="radio" name="ship" value={s.code} checked={form.shippingType === s.code}
                        onChange={(e) => { set('shippingType', e.target.value); set('branchRef', ''); }} />
                      <span style={{ flex: 1 }}>{s.name}</span>
                      <strong>{cartTotals.freeShipping ? (lang === 'ua' ? 'Безкоштовно' : 'Free') : formatPrice(s.price, lang)}</strong>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label className="label">{lang === 'ua' ? 'Місто' : 'City'} *</label>
                  <select className="select" required value={form.cityRef} onChange={(e) => { set('cityRef', e.target.value); set('branchRef', ''); }}>
                    <option value="">— {lang === 'ua' ? 'Оберіть місто' : 'Select city'} —</option>
                    {NP_CITIES.map((c) => (<option key={c.ref} value={c.ref}>{c.name}</option>))}
                  </select>
                </div>
                <div className="field-group">
                  <label className="label">
                    {form.shippingType === 'np-poshtomat' && (lang === 'ua' ? 'Поштомат' : 'Parcel locker')}
                    {form.shippingType === 'np-branch' && (lang === 'ua' ? 'Відділення' : 'Branch')}
                    {form.shippingType === 'np-cargo' && (lang === 'ua' ? 'Вантажне відділення' : 'Cargo branch')}
                    {form.shippingType === 'np-courier' && (lang === 'ua' ? 'Адреса доставки' : 'Address')}
                    {' '}*
                  </label>
                  {form.shippingType === 'np-courier' ? (
                    <input className="input" required placeholder={lang === 'ua' ? 'Вулиця, будинок, квартира' : 'Street, building, flat'}
                      value={form.branchRef} onChange={(e) => set('branchRef', e.target.value)} />
                  ) : (
                    <select className="select" required disabled={!form.cityRef}
                      value={form.branchRef} onChange={(e) => set('branchRef', e.target.value)}>
                      <option value="">— {lang === 'ua' ? 'Оберіть пункт видачі' : 'Select pickup point'} —</option>
                      {branches.map((b) => (
                        <option key={b.ref} value={b.ref}>№{b.number} • {b.address}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {branch && (
                <div className="card mt-10" style={{ background: '#F1F8E9', padding: 12 }}>
                  <strong>📦 {branch.address}</strong>
                  <div className="muted" style={{ fontSize: 13 }}>🕐 {branch.hours}</div>
                </div>
              )}
            </div>

            {/* 3. Оплата */}
            <div className="card mb-20">
              <h3>3. {lang === 'ua' ? 'Оплата' : 'Payment'}</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { code: 'liqpay', name: lang === 'ua' ? '💳 Карткою онлайн (LiqPay)' : '💳 Card online (LiqPay)' },
                  { code: 'cod', name: lang === 'ua' ? '💵 Післяплата при отриманні' : '💵 Cash on delivery' },
                  ...(form.isB2B ? [{ code: 'bank', name: lang === 'ua' ? '🏦 Безготівковий розрахунок' : '🏦 Bank transfer' }] : []),
                ].map((p) => (
                  <label key={p.code} className="filter-option" style={{ padding: 10, border: '1px solid var(--c-border)', borderRadius: 8 }}>
                    <input type="radio" name="pay" value={p.code} checked={form.payment === p.code} onChange={(e) => set('payment', e.target.value)} />
                    {p.name}
                  </label>
                ))}
              </div>

              <div className="field-group mt-20">
                <label className="label">{lang === 'ua' ? 'Коментар до замовлення' : 'Order comment'}</label>
                <textarea className="textarea" rows={3} value={form.comment} onChange={(e) => set('comment', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Підсумок */}
          <aside className="cart-summary card">
            <h3>{lang === 'ua' ? 'Ваше замовлення' : 'Your order'}</h3>
            {cartTotals.items.map((it) => (
              <div key={it.productId} className="sum-row" style={{ fontSize: 13 }}>
                <span style={{ flex: 1 }}>{it.product.name.slice(0, 30)}… × {it.qty}</span>
                <strong>{formatPrice(it.product.pricePerPack * it.qty, lang)}</strong>
              </div>
            ))}

            <hr style={{ border: 'none', borderTop: '1px solid var(--c-border)', margin: '12px 0' }} />

            <div className="sum-row">
              <span>{lang === 'ua' ? 'Товари' : 'Items'}</span>
              <strong>{formatPrice(cartTotals.subtotal, lang)}</strong>
            </div>
            {cartTotals.volumeDiscount > 0 && (
              <div className="sum-row" style={{ color: 'var(--c-primary-2)' }}>
                <span>{lang === 'ua' ? `Опт. знижка (-${cartTotals.volumePct}%)` : `Volume (-${cartTotals.volumePct}%)`}</span>
                <strong>−{formatPrice(cartTotals.volumeDiscount, lang)}</strong>
              </div>
            )}
            {cartTotals.promoDiscount > 0 && (
              <div className="sum-row" style={{ color: 'var(--c-accent)' }}>
                <span>{cartTotals.promocode?.code || lang === 'ua' ? 'Промокод' : 'Promo'}</span>
                <strong>−{formatPrice(cartTotals.promoDiscount, lang)}</strong>
              </div>
            )}
            <div className="sum-row">
              <span>{lang === 'ua' ? 'Доставка' : 'Shipping'}</span>
              <strong>{shippingCost === 0 ? (lang === 'ua' ? 'Безкоштовно' : 'Free') : formatPrice(shippingCost, lang)}</strong>
            </div>
            <div className="sum-row total">
              <span>{lang === 'ua' ? 'До сплати' : 'Total'}</span>
              <strong>{formatPrice(grandTotal, lang)}</strong>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block mt-20">
              {lang === 'ua' ? 'Підтвердити замовлення' : 'Place order'}
            </button>

            <Link to="/cart" className="btn btn-ghost btn-sm btn-block mt-10">
              ← {lang === 'ua' ? 'Повернутися до кошика' : 'Back to cart'}
            </Link>
          </aside>
        </form>
      </div>
    </>
  );
}
