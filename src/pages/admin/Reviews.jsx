import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatDate } from '../../utils/format';
import RatingStars from '../../components/RatingStars';

export default function AdminReviews() {
  const { reviews, moderateReview, lang, getProduct } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = reviews.filter((r) => filter === 'all' || r.status === filter);

  return (
    <>
      <div className="admin-header">
        <h1>⭐ {lang === 'ua' ? 'Модерація відгуків' : 'Reviews moderation'}</h1>
        <div className="muted">{filtered.length} / {reviews.length}</div>
      </div>

      <div className="flex-center mb-20" style={{ gap: 8 }}>
        <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>{lang === 'ua' ? 'Усі' : 'All'} ({reviews.length})</button>
        <button className={`chip ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          ⏳ {lang === 'ua' ? 'На модерації' : 'Pending'} ({reviews.filter((r) => r.status === 'pending').length})
        </button>
        <button className={`chip ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>
          ✓ {lang === 'ua' ? 'Опубліковано' : 'Approved'}
        </button>
        <button className={`chip ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
          ✕ {lang === 'ua' ? 'Відхилено' : 'Rejected'}
        </button>
      </div>

      {filtered.length === 0 && <div className="card center muted" style={{ padding: 40 }}>— {lang === 'ua' ? 'немає відгуків' : 'no reviews'} —</div>}

      {filtered.map((r) => {
        const p = getProduct(r.productId);
        return (
          <div key={r.id} className="card mb-10">
            <div className="space-between">
              <div>
                <strong>{r.author}</strong>
                <span className="muted" style={{ marginLeft: 12 }}>{formatDate(r.date, lang)}</span>
                <span className={`tag tag-${r.status === 'approved' ? 'primary' : r.status === 'rejected' ? 'danger' : 'warn'}`} style={{ marginLeft: 12 }}>
                  {r.status === 'approved' ? '✓ Опубліковано' : r.status === 'rejected' ? '✕ Відхилено' : '⏳ Очікує'}
                </span>
              </div>
              <RatingStars value={r.rating} />
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {lang === 'ua' ? 'Товар:' : 'Product:'} <strong>{p?.name || r.productId}</strong>
            </div>
            <p style={{ marginTop: 10 }}>{r.text}</p>
            <div className="flex-center mt-10" style={{ gap: 6 }}>
              {r.status !== 'approved' && (
                <button className="btn btn-primary btn-sm" onClick={() => moderateReview(r.id, 'approved')}>✓ {lang === 'ua' ? 'Опублікувати' : 'Approve'}</button>
              )}
              {r.status !== 'rejected' && (
                <button className="btn btn-ghost btn-sm" onClick={() => moderateReview(r.id, 'rejected')} style={{ color: 'var(--c-danger)' }}>✕ {lang === 'ua' ? 'Відхилити' : 'Reject'}</button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
