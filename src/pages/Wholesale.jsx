import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { VOLUME_DISCOUNTS } from '../data/orders';
import { formatPrice } from '../utils/format';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Wholesale() {
  const { lang, pushToast } = useApp();
  const [form, setForm] = useState({ company: '', name: '', phone: '', email: '', volume: '', message: '' });
  const submit = (e) => {
    e.preventDefault();
    pushToast(lang === 'ua' ? 'Заявку відправлено! Менеджер зв\'яжеться протягом години.' : 'Request submitted!', 'success');
    setForm({ company: '', name: '', phone: '', email: '', volume: '', message: '' });
  };
  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Опт' : 'Wholesale' },
      ]} />
      <div className="container" style={{ maxWidth: 900 }}>
        <h1>🏗 {lang === 'ua' ? 'Гуртові поставки' : 'Wholesale supplies'}</h1>
        <p className="muted">{lang === 'ua'
          ? 'Працюємо з будівельними компаніями, забудовниками та реселерами. Прямі ціни виробника, договірні відстрочки, доставка на об\'єкт.'
          : 'Working with construction companies, developers and resellers. Direct factory prices, payment delays, delivery to site.'}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 24 }}>
          {VOLUME_DISCOUNTS.map((v) => (
            <div key={v.fromM3} className="card center" style={{ background: '#F1F8E9' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--c-primary)' }}>−{v.percent}%</div>
              <div className="muted">{lang === 'ua' ? `від ${v.fromM3} м³` : `from ${v.fromM3} m³`}</div>
            </div>
          ))}
          <div className="card center" style={{ background: '#FFF3E0' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-accent)' }}>{lang === 'ua' ? 'Договірна' : 'Custom'}</div>
            <div className="muted">{lang === 'ua' ? 'від 100 м³' : 'from 100 m³'}</div>
          </div>
        </div>

        <div className="card mt-30">
          <h3>{lang === 'ua' ? 'Запит на гуртову ціну' : 'Wholesale price request'}</h3>
          <form onSubmit={submit}>
            <div className="field-row">
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Компанія' : 'Company'} *</label>
                <input className="input" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Контактна особа' : 'Contact person'} *</label>
                <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div className="field-row-3">
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Телефон' : 'Phone'} *</label>
                <input type="tel" className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="field-group">
                <label className="label">Email *</label>
                <input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field-group">
                <label className="label">{lang === 'ua' ? 'Орієнтовний обсяг, м³' : 'Approx. volume, m³'}</label>
                <input type="number" className="input" value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} />
              </div>
            </div>
            <div className="field-group">
              <label className="label">{lang === 'ua' ? 'Деталі' : 'Details'}</label>
              <textarea className="textarea" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={lang === 'ua' ? 'Які матеріали цікавлять, об\'єкт, регіон...' : 'Materials, site, region...'} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              {lang === 'ua' ? 'Надіслати заявку' : 'Submit request'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
