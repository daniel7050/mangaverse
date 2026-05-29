import React from 'react';
import { Link } from 'react-router-dom';
import './MangaCard.css';

export default function MangaCard({ manga, progress }) {
  const { _id, title, coverImage, status, chapterCount, rating } = manga;
  const lastRead = progress?.[_id];

  return (
    <Link to={`/manga/${_id}`} className="manga-card">
      <div className="manga-card-cover">
        {coverImage
          ? <img src={coverImage} alt={title} loading="lazy" />
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
