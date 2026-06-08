import { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ORDER_STATUSES } from '../../data/orders';
import { formatPrice, formatDate } from '../../utils/format';
import { generateInvoicePDF } from '../../utils/pdf';
import Modal from '../../components/Modal';

export default function AdminOrders() {
  const { orders, updateOrderStatus, lang, getProduct } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let res = [...orders];
    if (statusFilter !== 'all') res = res.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      res = res.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone?.includes(q)
      );
    }
    return res;
  }, [orders, search, statusFilter]);

  return (
    <>
      <div className="admin-header">
        <h1>📦 {lang === 'ua' ? 'Замовлення' : 'Orders'}</h1>
        <div className="muted">{filtered.length} / {orders.length}</div>
      </div>

      <div className="admin-filters">
        <input
          className="input"
          placeholder={lang === 'ua' ? 'Пошук за № / клієнтом / email / телефоном...' : 'Search...'}
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">{lang === 'ua' ? 'Усі статуси' : 'All statuses'}</option>
          {ORDER_STATUSES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>№</th>
              <th>{lang === 'ua' ? 'Дата' : 'Date'}</th>
              <th>{lang === 'ua' ? 'Клієнт' : 'Customer'}</th>
              <th>{lang === 'ua' ? 'Сума' : 'Total'}</th>
              <th>{lang === 'ua' ? 'Доставка' : 'Shipping'}</th>
              <th>{lang === 'ua' ? 'Статус' : 'Status'}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td><strong style={{ fontSize: 13 }}>{o.id}</strong></td>
                <td>{formatDate(o.date, lang)}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{o.customer}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{o.email}</div>
                </td>
                <td><strong>{formatPrice(o.total, lang)}</strong></td>
                <td style={{ fontSize: 12 }}>{o.shipping?.city}</td>
                <td>
                  <select className="select" style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                    {ORDER_STATUSES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(o)}>👁</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => generateInvoicePDF(o)}>📄</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="center muted" style={{ padding: 40 }}>— {lang === 'ua' ? 'нічого не знайдено' : 'no orders'} —</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} large title={selected ? `${lang === 'ua' ? 'Замовлення' : 'Order'} ${selected.id}` : null}>
        {selected && (
          <div>
            <div className="field-row">
              <div><strong>{lang === 'ua' ? 'Клієнт:' : 'Customer:'}</strong> {selected.customer}</div>
              <div><strong>{lang === 'ua' ? 'Дата:' : 'Date:'}</strong> {formatDate(selected.date, lang)}</div>
            </div>
            <div className="field-row">
              <div><strong>Email:</strong> {selected.email}</div>
              <div><strong>{lang === 'ua' ? 'Телефон:' : 'Phone:'}</strong> {selected.phone}</div>
            </div>
            <div className="card mt-20" style={{ background: '#f8faf8' }}>
              <strong>📦 {lang === 'ua' ? 'Доставка:' : 'Shipping:'}</strong> {selected.shipping?.city} • {selected.shipping?.branch}
            </div>

            <h4 className="mt-20">{lang === 'ua' ? 'Товари' : 'Items'}</h4>
            <table className="table">
              <thead><tr><th>{lang === 'ua' ? 'Найменування' : 'Name'}</th><th>{lang === 'ua' ? 'К-сть' : 'Qty'}</th><th>{lang === 'ua' ? 'Ціна' : 'Price'}</th><th>{lang === 'ua' ? 'Сума' : 'Sum'}</th></tr></thead>
              <tbody>
                {selected.items.map((it) => {
                  const p = getProduct(it.productId);
                  return (
                    <tr key={it.productId}>
                      <td>{p?.name}</td>
                      <td>{it.qty}</td>
                      <td>{formatPrice(it.price, lang)}</td>
                      <td><strong>{formatPrice(it.qty * it.price, lang)}</strong></td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan={3}><strong>{lang === 'ua' ? 'Всього' : 'Total'}</strong></td>
                  <td><strong style={{ fontSize: 18, color: 'var(--c-primary)' }}>{formatPrice(selected.total, lang)}</strong></td>
                </tr>
              </tbody>
            </table>

            <div className="flex-center mt-20" style={{ gap: 8 }}>
              <button className="btn btn-primary" onClick={() => generateInvoicePDF(selected)}>📄 {lang === 'ua' ? 'Накладна PDF' : 'Invoice PDF'}</button>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>{lang === 'ua' ? 'Закрити' : 'Close'}</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
