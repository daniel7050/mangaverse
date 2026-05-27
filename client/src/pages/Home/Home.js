import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MangaCard from '../../components/MangaCard/MangaCard';
import { getManga, getTrending } from '../../utils/api';
import './Home.css';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [trendRes, latestRes] = await Promise.all([getTrending(), getManga({ limit: 18 })]);
        setTrending(trendRes.data);
        setLatest(latestRes.data.manga || []);
      } catch (err) {
        setError('Could not load manga. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="container"><div className="spinner" /></div>;
  if (error) return <div className="container home-error"><p>{error}</p><Link to="/browse">Browse</Link></div>;

  return (
    <main className="home container">
      {/* Hero */}
      <section className="home-hero">
        <h1>📚 MangaVerse</h1>
        <p>Discover, read and track thousands of manga titles — free, fast, forever.</p>
        <div className="home-hero-actions">
          <Link to="/browse" className="btn-primary">Browse All</Link>
          <Link to="/search" className="btn-secondary">Search</Link>
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h2>🔥 Trending Now</h2>
            <Link to="/browse?sort=trending">See all</Link>
          </div>
          <div className="manga-grid">
            {trending.slice(0, 6).map(m => <MangaCard key={m._id} manga={m} />)}
          </div>
        </section>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h2>🆕 Latest Additions</h2>
            <Link to="/browse">See all</Link>
          </div>
          <div className="manga-grid">
            {latest.map(m => <MangaCard key={m._id} manga={m} />)}
          </div>
        </section>
      )}

      {trending.length === 0 && latest.length === 0 && (
        <div className="home-empty">
          <p>No manga in the database yet.</p>
          <p>Run a scrape from the API: <code>POST /api/manga/scrape</code></p>
        </div>
      )}
    </main>
  );
}
