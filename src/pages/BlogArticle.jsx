import { useParams, Link, Navigate } from 'react-router-dom';
import { getPost, BLOG_POSTS } from '../data/blog';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/format';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';

export default function BlogArticle() {
  const { id } = useParams();
  const { lang, getProduct } = useApp();
  const post = getPost(id);
  if (!post) return <Navigate to="/blog" replace />;

  const related = (post.relatedProducts || []).map(getProduct).filter(Boolean);
  const otherPosts = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Блог' : 'Blog', to: '/blog' },
        { label: post.title },
      ]} />
      <div className="container" style={{ maxWidth: 1100 }}>
        <article style={{ background: '#fff', padding: '40px 50px', borderRadius: 14, boxShadow: 'var(--shadow-sm)' }}>
          <div className="muted" style={{ fontSize: 13 }}>
            {formatDate(post.date, lang)} • {post.author} • {post.readMin} {lang === 'ua' ? 'хв читання' : 'min read'}
          </div>
          <h1 style={{ marginTop: 12 }}>{post.title}</h1>
          <div style={{ fontSize: 17, color: 'var(--c-text-2)', marginBottom: 24 }}>{post.excerpt}</div>

          {post.content.map((block, i) => {
            if (block.type === 'h2') return <h2 key={i} style={{ marginTop: 24 }}>{block.text}</h2>;
            if (block.type === 'p')  return <p key={i} style={{ fontSize: 16, lineHeight: 1.7 }}>{block.text}</p>;
            if (block.type === 'ul') return (
              <ul key={i} style={{ fontSize: 16, lineHeight: 1.7 }}>
                {block.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            );
            return null;
          })}
        </article>

        {related.length > 0 && (
          <section className="mt-40">
            <h2>{lang === 'ua' ? 'Товари до статті' : 'Related products'}</h2>
            <div className="product-grid mt-20">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {otherPosts.length > 0 && (
          <section className="mt-40">
            <h2>{lang === 'ua' ? 'Інші статті' : 'More articles'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: 20 }}>
              {otherPosts.map((p) => (
                <Link key={p.id} to={`/blog/${p.id}`} className="card" style={{ color: 'inherit' }}>
                  <h4>{p.title}</h4>
                  <div className="muted" style={{ fontSize: 13 }}>{p.excerpt}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
