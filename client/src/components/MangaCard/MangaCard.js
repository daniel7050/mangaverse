import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './MangaCard.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const proxyCover = (url) => {
  if (!url) return '';
  // In production, proxy through our backend to avoid hotlink blocking
  if (process.env.NODE_ENV === 'production') {
    return `${API}/proxy/image?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export default function MangaCard({ manga, progress }) {
  const { _id, title, coverImage, status, chapterCount, rating } = manga;
  const lastRead = progress?.[_id];
  const [imgError, setImgError] = useState(false);
  const src = proxyCover(coverImage);

  return (
    <Link to={`/manga/${_id}`} className="manga-card">
      <div className="manga-card-cover">
        {src && !imgError
          ? <img src={src} alt={title} loading="lazy" onError={() => setImgError(true)} />
          : <div className="manga-card-placeholder">📖</div>
        }
        <span className={`badge badge-${status}`}>{status}</span>
        {lastRead && (
          <span className="manga-card-progress">Ch. {lastRead.lastChapter}</span>
        )}
      </div>
      <div className="manga-card-info">
        <h3 className="manga-card-title">{title}</h3>
        <div className="manga-card-meta">
          <span>Ch. {chapterCount || '?'}</span>
          {rating > 0 && <span>⭐ {rating.toFixed(1)}</span>}
        </div>
      </div>
    </Link>
  );
}
