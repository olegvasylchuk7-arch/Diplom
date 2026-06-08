import { useState } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ORDER_STATUSES } from '../data/orders';
import { formatPrice, formatDate } from '../utils/format';
import { generateInvoicePDF, generateWarrantyPDF } from '../utils/pdf';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';

const STATUS_FLOW = ['new', 'paid', 'packed', 'shipped', 'delivered'];

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';
  const highlight = searchParams.get('highlight');
  const [tab, setTab] = useState(initialTab);
  const {
    lang, user, authReady, orders, calcSaves, deleteCalculation,
    wishlist, addresses, addAddress, removeAddress, addToCart, logout, getProduct,
  } = useApp();

  if (!authReady) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center', color: '#5F6B6F' }}>Завантаження…</div>;
  if (!user) return <Navigate to="/login" replace />;

  const userOrders = orders.filter((o) => o.email === user.email || user.role === 'admin');
  const wishlistProducts = wishlist.map(getProduct).filter(Boolean);

  const setActive = (t) => { setTab(t); setSearchParams({ tab: t }); };

  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Кабінет' : 'My account' },
      ]} />

      <div className="container">
        <div className="space-between">
          <div>
            <h1>{lang === 'ua' ? 'Особистий кабінет' : 'My account'}</h1>
            <p className="muted">{user.name} • {user.email}</p>
          </div>
          <button className="btn btn-ghost" onClick={logout}>↪ {lang === 'ua' ? 'Вийти' : 'Sign out'}</button>
        </div>

        <div className="tabs-row mt-20">
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => setActive('orders')}>
            📦 {lang === 'ua' ? 'Замовлення' : 'Orders'} ({userOrders.length})
          </button>
          <button className={tab === 'calcs' ? 'active' : ''} onClick={() => setActive('calcs')}>
            🧮 {lang === 'ua' ? 'Розрахунки' : 'Calculations'} ({calcSaves.length})
          </button>
          <button className={tab === 'wishlist' ? 'active' : ''} onClick={() => setActive('wishlist')}>
            ♡ {lang === 'ua' ? 'Обране' : 'Wishlist'} ({wishlist.length})
          </button>
          <button className={tab === 'addresses' ? 'active' : ''} onClick={() => setActive('addresses')}>
            📍 {lang === 'ua' ? 'Адреси' : 'Addresses'} ({addresses.length})
          </button>
          <button className={tab === 'documents' ? 'active' : ''} onClick={() => setActive('documents')}>
            📄 {lang === 'ua' ? 'Документи' : 'Documents'}
          </button>
        </div>

        {/* ----- Замовлення ----- */}
        {tab === 'orders' && (
          <div>
            {userOrders.length === 0 && (
              <div className="card center" style={{ padding: 40 }}>
                <p className="muted">{lang === 'ua' ? 'У вас ще немає замовлень' : 'No orders yet'}</p>
                <Link to="/catalog" className="btn btn-primary mt-20">
                  {lang === 'ua' ? 'Перейти в каталог' : 'Browse catalog'}
                </Link>
              </div>
            )}
            {userOrders.map((order) => {
              const stIdx = STATUS_FLOW.indexOf(order.status);
              const isCancelled = order.status === 'cancelled';
              return (
                <div key={order.id} className="card mb-20" style={highlight === order.id ? { borderColor: 'var(--c-primary)', borderWidth: 2 } : null}>
                  <div className="space-between">
                    <div>
                      <strong>№ {order.id}</strong>
                      <span className="muted" style={{ marginLeft: 12 }}>{formatDate(order.date, lang)}</span>
                    </div>
                    <span className={`tag tag-${isCancelled ? 'danger' : stIdx === 4 ? 'primary' : 'info'}`}>
                      {ORDER_STATUSES.find((s) => s.code === order.status)?.name}
                    </span>
                  </div>

                  {!isCancelled && (
                    <div className="status-timeline mt-20">
                      {STATUS_FLOW.map((code, i) => {
                        const cls = i < stIdx ? 'done' : i === stIdx ? 'active' : '';
                        return (
                          <div key={code} className={`point ${cls}`}>
                            <div className="dot" />
                            <div className="name">{ORDER_STATUSES.find((s) => s.code === code)?.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <table className="specs-table mt-20">
                    <tbody>
                      {order.items.map((it) => {
                        const p = getProduct(it.productId);
                        return (
                          <tr key={it.productId}>
                            <td>{p?.name || it.productId} × {it.qty}</td>
                            <td>{formatPrice(it.qty * it.price, lang)}</td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td><strong>{lang === 'ua' ? 'Всього' : 'Total'}</strong></td>
                        <td><strong style={{ color: 'var(--c-primary)', fontSize: 18 }}>{formatPrice(order.total, lang)}</strong></td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="muted" style={{ fontSize: 13 }}>
                    📦 {order.shipping?.city} • {order.shipping?.branch}
                  </div>

                  <div className="flex-center mt-20" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => generateInvoicePDF(order)}>
                      📄 {lang === 'ua' ? 'Накладна PDF' : 'Invoice PDF'}
                    </button>
                    {order.status === 'delivered' && (
                      <button className="btn btn-outline btn-sm" onClick={() => generateWarrantyPDF(order)}>
                        🛡 {lang === 'ua' ? 'Гарантія PDF' : 'Warranty PDF'}
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => {
                        order.items.forEach((it) => addToCart(it.productId, it.qty));
                      }}>↺ {lang === 'ua' ? 'Повторити' : 'Reorder'}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ----- Розрахунки ----- */}
        {tab === 'calcs' && (
          <div>
            {calcSaves.length === 0 ? (
              <div className="card center" style={{ padding: 40 }}>
                <p className="muted">{lang === 'ua'
                  ? 'У вас ще немає збережених розрахунків. Скористайтесь калькулятором.'
                  : 'No saved calculations yet.'}</p>
                <Link to="/calculator" className="btn btn-primary mt-20">🧮 {lang === 'ua' ? 'Калькулятор' : 'Calculator'}</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {calcSaves.map((c) => (
                  <div key={c.id} className="card">
                    <div className="muted" style={{ fontSize: 12 }}>{formatDate(c.savedAt, lang)} • {c.id}</div>
                    <h4 style={{ margin: '6px 0' }}>{c.objectTypeName} • {c.regionName}</h4>
                    <div className="muted" style={{ fontSize: 13 }}>{c.insulationName}</div>
                    <div className="mt-10">
                      📐 {c.area.toFixed(1)} м² • 🔹 {c.recommendedMm} мм • 📦 {c.packs} уп.
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-primary)', marginTop: 8 }}>
                      {formatPrice(c.totalPrice, lang)}
                    </div>
                    <div className="flex-center mt-10" style={{ gap: 6 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => addToCart(c.insulationId, c.packs)}>
                        🛒 {lang === 'ua' ? 'У кошик' : 'Add'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteCalculation(c.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----- Бажання ----- */}
        {tab === 'wishlist' && (
          wishlistProducts.length === 0 ? (
            <div className="card center" style={{ padding: 40 }}>
              <p className="muted">{lang === 'ua' ? 'Список обраного порожній' : 'Wishlist is empty'}</p>
              <Link to="/catalog" className="btn btn-primary mt-20">{lang === 'ua' ? 'У каталог' : 'Catalog'}</Link>
            </div>
          ) : (
            <div className="product-grid">
              {wishlistProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )
        )}

        {/* ----- Адреси ----- */}
        {tab === 'addresses' && (
          <AddressList lang={lang} addresses={addresses} onAdd={addAddress} onRemove={removeAddress} />
        )}

        {/* ----- Документи ----- */}
        {tab === 'documents' && (
          <div>
            <p className="muted">{lang === 'ua'
              ? 'Накладні та гарантійні талони ваших замовлень. Завантажте у форматі PDF.'
              : 'Invoices and warranty certificates for your orders.'}</p>
            <table className="table mt-20">
              <thead>
                <tr>
                  <th>№ {lang === 'ua' ? 'замовлення' : 'order'}</th>
                  <th>{lang === 'ua' ? 'Дата' : 'Date'}</th>
                  <th>{lang === 'ua' ? 'Сума' : 'Total'}</th>
                  <th>{lang === 'ua' ? 'Документи' : 'Documents'}</th>
                </tr>
              </thead>
              <tbody>
                {userOrders.map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.id}</strong></td>
                    <td>{formatDate(o.date, lang)}</td>
                    <td>{formatPrice(o.total, lang)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => generateInvoicePDF(o)}>📄 PDF</button>
                      {o.status === 'delivered' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => generateWarrantyPDF(o)} style={{ marginLeft: 6 }}>🛡 PDF</button>
                      )}
                    </td>
                  </tr>
                ))}
                {userOrders.length === 0 && <tr><td colSpan={4} className="muted center">— {lang === 'ua' ? 'немає документів' : 'no documents'} —</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function AddressList({ lang, addresses, onAdd, onRemove }) {
  const [form, setForm] = useState({ label: '', city: '', branch: '' });
  const submit = (e) => {
    e.preventDefault();
    if (!form.label || !form.city) return;
    onAdd(form);
    setForm({ label: '', city: '', branch: '' });
  };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {addresses.map((a) => (
          <div key={a.id} className="card">
            <strong>{a.label}</strong>
            <div className="muted" style={{ fontSize: 14 }}>{a.city}</div>
            <div className="muted" style={{ fontSize: 13 }}>{a.branch}</div>
            <button className="btn btn-ghost btn-sm mt-10" onClick={() => onRemove(a.id)}>✕ {lang === 'ua' ? 'Видалити' : 'Remove'}</button>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="card mt-20">
        <h4>{lang === 'ua' ? 'Додати адресу' : 'Add address'}</h4>
        <div className="field-row-3">
          <input className="input" required placeholder={lang === 'ua' ? 'Назва (Дім, Дача...)' : 'Label'}
            value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <input className="input" required placeholder={lang === 'ua' ? 'Місто' : 'City'}
            value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="input" placeholder={lang === 'ua' ? 'Відділення НП / адреса' : 'NP branch / address'}
            value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary btn-sm mt-20">
          + {lang === 'ua' ? 'Додати' : 'Add'}
        </button>
      </form>
    </div>
  );
}
