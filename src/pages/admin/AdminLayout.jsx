import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

export default function AdminLayout() {
  const { user, authReady, logout, lang } = useApp();
  if (!authReady) {
    return <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: '#5F6B6F' }}>Завантаження…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/account" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <Link to="/" className="logo">
            <span className="logo-icon">🏠</span>
            <span>ТеплоДім</span>
          </Link>
          <div className="mt-10"><small>admin panel</small></div>
        </div>
        <nav>
          <NavLink to="/admin" end><span>📊</span> Dashboard</NavLink>
          <NavLink to="/admin/orders"><span>📦</span> {lang === 'ua' ? 'Замовлення' : 'Orders'}</NavLink>
          <NavLink to="/admin/products"><span>🏷</span> {lang === 'ua' ? 'Товари' : 'Products'}</NavLink>
          <NavLink to="/admin/reviews"><span>⭐</span> {lang === 'ua' ? 'Відгуки' : 'Reviews'}</NavLink>
          <NavLink to="/admin/promotions"><span>🎁</span> {lang === 'ua' ? 'Промокоди' : 'Promotions'}</NavLink>
          <NavLink to="/admin/logs"><span>📜</span> {lang === 'ua' ? 'Логи' : 'Logs'}</NavLink>
        </nav>
        <div className="sidebar-foot">
          <div>👤 {user.email}</div>
          <button className="btn btn-ghost btn-sm mt-10" onClick={logout} style={{ color: '#c0d0c0' }}>↪ {lang === 'ua' ? 'Вийти' : 'Sign out'}</button>
          <div className="mt-10"><Link to="/" style={{ color: '#7a8a7a' }}>← {lang === 'ua' ? 'На сайт' : 'Back to store'}</Link></div>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
