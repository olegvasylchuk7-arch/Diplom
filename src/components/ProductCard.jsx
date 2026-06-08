import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { formatPrice } from '../utils/format';
import RatingStars from './RatingStars';

const ICONS = {
  mineral: '🟨', basalt: '🟫', eps: '🤍', xps: '🟦', pur: '🟧', eco: '🟩',
};

export default function ProductCard({ product }) {
  const { addToCart, toggleCompare, toggleWishlist, compare, wishlist, lang, productTypes } = useApp();
  const type = productTypes.find((t) => t.id === product.type);
  const inCompare = compare.includes(product.id);
  const inWishlist = wishlist.includes(product.id);

  return (
    <div className="product-card">
      {product.isHit && <span className="pc-hit-badge">{lang === 'ua' ? 'ХІТ' : 'TOP'}</span>}
      <div className="pc-icon-actions">
        <button
          className={inCompare ? 'active' : ''}
          onClick={() => toggleCompare(product.id)}
          title={lang === 'ua' ? 'До порівняння' : 'Compare'}
        >⚖</button>
        <button
          className={inWishlist ? 'active' : ''}
          onClick={() => toggleWishlist(product.id)}
          title={lang === 'ua' ? 'В обране' : 'Wishlist'}
        >♡</button>
      </div>
      <Link
        to={`/product/${product.id}`}
        className="pc-image"
        data-label={lang === 'ua' ? (type?.name || '') : (type?.nameEn || '')}
      >
        {ICONS[product.type] || '📦'}
      </Link>
      <div className="pc-body">
        <div className="pc-brand">{product.brand}</div>
        <div className="pc-name">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </div>
        <div className="pc-rating">
          <RatingStars value={product.rating} />
          <span>({product.reviewsCount})</span>
        </div>
        <div className="pc-specs">
          <span className="pc-spec">λ {product.lambda}</span>
          <span className="pc-spec">{product.thicknessMm} мм</span>
          <span className="pc-spec">{product.combustibility}</span>
        </div>
        <div className="pc-price">
          {formatPrice(product.pricePerPack, lang)}
          <small>{lang === 'ua' ? 'за упаковку' : 'per pack'} ({product.packM3} м³)</small>
        </div>
      </div>
      <div className="pc-actions">
        <button className="btn btn-primary btn-sm" onClick={() => addToCart(product.id)}>
          🛒 {lang === 'ua' ? 'У кошик' : 'Add'}
        </button>
        <Link to={`/product/${product.id}`} className="btn btn-outline btn-sm">
          {lang === 'ua' ? 'Деталі' : 'Details'}
        </Link>
      </div>
    </div>
  );
}
