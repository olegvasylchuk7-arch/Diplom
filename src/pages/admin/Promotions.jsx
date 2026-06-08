import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { promocodesApi } from '../../lib/api';
import { VOLUME_DISCOUNTS } from '../../data/orders';
import { formatPrice } from '../../utils/format';
import Modal from '../../components/Modal';

const EMPTY = { code: '', type: 'percent', value: 10, minOrder: 1000, active: true, description: '', usedCount: 0 };

export default function AdminPromotions() {
  const { promocodes, setPromocodes, reloadPromocodes, addLog, lang, pushToast } = useApp();
  const [editing, setEditing] = useState(null);

  const savePromo = async (e) => {
    e.preventDefault();
    const p = editing;
    if (!p.code.trim()) return;
    p.code = p.code.toUpperCase();
    try {
      if (p._editing) {
        const updated = await promocodesApi.update(p.code, p);
        setPromocodes((prev) => prev.map((x) => x.code === p.code ? updated : x));
        addLog(`Оновлено промокод ${p.code}`);
      } else {
        const created = await promocodesApi.create(p);
        setPromocodes((prev) => [...prev, created]);
        addLog(`Створено промокод ${p.code} (${p.type === 'percent' ? p.value + '%' : 'shipping'}, мін. ${p.minOrder} грн)`);
      }
      reloadPromocodes();
      pushToast('Збережено', 'success');
      setEditing(null);
    } catch (err) {
      console.error(err);
      const detail = [err.message, err.details, err.hint, err.code].filter(Boolean).join(' • ');
      pushToast(`Помилка: ${detail || 'невідома'}`, 'error');
    }
  };

  const togglePromo = async (code) => {
    const promo = promocodes.find((x) => x.code === code);
    setPromocodes((prev) => prev.map((p) => p.code === code ? { ...p, active: !p.active } : p));
    try {
      await promocodesApi.update(code, { active: !promo.active });
      addLog(`Промокод ${code} ${promo.active ? 'деактивовано' : 'активовано'}`);
    } catch (err) {
      setPromocodes((prev) => prev.map((p) => p.code === code ? { ...p, active: promo.active } : p));
      pushToast(err.message, 'error');
    }
  };

  const deletePromo = async (code) => {
    if (!confirm(`Видалити промокод ${code}?`)) return;
    const backup = promocodes;
    setPromocodes((prev) => prev.filter((p) => p.code !== code));
    try {
      await promocodesApi.remove(code);
      addLog(`Видалено промокод ${code}`);
    } catch (err) {
      setPromocodes(backup);
      pushToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="admin-header">
        <h1>🎁 {lang === 'ua' ? 'Промокоди та знижки' : 'Promo codes & discounts'}</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing({ ...EMPTY })}>
          + {lang === 'ua' ? 'Додати промокод' : 'Add promo'}
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="head"><h3>{lang === 'ua' ? 'Активні промокоди' : 'Promo codes'}</h3></div>
        <table className="table">
          <thead>
            <tr>
              <th>{lang === 'ua' ? 'Код' : 'Code'}</th>
              <th>{lang === 'ua' ? 'Тип' : 'Type'}</th>
              <th>{lang === 'ua' ? 'Значення' : 'Value'}</th>
              <th>{lang === 'ua' ? 'Мін. замовлення' : 'Min order'}</th>
              <th>{lang === 'ua' ? 'Опис' : 'Description'}</th>
              <th>{lang === 'ua' ? 'Використано' : 'Used'}</th>
              <th>{lang === 'ua' ? 'Статус' : 'Status'}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {promocodes.map((p) => (
              <tr key={p.code}>
                <td><code style={{ background: '#f4f7f4', padding: '2px 8px', borderRadius: 4 }}>{p.code}</code></td>
                <td>{p.type === 'percent' ? '%' : p.type === 'fixed' ? '₴' : '🚚'}</td>
                <td><strong>
                  {p.type === 'percent' && `−${p.value}%`}
                  {p.type === 'fixed' && `−${formatPrice(p.value, lang)}`}
                  {p.type === 'shipping' && (lang === 'ua' ? 'Безкоштовна доставка' : 'Free shipping')}
                </strong></td>
                <td>{formatPrice(p.minOrder, lang)}</td>
                <td style={{ fontSize: 13 }}>{p.description}</td>
                <td>{p.usedCount}</td>
                <td>
                  <button className={`tag ${p.active ? 'tag-primary' : 'tag-danger'}`} onClick={() => togglePromo(p.code)}>
                    {p.active ? (lang === 'ua' ? 'Активний' : 'Active') : (lang === 'ua' ? 'Вимкнено' : 'Off')}
                  </button>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...p, _editing: true })}>✎</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => deletePromo(p.code)} style={{ color: 'var(--c-danger)' }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-table-wrap mt-20">
        <div className="head"><h3>{lang === 'ua' ? 'Об\'ємні знижки (фіксовані)' : 'Volume discounts'}</h3></div>
        <table className="table">
          <thead><tr><th>{lang === 'ua' ? 'Від обсягу' : 'From volume'}</th><th>{lang === 'ua' ? 'Знижка' : 'Discount'}</th></tr></thead>
          <tbody>
            {VOLUME_DISCOUNTS.map((v) => (
              <tr key={v.fromM3}>
                <td>{v.fromM3} м³</td>
                <td><strong>−{v.percent}%</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ padding: 12, fontSize: 13 }}>
          {lang === 'ua' ? 'Знижки нараховуються автоматично у кошику при досягненні відповідного обсягу.' : 'Applied automatically in cart.'}
        </p>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?._editing ? 'Редагувати' : 'Новий промокод'}>
        {editing && (
          <form onSubmit={savePromo}>
            <div className="field-row">
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Код' : 'Code'}</label>
                <input className="input" required value={editing.code} disabled={editing._editing}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" />
              </div>
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Тип' : 'Type'}</label>
                <select className="select" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  <option value="percent">{lang === 'ua' ? 'Відсоток (%)' : 'Percent (%)'}</option>
                  <option value="fixed">{lang === 'ua' ? 'Фікс. сума (грн)' : 'Fixed (UAH)'}</option>
                  <option value="shipping">{lang === 'ua' ? 'Безкоштовна доставка' : 'Free shipping'}</option>
                </select>
              </div>
            </div>
            {editing.type !== 'shipping' && (
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Значення' : 'Value'}</label>
                <input type="number" className="input" required value={editing.value} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} />
              </div>
            )}
            <div className="field-group">
              <label className="label">{lang === 'ua' ? 'Мінімальне замовлення, грн' : 'Min order, UAH'}</label>
              <input type="number" className="input" required value={editing.minOrder} onChange={(e) => setEditing({ ...editing, minOrder: Number(e.target.value) })} />
            </div>
            <div className="field-group">
              <label className="label">{lang === 'ua' ? 'Опис' : 'Description'}</label>
              <input className="input" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <label className="filter-option">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
              {lang === 'ua' ? 'Активний' : 'Active'}
            </label>

            <div className="flex-center mt-20" style={{ gap: 8 }}>
              <button type="submit" className="btn btn-primary">{lang === 'ua' ? 'Зберегти' : 'Save'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>{lang === 'ua' ? 'Скасувати' : 'Cancel'}</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
