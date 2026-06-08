import { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { productsApi } from '../../lib/api';
import { formatPrice } from '../../utils/format';
import Modal from '../../components/Modal';

const EMPTY_PRODUCT = {
  sku: '', name: '', brand: '', type: 'mineral',
  lambda: 0.04, density: 30, vaporPerm: 0.3, combustibility: 'НГ',
  thicknessMm: 100, pricePerPack: 1000, pricePerM3: 2000,
  packM3: 0.5, packArea: 5, stock: 100, rating: 4.5, reviewsCount: 0,
  image: 'custom', description: '', suitable: [],
};

export default function AdminProducts() {
  const { products: allProducts, setProducts, productTypes, reloadProducts, addLog, lang, pushToast } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allProducts, search, typeFilter]);

  const saveProduct = async (e) => {
    e.preventDefault();
    const p = editing;
    try {
      if (p.id && allProducts.some((x) => x.id === p.id)) {
        const updated = await productsApi.update(p.id, p);
        setProducts((prev) => prev.map((x) => x.id === p.id ? updated : x));
        addLog(`Оновлено товар ${p.sku} «${p.name}»`);
        pushToast('Товар оновлено', 'success');
      } else {
        const created = await productsApi.create(p);
        setProducts((prev) => [...prev, created]);
        addLog(`Додано товар ${p.sku} «${p.name}»`);
        pushToast('Товар додано', 'success');
      }
      reloadProducts();
      setEditing(null);
    } catch (err) {
      console.error(err);
      const detail = [err.message, err.details, err.hint, err.code].filter(Boolean).join(' • ');
      pushToast(`Помилка: ${detail || 'не вдалося зберегти'}`, 'error');
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Видалити «${p.name}»?`)) return;
    const backup = allProducts;
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    try {
      await productsApi.remove(p.id);
      addLog(`Видалено товар ${p.sku} «${p.name}»`);
      pushToast('Товар видалено', 'success');
    } catch (err) {
      setProducts(backup);
      console.error(err);
      pushToast(err.message || 'Помилка видалення', 'error');
    }
  };

  const importCSV = async () => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return;
    const header = lines[0].split(',').map((s) => s.trim());
    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((s) => s.trim());
      const obj = {};
      header.forEach((h, idx) => obj[h] = cols[idx]);
      if (!obj.name) continue;
      try {
        await productsApi.create({
          sku: obj.sku || `CSV-${Date.now()}-${i}`,
          name: obj.name,
          brand: obj.brand || 'Custom',
          type: obj.type || 'mineral',
          lambda: Number(obj.lambda) || 0.04,
          density: Number(obj.density) || 30,
          vaporPerm: Number(obj.vaporPerm) || 0.3,
          combustibility: obj.combustibility || 'НГ',
          thicknessMm: Number(obj.thicknessMm) || 100,
          pricePerPack: Number(obj.pricePerPack) || 0,
          pricePerM3: Number(obj.pricePerM3) || 0,
          packM3: Number(obj.packM3) || 0.5,
          packArea: Number(obj.packArea) || 5,
          stock: Number(obj.stock) || 0,
          image: 'csv',
          description: obj.description || '',
          suitable: (obj.suitable || '').split('|').filter(Boolean),
        });
        count++;
      } catch (e) { console.error('CSV row failed:', e); }
    }
    await reloadProducts();
    addLog(`Імпортовано ${count} товарів з CSV`);
    pushToast(`Імпортовано ${count} товарів`, 'success');
    setCsvOpen(false); setCsvText('');
  };

  return (
    <>
      <div className="admin-header">
        <h1>🏷 {lang === 'ua' ? 'Товари' : 'Products'}</h1>
        <div className="flex-center" style={{ gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setCsvOpen(true)}>📥 {lang === 'ua' ? 'Імпорт CSV' : 'Import CSV'}</button>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing({ ...EMPTY_PRODUCT })}>
            + {lang === 'ua' ? 'Додати товар' : 'Add product'}
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <input className="input" placeholder={lang === 'ua' ? 'Пошук...' : 'Search...'} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">{lang === 'ua' ? 'Усі типи' : 'All types'}</option>
          {productTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>{lang === 'ua' ? 'Найменування' : 'Name'}</th>
              <th>{lang === 'ua' ? 'Тип' : 'Type'}</th>
              <th>λ</th>
              <th>{lang === 'ua' ? 'Ціна' : 'Price'}</th>
              <th>{lang === 'ua' ? 'Залишок' : 'Stock'}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td><code style={{ fontSize: 12 }}>{p.sku}</code></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{p.brand}</div>
                </td>
                <td>
                  <span className="tag tag-primary">{productTypes.find((t) => t.id === p.type)?.name}</span>
                </td>
                <td>{p.lambda}</td>
                <td><strong>{formatPrice(p.pricePerPack, lang)}</strong></td>
                <td>
                  {p.stock > 50
                    ? <span style={{ color: 'var(--c-primary-2)' }}>● {p.stock}</span>
                    : p.stock > 0
                      ? <span style={{ color: 'var(--c-accent)' }}>● {p.stock}</span>
                      : <span style={{ color: 'var(--c-danger)' }}>● 0</span>}
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...p })}>✎</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p)} style={{ color: 'var(--c-danger)' }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* модалка редагування */}
      <Modal open={!!editing} onClose={() => setEditing(null)} large
        title={editing?.id ? (lang === 'ua' ? 'Редагувати товар' : 'Edit product') : (lang === 'ua' ? 'Новий товар' : 'New product')}>
        {editing && (
          <form onSubmit={saveProduct}>
            <div className="field-row">
              <div className="field-group">
                <label className="label">SKU</label>
                <input className="input" required value={editing.sku} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} />
              </div>
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Бренд' : 'Brand'}</label>
                <input className="input" required value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} />
              </div>
            </div>
            <div className="field-group">
              <label className="label">{lang === 'ua' ? 'Найменування' : 'Name'}</label>
              <input className="input" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="field-row-3">
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Тип' : 'Type'}</label>
                <select className="select" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  {productTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Горючість' : 'Combustibility'}</label>
                <select className="select" value={editing.combustibility} onChange={(e) => setEditing({ ...editing, combustibility: e.target.value })}>
                  {['НГ', 'Г1', 'Г2', 'Г3', 'Г4'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Залишок (уп.)' : 'Stock'}</label>
                <input type="number" className="input" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />
              </div>
            </div>
            <div className="field-row-3">
              <div className="field-group">
                <label className="label">λ, Вт/(м·К)</label>
                <input type="number" step="0.001" className="input" value={editing.lambda} onChange={(e) => setEditing({ ...editing, lambda: Number(e.target.value) })} />
              </div>
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Щільність, кг/м³' : 'Density'}</label>
                <input type="number" className="input" value={editing.density} onChange={(e) => setEditing({ ...editing, density: Number(e.target.value) })} />
              </div>
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Паропроник.' : 'Vapor'}</label>
                <input type="number" step="0.01" className="input" value={editing.vaporPerm} onChange={(e) => setEditing({ ...editing, vaporPerm: Number(e.target.value) })} />
              </div>
            </div>
            <div className="field-row-3">
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Товщина, мм' : 'Thickness'}</label>
                <input type="number" className="input" value={editing.thicknessMm} onChange={(e) => setEditing({ ...editing, thicknessMm: Number(e.target.value) })} />
              </div>
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Об\'єм уп., м³' : 'Pack m³'}</label>
                <input type="number" step="0.01" className="input" value={editing.packM3} onChange={(e) => setEditing({ ...editing, packM3: Number(e.target.value) })} />
              </div>
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Ціна за уп.' : 'Price/pack'}</label>
                <input type="number" className="input" value={editing.pricePerPack} onChange={(e) => setEditing({ ...editing, pricePerPack: Number(e.target.value) })} />
              </div>
            </div>
            <div className="field-group">
              <label className="label">{lang === 'ua' ? 'Опис' : 'Description'}</label>
              <textarea className="textarea" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="flex-center mt-20" style={{ gap: 8 }}>
              <button type="submit" className="btn btn-primary">{lang === 'ua' ? 'Зберегти' : 'Save'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>{lang === 'ua' ? 'Скасувати' : 'Cancel'}</button>
            </div>
          </form>
        )}
      </Modal>

      {/* CSV модалка */}
      <Modal open={csvOpen} onClose={() => setCsvOpen(false)} large title={lang === 'ua' ? 'Імпорт товарів з CSV' : 'CSV import'}>
        <p className="muted">{lang === 'ua' ? 'Перший рядок — заголовки колонок. Підтримуються:' : 'First row — column names. Supported:'}</p>
        <code style={{ background: '#f4f7f4', padding: 8, display: 'block', borderRadius: 4, fontSize: 12, marginBottom: 12 }}>
          sku, name, brand, type, lambda, density, vaporPerm, combustibility, thicknessMm, pricePerPack, pricePerM3, packM3, packArea, stock, description, suitable
        </code>
        <p className="muted" style={{ fontSize: 12 }}>{lang === 'ua' ? 'Поле suitable — список через `|`, наприклад: wall|roof|facade' : 'Field suitable — list separated by `|`'}</p>
        <textarea className="textarea" rows={10} value={csvText} onChange={(e) => setCsvText(e.target.value)}
          placeholder="sku,name,brand,type,lambda,density,...
CUST-1,Test product,Brand,mineral,0.038,30,0.4,НГ,100,950,1800,0.5,5,100,Description,wall|roof"
        />
        <div className="flex-center mt-20" style={{ gap: 8 }}>
          <button className="btn btn-primary" onClick={importCSV}>📥 {lang === 'ua' ? 'Імпортувати' : 'Import'}</button>
          <button className="btn btn-ghost" onClick={() => setCsvOpen(false)}>{lang === 'ua' ? 'Скасувати' : 'Cancel'}</button>
        </div>
      </Modal>
    </>
  );
}
