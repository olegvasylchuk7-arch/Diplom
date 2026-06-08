import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useState } from 'react';

export default function Header() {
  const { t, lang, setLang, cart, compare, wishlist, user, logout } = useApp();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/catalog?q=${encodeURIComponent(search)}`);
  };

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="container">
          <div>📞 +380 44 200 5050 • {lang === 'ua' ? 'Пн-Сб 9:00–19:00' : 'Mon-Sat 9:00–19:00'}</div>
          <div className="flex-center" style={{ gap: 14 }}>
            <Link to="/blog">{t('nav.blog')}</Link>
            <span>•</span>
            <Link to="/about">{t('nav.about')}</Link>
            <span>•</span>
            <Link to="/contacts">{t('nav.contacts')}</Link>
            {user?.role === 'admin' && (
              <>
                <span>•</span>
                <Link to="/admin" style={{ color: '#FFE082', fontWeight: 600 }}>⚙ Admin</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container">
          <Link to="/" className="logo">
            <span className="logo-icon">🏠</span>
            <span>
              ТеплоДім<br />
              <small>теплоізоляція для дому</small>
            </span>
          </Link>

          <form className="search" onSubmit={submitSearch}>
            <input
              type="text"
              placeholder={t('header.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>

          <div className="header-actions">
            <div className="lang-switch">
              <button className={lang === 'ua' ? 'active' : ''} onClick={() => setLang('ua')}>UA</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            </div>
            <Link to="/compare" className="icon-btn" title={t('nav.compare')}>
              ⚖
              {compare.length > 0 && <span className="badge">{compare.length}</span>}
            </Link>
            <Link to="/account?tab=wishlist" className="icon-btn" title="Обране">
              ♡
              {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
            </Link>
            <Link to={user ? '/account' : '/login'} className="icon-btn" title={t('header.account')}>👤</Link>
            <Link to="/cart" className="icon-btn" title={t('header.cart')}>
              🛒
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
            {user && (
              <button className="btn btn-ghost btn-sm" onClick={logout} title={t('header.logout')}>↪</button>
            )}
          </div>
        </div>
      </div>

      <nav className="nav-main">
        <div className="container">
          <NavLink to="/" end>{lang === 'ua' ? 'Головна' : 'Home'}</NavLink>
          <NavLink to="/catalog">{t('nav.catalog')}</NavLink>
          <NavLink to="/calculator">🧮 {t('nav.calculator')}</NavLink>
          <NavLink to="/compare">{t('nav.compare')}</NavLink>
          <NavLink to="/blog">{t('nav.blog')}</NavLink>
          <NavLink to="/wholesale">{lang === 'ua' ? 'Опт' : 'Wholesale'}</NavLink>
          <NavLink to="/contacts">{t('nav.contacts')}</NavLink>
        </div>
      </nav>
    </header>
  );
}
