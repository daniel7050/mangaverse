import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import MangaCard from '../../components/MangaCard/MangaCard';
import { getMangaById, getChapterList, addBookmark, removeBookmark, getBookmarks, getManga } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Detail.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Detail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [scraping, setScraping] = useState(false);

  const loadData = useCallback(async () => {
    setManga(null); setChapters([]); setRelated([]);
    setLoading(true); setBookmarked(false); setShowAllChapters(false);
    try {
      const [mRes, cRes] = await Promise.all([getMangaById(id), getChapterList(id)]);
      setManga(mRes.data);
      setChapters(cRes.data);
      if (mRes.data.genres?.length) {
        const relRes = await getManga({ genre: mRes.data.genres[0], limit: 7 });
        setRelated((relRes.data.manga || []).filter(m => m._id !== id).slice(0, 6));
      }
      if (user) {
        const bRes = await getBookmarks();
        setBookmarked(bRes.data.some(b => b._id === id));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [id, user]);

  useEffect(() => {
    loadData();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [loadData]);

  const toggleBookmark = async () => {
    if (!user) return;
    setBookmarkLoading(true);
    try {
      if (bookmarked) { await removeBookmark(id); setBookmarked(false); }
      else { await addBookmark(id); setBookmarked(true); }
    } catch (err) { console.error(err); }
    finally { setBookmarkLoading(false); }
  };

  const handleScrapeChapters = async () => {
    setScraping(true);
    try {
      await axios.post(`${API}/manga/${id}/scrape-chapters`);
      // Poll for chapters every 3 seconds until they appear
      const poll = setInterval(async () => {
        try {
          const res = await getChapterList(id);
          if (res.data.length > 0) {
            setChapters(res.data);
            clearInterval(poll);
            setScraping(false);
          }
        } catch { clearInterval(poll); setScraping(false); }
      }, 3000);
      // Stop polling after 60 seconds max
      setTimeout(() => { clearInterval(poll); setScraping(false); }, 60000);
    } catch { setScraping(false); }
  };

  if (loading) return (
    <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading manga…</p>
    </div>
  );

  if (!manga) return <div className="container detail-error">Manga not found</div>;

  const visibleChapters = showAllChapters ? chapters : chapters.slice(0, 20);
  const firstChapter = chapters[0];
  const lastChapter = chapters[chapters.length - 1];

  return (
    <main className="detail container">
      <div className="detail-hero">
        <div className="detail-cover">
          {manga.coverImage
            ? <img src={manga.coverImage} alt={manga.title} />
            : <div className="detail-cover-placeholder">📖</div>}
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
              {manga.genres.map(g => <Link key={g} to={`/browse?genre=${g}`} className="genre-tag">{g}</Link>)}
            </div>
          )}
          {manga.description && <p className="detail-description">{manga.description}</p>}

          <div className="detail-actions">
            {firstChapter ? (
              <Link to={`/read/${id}/${firstChapter.number}`} className="btn-primary">📖 Start Reading</Link>
            ) : (
              <button
                className="btn-primary btn-scrape-ch"
                onClick={handleScrapeChapters}
                disabled={scraping}
              >
                {scraping
                  ? <><span className="btn-spinner" /> Loading Chapters…</>
                  : '🕷️ Load Chapters'
                }
              </button>
            )}
            {lastChapter && lastChapter.number !== firstChapter?.number && (
              <Link to={`/read/${id}/${lastChapter.number}`} className="btn-secondary">⏭ Latest</Link>
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

      {/* Chapter List — only show section if chapters exist */}
      {chapters.length > 0 && (
        <section className="detail-chapters">
          <div className="section-header">
            <h2>📋 Chapters ({chapters.length})</h2>
          </div>
          <div className="chapter-list">
            {visibleChapters.map(ch => (
              <Link key={ch._id} to={`/read/${id}/${ch.number}`} className="chapter-item">
                <span className="chapter-num">Chapter {ch.number}</span>
                {ch.title && <span className="chapter-title">{ch.title}</span>}
                <span className="chapter-date">{new Date(ch.createdAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
          {chapters.length > 20 && (
            <button className="btn-loadmore" onClick={() => setShowAllChapters(s => !s)}>
              {showAllChapters ? 'Show less' : `Show all ${chapters.length} chapters`}
            </button>
          )}
        </section>
      )}

      {/* Related Manga */}
      {related.length > 0 && (
        <section className="detail-related">
          <div className="section-header">
            <h2>🔗 More like this</h2>
            <Link to={`/browse?genre=${manga.genres[0]}`}>See all</Link>
          </div>
          <div className="manga-grid">{related.map(m => <MangaCard key={m._id} manga={m} />)}</div>
        </section>
      )}
    </main>
  );
}
