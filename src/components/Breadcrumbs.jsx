import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <div className="container">
      <nav className="breadcrumbs">
        {items.map((it, i) => (
          <span key={i}>
            {i > 0 && <span className="sep">/</span>}{' '}
            {it.to ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
          </span>
        ))}
      </nav>
    </div>
  );
}
