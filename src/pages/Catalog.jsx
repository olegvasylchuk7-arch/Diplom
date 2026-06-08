import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';

const COMBUSTIBILITIES = ['НГ', 'Г1', 'Г2', 'Г3'];
const PAGE_SIZE = 9;

export default function Catalog() {
  const { lang, products, productTypes } = useApp();
  const BRANDS = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || '';

  const [query, setQuery] = useState(initialQ);
  const [types, setTypes] = useState(initialType ? [initialType] : []);
  const [brands, setBrands] = useState([]);
  const [combust, setCombust] = useState([]);
  const [maxLambda, setMaxLambda] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [sort, setSort] = useState('hit');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    if (searchParams.get('type')) setTypes([searchParams.get('type')]);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let res = [...products];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      res = res.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }
    if (types.length) res = res.filter((p) => types.includes(p.type));
    if (brands.length) res = res.filter((p) => brands.includes(p.brand));
    if (combust.length) res = res.filter((p) => combust.includes(p.combustibility));
    if (maxLambda) res = res.filter((p) => p.lambda <= Number(maxLambda));
    if (priceFrom) res = res.filter((p) => p.pricePerPack >= Number(priceFrom));
    if (priceTo) res = res.filter((p) => p.pricePerPack <= Number(priceTo));

    switch (sort) {
      case 'price-asc':  res.sort((a, b) => a.pricePerPack - b.pricePerPack); break;
      case 'price-desc': res.sort((a, b) => b.pricePerPack - a.pricePerPack); break;
      case 'lambda':     res.sort((a, b) => a.lambda - b.lambda); break;
      case 'rating':     res.sort((a, b) => b.rating - a.rating); break;
      default: res.sort((a, b) => (b.isHit ? 1 : 0) - (a.isHit ? 1 : 0)); break;
    }
    return res;
  }, [products, query, types, brands, combust, maxLambda, priceFrom, priceTo, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = (arr, set, val) => set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const resetFilters = () => {
    setQuery(''); setTypes([]); setBrands([]); setCombust([]);
    setMaxLambda(''); setPriceFrom(''); setPriceTo(''); setPage(1);
    setSearchParams({});
  };

  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Каталог' : 'Catalog' },
      ]} />

      <div className="container">
        <h1>{lang === 'ua' ? 'Каталог утеплювачів' : 'Insulation catalog'}</h1>
        <p className="muted">{filtered.length} {lang === 'ua' ? 'товарів' : 'items'}</p>

        <div className="catalog-layout mt-20">
          <aside className="filters card">
            <h3 style={{ fontSize: 15 }}>{lang === 'ua' ? 'Фільтри' : 'Filters'}</h3>

            <div className="filter-group">
              <h4>{lang === 'ua' ? 'Тип утеплювача' : 'Type'}</h4>
              {productTypes.map((tp) => (
                <label key={tp.id} className="filter-option">
                  <input
                    type="checkbox"
                    checked={types.includes(tp.id)}
                    onChange={() => { toggle(types, setTypes, tp.id); setPage(1); }}
                  />
                  {lang === 'ua' ? tp.name : tp.nameEn}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>{lang === 'ua' ? 'Бренд' : 'Brand'}</h4>
              {BRANDS.map((b) => (
                <label key={b} className="filter-option">
                  <input
                    type="checkbox"
                    checked={brands.includes(b)}
                    onChange={() => { toggle(brands, setBrands, b); setPage(1); }}
                  />
                  {b}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>{lang === 'ua' ? 'Горючість' : 'Combustibility'}</h4>
              {COMBUSTIBILITIES.map((c) => (
                <label key={c} className="filter-option">
                  <input
                    type="checkbox"
                    checked={combust.includes(c)}
                    onChange={() => { toggle(combust, setCombust, c); setPage(1); }}
                  />
                  {c}
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>{lang === 'ua' ? 'Макс. λ' : 'Max λ'}</h4>
              <input
                type="number" step="0.001" min="0.020" max="0.060"
                className="input"
                value={maxLambda}
                onChange={(e) => { setMaxLambda(e.target.value); setPage(1); }}
                placeholder="0.040"
              />
            </div>

            <div className="filter-group">
              <h4>{lang === 'ua' ? 'Ціна, грн' : 'Price, UAH'}</h4>
              <div className="range-row">
                <input type="number" className="input" placeholder={lang === 'ua' ? 'від' : 'from'}
                       value={priceFrom} onChange={(e) => { setPriceFrom(e.target.value); setPage(1); }} />
                <input type="number" className="input" placeholder={lang === 'ua' ? 'до' : 'to'}
                       value={priceTo} onChange={(e) => { setPriceTo(e.target.value); setPage(1); }} />
              </div>
            </div>

            <button className="btn btn-ghost btn-block mt-20" onClick={resetFilters}>
              {lang === 'ua' ? 'Скинути фільтри' : 'Reset filters'}
            </button>
          </aside>

          <div>
            <div className="space-between mb-20">
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="input"
                  style={{ maxWidth: 320 }}
                  placeholder={lang === 'ua' ? 'Пошук за назвою...' : 'Search by name...'}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                />
              </div>
              <select className="select" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="hit">{lang === 'ua' ? 'Спочатку хіти' : 'Best sellers first'}</option>
                <option value="price-asc">{lang === 'ua' ? 'Від дешевих' : 'Price ↑'}</option>
                <option value="price-desc">{lang === 'ua' ? 'Від дорогих' : 'Price ↓'}</option>
                <option value="lambda">{lang === 'ua' ? 'Найменша λ' : 'Best λ'}</option>
                <option value="rating">{lang === 'ua' ? 'За рейтингом' : 'Top rated'}</option>
              </select>
            </div>

            {visible.length === 0 ? (
              <div className="card center" style={{ padding: 60 }}>
                <p style={{ fontSize: 18 }}>{lang === 'ua'
                  ? 'За вашими параметрами нічого не знайдено. Спробуйте змінити фільтри.'
                  : 'No results. Try changing the filters.'}</p>
                <button className="btn btn-outline mt-20" onClick={resetFilters}>
                  {lang === 'ua' ? 'Скинути фільтри' : 'Reset filters'}
                </button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {visible.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>

                {pageCount > 1 && (
                  <div className="pagination">
                    <a onClick={() => setPage(Math.max(1, page - 1))} style={{ cursor: 'pointer' }}>‹</a>
                    {Array.from({ length: pageCount }).map((_, i) => (
                      <a
                        key={i}
                        className={page === i + 1 ? 'active' : ''}
                        onClick={() => setPage(i + 1)}
                        style={{ cursor: 'pointer' }}
                      >{i + 1}</a>
                    ))}
                    <a onClick={() => setPage(Math.min(pageCount, page + 1))} style={{ cursor: 'pointer' }}>›</a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
