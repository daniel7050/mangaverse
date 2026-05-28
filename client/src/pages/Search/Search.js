import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MangaCard from '../../components/MangaCard/MangaCard';
import { searchManga, getManga } from '../../utils/api';
import './Search.css';

const GENRES = ['Action','Adventure','Comedy','Drama','Fantasy','Horror','Mystery',
  'Romance','Sci-Fi','Slice of Life','Superhero','Martial Arts','Sports',
  'Supernatural','Psychological','Historical'];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');

  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';

  const doSearch = useCallback(async () => {
    if (!q && !genre) { setResults([]); return; }
    setLoading(true);
    try {
      const res = q
        ? await searchManga(q, genre)
        : await getManga({ genre, limit: 24 });
      setResults(q ? res.data : res.data.manga || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [q, genre]);

  useEffect(() => { doSearch(); }, [doSearch]);

  const handleSearch = e => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (inputVal.trim()) next.set('q', inputVal.trim());
    else next.delete('q');
    setSearchParams(next);
  };

  const setGenre = g => {
    const next = new URLSearchParams(searchParams);
    if (genre === g) next.delete('genre');
    else next.set('genre', g);
    setSearchParams(next);
  };

  return (
    <main className="search-page container">
      {/* Search bar */}
      <div className="search-hero">
        <h1>Search Manga</h1>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text" placeholder="Search by title, genre, author…"
            value={inputVal} onChange={e => setInputVal(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Genre pills */}
      <div className="search-genres">
        <button className={`genre-pill ${!genre ? 'active' : ''}`} onClick={() => setGenre('')}>
          All
        </button>
        {GENRES.map(g => (
          <button key={g} className={`genre-pill ${genre === g ? 'active' : ''}`} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
      </div>

      {/* Active query display */}
      {(q || genre) && (
        <div className="search-meta">
          {q && <span>Results for <strong>"{q}"</strong></span>}
          {genre && <span className="active-tag">{genre} <button onClick={() => setGenre('')}>×</button></span>}
          {results.length > 0 && <span className="search-count">{results.length} found</span>}
          <button className="clear-search" onClick={() => { setSearchParams({}); setInputVal(''); }}>
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="search-grid">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="manga-card-skeleton" />)}
        </div>
      ) : results.length > 0 ? (
        <div className="manga-grid">{results.map(m => <MangaCard key={m._id} manga={m} />)}</div>
      ) : (q || genre) ? (
        <div className="search-empty">
          <p>😕 No results found</p>
          <p>Try a different keyword or genre</p>
          <button onClick={() => { setSearchParams({}); setInputVal(''); }}>Clear search</button>
        </div>
      ) : (
        <div className="search-empty">
          <p>🔍 Type something to search</p>
          <p>Or pick a genre above to browse</p>
        </div>
      )}
    </main>
  );
}
