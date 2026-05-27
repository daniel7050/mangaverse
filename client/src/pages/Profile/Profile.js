import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProgress, getBookmarks } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([getProgress(), getBookmarks()])
      .then(([p, b]) => { setProgress(p.data); setBookmarks(b.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="profile-guest container">
      <h2>You're not logged in</h2>
      <p>Log in to track your reading progress and save bookmarks.</p>
      <div className="profile-guest-links">
        <Link to="/login" className="btn-primary">Log In</Link>
        <Link to="/register" className="btn-secondary">Register</Link>
      </div>
    </div>
  );

  return (
    <main className="profile container">
      <div className="profile-header">
        <div className="profile-avatar">{user.username?.[0]?.toUpperCase() || '?'}</div>
        <div>
          <h1>{user.username}</h1>
          <p className="profile-email">{user.email}</p>
        </div>
        <button className="btn-secondary" onClick={logout}>Log Out</button>
      </div>

      {/* Reading Progress */}
      <section className="profile-section">
        <h2>📖 Reading Progress</h2>
        {loading ? <div className="spinner" /> : progress.length === 0
          ? <p className="profile-empty">No reading history yet.</p>
          : (
            <div className="progress-list">
              {progress.map((p, i) => (
                <Link key={i} to={`/read/${p.manga?._id}/${p.lastChapter}`} className="progress-item">
                  {p.manga?.coverImage && <img src={p.manga.coverImage} alt={p.manga.title} />}
                  <div className="progress-info">
                    <span className="progress-title">{p.manga?.title || 'Unknown'}</span>
                    <span className="progress-meta">Last read: Chapter {p.lastChapter}</span>
                  </div>
                  <span className="progress-continue">Continue →</span>
                </Link>
              ))}
            </div>
          )}
      </section>

      {/* Bookmarks */}
      <section className="profile-section">
        <h2>🔖 Saved Manga</h2>
        <p className="profile-note">Bookmarks feature — Assigned to Hamzat</p>
        {bookmarks.length === 0
          ? <p className="profile-empty">No bookmarks yet.</p>
          : (
            <div className="manga-grid">
              {bookmarks.map(m => (
                <Link key={m._id} to={`/manga/${m._id}`} className="manga-card">
                  <div className="manga-card-cover">
                    {m.coverImage && <img src={m.coverImage} alt={m.title} />}
                  </div>
                  <div className="manga-card-info">
                    <h3 className="manga-card-title">{m.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}
