import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { formatPrice } from '../utils/format';
import RatingStars from '../components/RatingStars';
import Breadcrumbs from '../components/Breadcrumbs';

const ICONS = { mineral: '🟨', basalt: '🟫', eps: '🤍', xps: '🟦', pur: '🟧', eco: '🟩' };

// Вибираємо найкраще і найгірше значення серед колонок для підсвічування
const bestWorst = (values, mode = 'min') => {
  const nums = values.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
  if (nums.length < 2) return { best: null, worst: null };
  return { best: mode === 'min' ? Math.min(...nums) : Math.max(...nums),
           worst: mode === 'min' ? Math.max(...nums) : Math.min(...nums) };
};

const cellClass = (val, { best, worst }) => {
  const n = Number(val);
  if (Number.isNaN(n) || best === null) return '';
  if (n === best) return 'best';
  if (n === worst) return 'worst';
  return '';
};

export default function Compare() {
  const { compare, toggleCompare, clearCompare, addToCart, lang, getProduct } = useApp();
  const products = compare.map(getProduct).filter(Boolean);

  if (products.length === 0) {
    return (
      <>
        <Breadcrumbs items={[
          { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
          { label: lang === 'ua' ? 'Порівняння' : 'Compare' },
        ]} />
        <div className="container">
          <div className="card center" style={{ padding: 60 }}>
            <h2>⚖ {lang === 'ua' ? 'Порівняння порожнє' : 'Compare list is empty'}</h2>
            <p className="muted">{lang === 'ua'
              ? 'Додайте до 4-х товарів у порівняння через кнопку ⚖ на картці.'
              : 'Add up to 4 products with the ⚖ button on a product card.'}</p>
            <Link to="/catalog" className="btn btn-primary mt-20">
              {lang === 'ua' ? 'Перейти до каталогу' : 'Go to catalog'}
            </Link>
          </div>
        </div>
      </>
    );
  }

  const lambdas    = products.map((p) => p.lambda);
  const prices     = products.map((p) => p.pricePerM3);
  const densities  = products.map((p) => p.density);
  const vapors     = products.map((p) => p.vaporPerm);

  const lambdaStats = bestWorst(lambdas, 'min');
  const priceStats  = bestWorst(prices, 'min');
  const vaporStats  = bestWorst(vapors, 'max');

  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Порівняння' : 'Compare' },
      ]} />

      <div className="container">
        <div className="space-between">
          <h1>{lang === 'ua' ? 'Порівняння товарів' : 'Compare products'}</h1>
          <button className="btn btn-ghost" onClick={clearCompare}>{lang === 'ua' ? 'Очистити' : 'Clear'}</button>
        </div>
        <p className="muted">{products.length} / 4 {lang === 'ua' ? 'товарів' : 'products'}</p>

        <div className="compare-table mt-20">
          <table>
            <tbody>
              <tr>
                <th style={{ width: 200 }}></th>
                {products.map((p) => (
                  <td key={p.id} className="image-cell">{ICONS[p.type]}</td>
                ))}
              </tr>
              <tr>
                <th></th>
                {products.map((p) => (
                  <td key={p.id}>
                    <div style={{ fontSize: 11, color: 'var(--c-text-2)', textTransform: 'uppercase' }}>{p.brand}</div>
                    <Link to={`/product/${p.id}`} style={{ fontWeight: 600 }}>{p.name}</Link>
                    <div className="mt-10"><RatingStars value={p.rating} /></div>
                  </td>
                ))}
              </tr>
              <tr>
                <th>{lang === 'ua' ? 'Ціна' : 'Price'}</th>
                {products.map((p) => (
                  <td key={p.id}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--c-primary)' }}>
                      {formatPrice(p.pricePerPack, lang)}
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>{lang === 'ua' ? 'упаковка' : 'pack'} ({p.packM3} м³)</div>
                  </td>
                ))}
              </tr>
              <tr>
                <th>{lang === 'ua' ? 'Ціна за м³' : 'Price per m³'}</th>
                {products.map((p) => (
                  <td key={p.id} className={cellClass(p.pricePerM3, priceStats)}>
                    {formatPrice(p.pricePerM3, lang)}
                  </td>
                ))}
              </tr>
              <tr>
                <th>{lang === 'ua' ? 'Теплопровідність λ' : 'Conductivity λ'}</th>
                {products.map((p) => (
                  <td key={p.id} className={cellClass(p.lambda, lambdaStats)}>
                    {p.lambda} {lang === 'ua' ? 'Вт/(м·К)' : 'W/(m·K)'}
                  </td>
                ))}
              </tr>
              <tr>
                <th>{lang === 'ua' ? 'Щільність' : 'Density'}</th>
                {products.map((p) => (
                  <td key={p.id}>{p.density} кг/м³</td>
                ))}
              </tr>
              <tr>
                <th>{lang === 'ua' ? 'Паропроникність' : 'Vapor permeability'}</th>
                {products.map((p) => (
                  <td key={p.id} className={cellClass(p.vaporPerm, vaporStats)}>
                    {p.vaporPerm}
                  </td>
                ))}
              </tr>
              <tr>
                <th>{lang === 'ua' ? 'Горючість' : 'Combustibility'}</th>
                {products.map((p) => (
                  <td key={p.id}>
                    <span className={`tag ${p.combustibility === 'НГ' ? 'tag-primary' : 'tag-warn'}`}>
                      {p.combustibility}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <th>{lang === 'ua' ? 'Товщина' : 'Thickness'}</th>
                {products.map((p) => (<td key={p.id}>{p.thicknessMm} мм</td>))}
              </tr>
              <tr>
                <th>{lang === 'ua' ? 'Об\'єм упаковки' : 'Pack volume'}</th>
                {products.map((p) => (<td key={p.id}>{p.packM3} м³ ({p.packArea} м²)</td>))}
              </tr>
              <tr>
                <th>{lang === 'ua' ? 'Підходить для' : 'Suitable for'}</th>
                {products.map((p) => (
                  <td key={p.id} style={{ fontSize: 12 }}>
                    {(p.suitable || []).map((s) => ({
                      wall: 'стін', roof: 'покрівлі', floor: 'підлоги',
                      facade: 'фасаду', mansard: 'мансарди', pipes: 'труб',
                    })[s] || s).join(', ')}
                  </td>
                ))}
              </tr>
              <tr>
                <th></th>
                {products.map((p) => (
                  <td key={p.id}>
                    <button className="btn btn-primary btn-sm btn-block" onClick={() => addToCart(p.id)}>
                      🛒 {lang === 'ua' ? 'У кошик' : 'Add'}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-block mt-10"
                      onClick={() => toggleCompare(p.id)}
                    >
                      ✕ {lang === 'ua' ? 'Прибрати' : 'Remove'}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card mt-20" style={{ background: '#E8F5E9' }}>
          <strong>{lang === 'ua' ? 'Як читати таблицю:' : 'How to read the table:'}</strong>
          <div className="muted mt-10" style={{ fontSize: 13 }}>
            • <span style={{ background: '#E8F5E9', padding: '2px 6px', fontWeight: 700, color: 'var(--c-primary)' }}>Зелене</span> {lang === 'ua' ? '— найкращий параметр серед обраних товарів' : '— best value among selected'}<br />
            • <span style={{ background: '#FFEBEE', padding: '2px 6px' }}>Червоне</span> {lang === 'ua' ? '— найгірший. Для λ і ціни — менше краще, для паропроникності — більше краще.' : '— worst. Lower λ and price is better; higher vapor permeability is better.'}
          </div>
        </div>
      </div>
    </>
  );
}
