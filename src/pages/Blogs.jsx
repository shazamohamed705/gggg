import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Blogs.css';

const Blogs = () => {
  const [blogs, setBlogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const navigate = useNavigate();

  React.useEffect(() => {
    let isMounted = true;
    const fetchBlogs = async () => {
      try {
        const res = await fetch('https://ghaimcenter.com/laravel/api/blogs');
        const json = await res.json();
        if (res.ok && json?.status === 'success') {
          const list = Array.isArray(json.data) ? json.data : [];
          if (isMounted) setBlogs(list);
          try { sessionStorage.setItem('blogs_cache', JSON.stringify(list)); } catch {}
        } else if (isMounted) {
          setError(json?.message || 'تعذر جلب المقالات');
        }
      } catch (e) {
        if (isMounted) setError('تعذر الاتصال بالخادم');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBlogs();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="blogs-page">
      <div className="blogs-container">
        <h1 className="blogs-title">المدونة</h1>

        {error && (
          <div className="blogs-error">{error}</div>
        )}

        {loading ? (
          <div className="blogs-loading">جاري تحميل المقالات...</div>
        ) : (
          <div className="blogs-grid">
            {blogs.map((post) => {
              const title = post.title_an || post.title_ar || post.title_en || 'مقال';
              const desc = post.description_ar || post.description_en || '';
              const href = post.slug ? `/blogs/${post.slug}` : undefined;
              return (
                <article
                  key={post.id}
                  className="blog-card"
                  aria-label={title}
                  onClick={() => { if (href) navigate(href); }}
                  role={href ? 'button' : undefined}
                  tabIndex={href ? 0 : undefined}
                  onKeyDown={(e) => { if (href && (e.key === 'Enter' || e.key === ' ')) navigate(href); }}
                >
                  <div className="blog-card-head">
                    <div className="blog-image-wrapper">
                      <img
                        src={post.image}
                        alt={title}
                        className="blog-image"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/imge.png'; }}
                      />
                    </div>
                    <div className="blog-image-overlay"></div>
                    <div className="blog-badge">المدونة</div>
                  </div>
                  <div className="blog-content">
                    <h2 className="blog-card-title line-clamp-1">{title}</h2>
                    {/* footer removed as requested - no date display */}
                  </div>
                  {href && (
                    <Link className="blog-cta" to={href} aria-label={`اقرأ المزيد عن: ${title}`}>اقرأ المزيد</Link>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Blogs);


