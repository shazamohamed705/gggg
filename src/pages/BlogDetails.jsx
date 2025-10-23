import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './BlogDetails.css';

const ADS_COUNT = 4;

function getLangField(obj, base) {
  if (!obj) return '';
  // Prefer 'an' if API uses it, then 'ar', then 'en'
  return obj[`${base}_an`] || obj[`${base}_ar`] || obj[`${base}_en`] || '';
}

function useBlogDetails(slug) {
  const [post, setPost] = React.useState(null);
  const [related, setRelated] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;

    const fromCache = () => {
      try {
        const cache = sessionStorage.getItem('blogs_cache');
        if (!cache) return null;
        const list = JSON.parse(cache);
        if (!Array.isArray(list)) return null;
        return list.find((b) => b.slug === slug) || null;
      } catch {
        return null;
      }
    };

    const applyMeta = (item) => {
      if (!item) return;
      const title = getLangField(item, 'title') || 'تفاصيل المقال';
      document.title = title;
      const ensureMeta = (name, content) => {
        if (!content) return;
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('name', name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };
      ensureMeta('description', getLangField(item, 'meta_description') || getLangField(item, 'description'));
      ensureMeta('keywords', getLangField(item, 'meta_keywords'));
    };

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        // Try direct endpoint by slug first
        const res = await fetch(`https://ghaimcenter.com/laravel/api/blogs/${slug}`);
        if (res.ok) {
          const json = await res.json();
          const item = json?.data || json;
          if (isMounted) {
            setPost(item);
            applyMeta(item);
          }
          // fetch related after we know slug
          try {
            const relRes = await fetch('https://ghaimcenter.com/laravel/api/blogs');
            const relJson = await relRes.json();
            const list = Array.isArray(relJson?.data) ? relJson.data : [];
            const filtered = list.filter((b) => b.slug !== slug).slice(0, 6);
            if (isMounted) setRelated(filtered);
          } catch {}
          return;
        }
        // Fallback to list cache / fetch all then filter
        const cached = fromCache();
        if (cached) {
          if (isMounted) {
            setPost(cached);
            applyMeta(cached);
          }
          try {
            const relRes = await fetch('https://ghaimcenter.com/laravel/api/blogs');
            const relJson = await relRes.json();
            const list = Array.isArray(relJson?.data) ? relJson.data : [];
            const filtered = list.filter((b) => b.slug !== slug).slice(0, 6);
            if (isMounted) setRelated(filtered);
          } catch {}
          return;
        }
        const listRes = await fetch('https://ghaimcenter.com/laravel/api/blogs');
        const listJson = await listRes.json();
        const list = Array.isArray(listJson?.data) ? listJson.data : [];
        const found = list.find((b) => b.slug === slug) || null;
        if (isMounted) {
          setPost(found);
          if (!found) setError('لم يتم العثور على المقال');
          applyMeta(found);
          const filtered = list.filter((b) => b.slug !== slug).slice(0, 6);
          setRelated(filtered);
        }
      } catch (e) {
        const cached = fromCache();
        if (isMounted) {
          if (cached) {
            setPost(cached);
            applyMeta(cached);
          } else {
            setError('تعذر الاتصال بالخادم');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => { isMounted = false; };
  }, [slug]);

  return { post, loading, error, related };
}

const BlogDetails = () => {
  const { slug } = useParams();
  const { post, loading, error, related } = useBlogDetails(slug);
  const [moreArticles, setMoreArticles] = React.useState([]);

  const title = getLangField(post, 'title');
  const description = getLangField(post, 'description');
  const image = post?.image || '/imge.png';

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('https://ghaimcenter.com/laravel/api/blogs');
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        const filtered = list.filter((b) => b.slug !== slug).slice(0, 3);
        if (active) setMoreArticles(filtered);
      } catch {}
    };
    load();
    return () => { active = false; };
  }, [slug]);

  return (
    <>
    <div className="blog-details-page">
      {/* Full-bleed banner */}
      <section className="blog-banner banner-bleed" aria-label="صورة المقال">
        <div className="banner-media">
          {loading ? (
            <div className="banner-skeleton" aria-hidden="true"></div>
          ) : (
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="banner-img"
              onError={(e) => { e.currentTarget.src = '/imge.png'; }}
            />
          )}
        </div>
        {/* hide overlay title to avoid duplication; main title shown in article header */}
      </section>

      <div className="blog-details-container">
        <div className="blog-details-breadcrumbs">
          <Link to="/blogs" className="crumb">المدونة</Link>
          <span className="sep">/</span>
          <span className="crumb current">{title || (loading ? '...' : 'تفاصيل')}</span>
        </div>

        {error && (
          <div className="blog-details-error">{error}</div>
        )}

        {/* Banner moved above as full-bleed */}

        {/* Two-column layout: right article, left ads */}
        <section className="details-grid">
          <article className="article-col" aria-label="المقال">
            <div className="article-card" aria-label="المقال">
              <h1 className="article-title">{title || (loading ? '...' : '')}</h1>
              {loading ? (
                <div className="content-skeleton">
                  <div className="line" style={{ width: '80%' }}></div>
                  <div className="line" style={{ width: '95%' }}></div>
                  <div className="line" style={{ width: '90%' }}></div>
                  <div className="line" style={{ width: '70%' }}></div>
                </div>
              ) : (
                (() => {
                  const lines = [];
                  if (post?.description_en) lines.push(post.description_en);
                  if (post?.meta_description_en) lines.push(post.meta_description_en);
                  if (post?.meta_keywords_en) lines.push(post.meta_keywords_en);
                  // fallbacks if EN not available
                  if (lines.length === 0) {
                    if (post?.description_ar) lines.push(post.description_ar);
                    if (post?.meta_description_ar) lines.push(post.meta_description_ar);
                    if (post?.meta_keywords_ar) lines.push(post.meta_keywords_ar);
                  }
                  // final fallback: split combined description
                  if (lines.length === 0 && description) {
                    lines.push(...description.split(/\n|[.!؟!،,]+/).map((s) => s.trim()).filter(Boolean));
                  }
                  if (lines.length === 0) return null;
                  return (
                    <ol className="points-list" dir="rtl">
                      {lines.map((txt, idx) => (
                        <li key={idx} className="point-item">
                          <span className="num-badge" aria-hidden="true">{idx + 1}</span>
                          <span className="point-text">{txt}</span>
                        </li>
                      ))}
                    </ol>
                  );
                })()
              )}
            </div>
          </article>
          <aside className="ads-col" aria-label="إعلانات ذات صلة">
            <div className="ads-panel">
              <h2 className="ads-title">إعلانات ذات صلة</h2>
              <div className="ads-list">
              {related.map((ad) => {
                const href = ad.slug ? `/blogs/${ad.slug}` : undefined;
                const name = getLangField(ad, 'title') || 'إعلان';
                return (
                  <Link key={ad.id} to={href || '#'} className="ad-item" aria-label={name}>
                    <img
                      className="ad-thumb"
                      src={ad.image}
                      alt={name}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = '/imge.png'; }}
                    />
                    <div className="ad-info">
                      <div className="ad-name">{name}</div>
                    </div>
                  </Link>
                );
              })}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
    <section className="more-articles" aria-label="مقالات ذات صلة">
      <div className="more-wrapper">
        <h2 className="more-title">مقالات ذات صلة</h2>
        <div className="more-grid">
          {moreArticles.map((m) => {
            const t = getLangField(m, 'title') || 'مقال';
            const href = m.slug ? `/blogs/${m.slug}` : '#';
            return (
              <Link key={m.id} to={href} className="more-card" aria-label={t}>
                <div className="more-thumb">
                  <img src={m.image} alt={t} loading="lazy" onError={(e) => { e.currentTarget.src = '/imge.png'; }} />
                  <span className="more-badge">جديد</span>
                </div>
                <div className="more-body">
                  <h3 className="more-card-title">{t}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
    </>
  );
};

export default React.memo(BlogDetails);


