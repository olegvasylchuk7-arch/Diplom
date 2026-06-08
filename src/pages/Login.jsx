import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Login() {
  const navigate = useNavigate();
  const { lang, user, login, register } = useApp();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/account', { replace: true });
  }, [user, navigate]);

  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else                  await register(form);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: mode === 'login' ? (lang === 'ua' ? 'Вхід' : 'Sign in') : (lang === 'ua' ? 'Реєстрація' : 'Sign up') },
      ]} />

      <div className="container" style={{ maxWidth: 500 }}>
        <div className="card">
          <div className="tabs-row">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
              {lang === 'ua' ? 'Вхід' : 'Sign in'}
            </button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
              {lang === 'ua' ? 'Реєстрація' : 'Sign up'}
            </button>
          </div>

          <form onSubmit={submit}>
            {mode === 'register' && (
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Ім\'я та прізвище' : 'Full name'}</label>
                <input className="input" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div className="field-group">
              <label className="label">Email</label>
              <input type="email" className="input" required autoComplete="email"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field-group">
              <label className="label">{lang === 'ua' ? 'Пароль' : 'Password'}</label>
              <input type="password" className="input" required minLength={3}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy
                ? (lang === 'ua' ? 'Зачекайте…' : 'Please wait…')
                : mode === 'login'
                  ? (lang === 'ua' ? 'Увійти' : 'Sign in')
                  : (lang === 'ua' ? 'Створити акаунт' : 'Create account')}
            </button>
          </form>

          {mode === 'login' && (
            <div className="muted mt-20" style={{ fontSize: 13, padding: 10, background: '#FFF8E1', borderRadius: 6 }}>
              💡 {lang === 'ua'
                ? <>Вхід через Supabase Auth. Адмін: <strong>admin@teplodim.ua</strong> з паролем, який ви задали в Supabase → Authentication → Users.</>
                : <>Sign in via Supabase Auth. Admin: <strong>admin@teplodim.ua</strong> with the password you set in Supabase Authentication.</>}
            </div>
          )}
        </div>

        <div className="center mt-20">
          <Link to="/" className="muted">← {lang === 'ua' ? 'На головну' : 'Home'}</Link>
        </div>
      </div>
    </>
  );
}
