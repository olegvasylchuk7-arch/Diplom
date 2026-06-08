import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS, BLOG_CATEGORIES } from '../data/blog';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/format';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Blog() {
  const { lang } = useApp();
  const [category, setCategory] = useState('all');

  const posts = useMemo(
    () => category === 'all' ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === category),
    [category]
  );

  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Блог' : 'Blog' },
      ]} />
      <div className="container">
        <h1>{lang === 'ua' ? 'Блог про теплоізоляцію' : 'Insulation blog'}</h1>
        <p className="muted">{lang === 'ua'
          ? 'Інструкції, порівняння, норми ДБН — все, що допоможе зробити правильний вибір.'
          : 'Guides, comparisons, regulations — everything to help you choose right.'}</p>

        <div className="flex-center mt-20" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
            {lang === 'ua' ? 'Усі' : 'All'}
          </button>
          {BLOG_CATEGORIES.map((c) => (
            <button key={c.id} className={`chip ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
              {c.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 28 }}>
          {posts.map((post) => {
            const cat = BLOG_CATEGORIES.find((c) => c.id === post.category);
            return (
              <Link key={post.id} to={`/blog/${post.id}`} className="card" style={{ color: 'inherit', display: 'block' }}>
                <div className="tag tag-primary">{cat?.name}</div>
                <h3 style={{ margin: '12px 0 8px', fontSize: 18 }}>{post.title}</h3>
                <p className="muted" style={{ fontSize: 14 }}>{post.excerpt}</p>
                <div className="space-between mt-20" style={{ fontSize: 12, color: 'var(--c-text-2)' }}>
                  <span>{post.author}</span>
                  <span>{formatDate(post.date, lang)} • {post.readMin} {lang === 'ua' ? 'хв' : 'min'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
