import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMangaById, getChapterList, addBookmark, removeBookmark, getBookmarks } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Detail.css';

export default function Detail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, cRes] = await Promise.all([getMangaById(id), getChapterList(id)]);
        setManga(mRes.data);
        setChapters(cRes.data);
        if (user) {
          const bRes = await getBookmarks();
          setBookmarked(bRes.data.some(b => b._id === id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const toggleBookmark = async () => {
    if (!user) return;
    setBookmarkLoading(true);
    try {
      if (bookmarked) { await removeBookmark(id); setBookmarked(false); }
      else { await addBookmark(id); setBookmarked(true); }
    } catch (err) { console.error(err); }
    finally { setBookmarkLoading(false); }
  };

  if (loading) return <div className="container"><div className="spinner" /></div>;
  if (!manga) return <div className="container detail-error">Manga not found</div>;

  const visibleChapters = showAllChapters ? chapters : chapters.slice(0, 20);
  const firstChapter = chapters[0];
  const lastChapter = chapters[chapters.length - 1];

  return (
    <main className="detail container">
      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-cover">
          {manga.coverImage
            ? <img src={manga.coverImage} alt={manga.title} />
            : <div className="detail-cover-placeholder">📖</div>
          }
        </div>
        <div className="detail-info">
          <h1 className="detail-title">{manga.title}</h1>
          <div className="detail-meta">
            <span>✍️ {manga.author}</span>
            <span className={`badge badge-${manga.status}`}>{manga.status}</span>
            {manga.rating > 0 && <span>⭐ {manga.rating.toFixed(1)}</span>}
            <span>👁️ {manga.viewCount.toLocaleString()} views</span>
          </div>

          {manga.genres.length > 0 && (
            <div className="detail-genres">
              {manga.genres.map(g => (
                <Link key={g} to={`/browse?genre=${g}`} className="genre-tag">{g}</Link>
              ))}
            </div>
          )}

          {manga.description && (
            <p className="detail-description">{manga.description}</p>
          )}

          <div className="detail-actions">
            {firstChapter ? (
              <Link to={`/read/${id}/${firstChapter.number}`} className="btn-primary">
                📖 Start Reading
              </Link>
            ) : (
              <span className="btn-primary btn-disabled">No chapters yet</span>
            )}
            {lastChapter && lastChapter.number !== firstChapter?.number && (
              <Link to={`/read/${id}/${lastChapter.number}`} className="btn-secondary">
                ⏭ Latest Chapter
              </Link>
            )}
            {user && (
              <button
                className={`btn-bookmark ${bookmarked ? 'bookmarked' : ''}`}
                onClick={toggleBookmark} disabled={bookmarkLoading}
              >
                {bookmarked ? '🔖 Saved' : '+ Save'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <section className="detail-chapters">
        <div className="section-header">
          <h2>📋 Chapters ({chapters.length})</h2>
        </div>
        {chapters.length === 0 ? (
          <p className="detail-empty">No chapters available yet.</p>
        ) : (
          <>
            <div className="chapter-list">
              {visibleChapters.map(ch => (
                <Link key={ch._id} to={`/read/${id}/${ch.number}`} className="chapter-item">
                  <span className="chapter-num">Chapter {ch.number}</span>
                  {ch.title && <span className="chapter-title">{ch.title}</span>}
                  <span className="chapter-date">
                    {new Date(ch.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
            {chapters.length > 20 && (
              <button className="btn-loadmore" onClick={() => setShowAllChapters(s => !s)}>
                {showAllChapters ? 'Show less' : `Show all ${chapters.length} chapters`}
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}
