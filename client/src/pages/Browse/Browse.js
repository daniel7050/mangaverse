import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import MangaCard from '../../components/MangaCard/MangaCard';
import GenreFilter from '../../components/GenreFilter/GenreFilter';
import useReadingProgress from '../../hooks/useReadingProgress';
import { getManga } from '../../utils/api';
import axios from 'axios';
import './Browse.css';

const SORT_OPTIONS = [
  { value: 'newest', label: '🆕 Newest' },
  { value: 'popular', label: '🔥 Most Popular' },
  { value: 'rating', label: '⭐ Top Rated' },
  { value: 'az', label: '🔤 A → Z' },
];
const STATUS_OPTIONS = ['all', 'ongoing', 'completed', 'hiatus'];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [manga, setManga] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState('');
  const [page, setPage] = useState(1);
  const progressMap = useReadingProgress();

  const genre = searchParams.get('genre') || '';
  const sort = searchParams.get('sort') || 'newest';
  const status = searchParams.get('status') || 'all';

  const fetchManga = useCallback(async (pageNum = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const params = { page: pageNum, limit: 18 };
      if (genre) params.genre = genre;
      if (status !== 'all') params.status = status;
      if (sort !== 'newest') params.sort = sort;
      const res = await getManga(params);
      const incoming = res.data.manga || [];
      setTotal(res.data.total || 0);
      setManga(prev => append ? [...prev, ...incoming] : incoming);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [genre, sort, status]);

  useEffect(() => { setPage(1); fetchManga(1, false); }, [fetchManga]);

  const loadMore = () => { const next = page + 1; setPage(next); fetchManga(next, true); };

  const handleScrapeMore = async () => {
    setScraping(true); setScrapeMsg('');
    try {
      await axios.post((process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/manga/scrape');
      setScrapeMsg('✅ Scraping in background… refresh in 30 seconds!');
      setTimeout(() => { setScrapeMsg(''); fetchManga(1, false); }, 30000);
    } catch {
      setScrapeMsg('❌ Scrape failed. Make sure the server is running.');
    } finally { setScraping(false); }
  };

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key); else next.set(key, value);
    setSearchParams(next);
  };

  const hasMore = manga.length < total;

  return (
    <main className="browse container">
      <div className="browse-header">
        <div>
          <h1>Browse Manga</h1>
          <p className="browse-count">{total > 0 ? `${total} titles` : 'Loading...'}</p>
        </div>
      </div>

      <div className="browse-layout">
        <aside className="browse-sidebar">
          <GenreFilter active={genre} onChange={g => setFilter('genre', g)} />
          <div className="filter-group">
            <h3>Status</h3>
            {STATUS_OPTIONS.map(s => (
              <button key={s} className={`filter-pill ${(status||'all')===s?'active':''}`} onClick={() => setFilter('status', s)}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <h3>Sort By</h3>
            {SORT_OPTIONS.map(o => (
              <button key={o.value} className={`filter-pill ${sort===o.value?'active':''}`} onClick={() => setFilter('sort', o.value)}>
                {o.label}
              </button>
            ))}
          </div>
          {(genre || status !== 'all' || sort !== 'newest') && (
            <button className="filter-clear" onClick={() => setSearchParams({})}>✕ Clear all filters</button>
          )}

          {/* Scrape more button */}
          <div className="filter-group">
            <h3>Content</h3>
            <button className="btn-scrape" onClick={handleScrapeMore} disabled={scraping}>
              {scraping ? '🔄 Scraping…' : '🕷️ Fetch More Manga'}
            </button>
            {scrapeMsg && <p className="scrape-msg">{scrapeMsg}</p>}
          </div>
        </aside>

        <div className="browse-main">
          {(genre || status !== 'all') && (
            <div className="browse-active-filters">
              {genre && <span className="active-tag">{genre}<button onClick={() => setFilter('genre','')}>×</button></span>}
              {status !== 'all' && <span className="active-tag">{status}<button onClick={() => setFilter('status','all')}>×</button></span>}
            </div>
          )}

          {loading ? (
            <div className="browse-loading">
              {Array.from({length:12}).map((_,i) => <div key={i} className="manga-card-skeleton" />)}
            </div>
          ) : manga.length === 0 ? (
            <div className="browse-empty">
              <p>😕 No manga found</p>
              <p>Try a different genre or clear filters</p>
              <button className="filter-clear" onClick={() => setSearchParams({})}>Clear filters</button>
            </div>
          ) : (
            <>
              <div className="manga-grid">
                {manga.map(m => <MangaCard key={m._id} manga={m} progress={progressMap} />)}
              </div>
              {hasMore && (
                <div className="browse-loadmore">
                  <button className="btn-loadmore" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? 'Loading…' : `Load more (${total - manga.length} remaining)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
