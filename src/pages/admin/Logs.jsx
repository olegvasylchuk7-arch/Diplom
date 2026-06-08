import { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function AdminLogs() {
  const { logs, lang } = useApp();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter((l) => l.action.toLowerCase().includes(q) || l.admin.toLowerCase().includes(q));
  }, [logs, search]);

  return (
    <>
      <div className="admin-header">
        <h1>📜 {lang === 'ua' ? 'Журнал дій адміністраторів' : 'Admin action log'}</h1>
        <div className="muted">{filtered.length} {lang === 'ua' ? 'записів' : 'records'}</div>
      </div>

      <div className="admin-filters">
        <input className="input" placeholder={lang === 'ua' ? 'Пошук за дією або email...' : 'Search...'}
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 160 }}>{lang === 'ua' ? 'Дата і час' : 'Timestamp'}</th>
              <th style={{ width: 220 }}>{lang === 'ua' ? 'Адмін' : 'Admin'}</th>
              <th>{lang === 'ua' ? 'Дія' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{l.ts}</td>
                <td>{l.admin}</td>
                <td>{l.action}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={3} className="center muted" style={{ padding: 40 }}>— {lang === 'ua' ? 'порожньо' : 'empty'} —</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
