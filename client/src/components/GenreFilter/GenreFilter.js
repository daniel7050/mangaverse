import React from 'react';
import './GenreFilter.css';

const GENRES = [
  { label: '⚔️ Action', value: 'Action' },
  { label: '🏃 Adventure', value: 'Adventure' },
  { label: '😂 Comedy', value: 'Comedy' },
  { label: '🌑 Drama', value: 'Drama' },
  { label: '✨ Fantasy', value: 'Fantasy' },
  { label: '👻 Horror', value: 'Horror' },
  { label: '🔍 Mystery', value: 'Mystery' },
  { label: '💕 Romance', value: 'Romance' },
  { label: '🤖 Sci-Fi', value: 'Sci-Fi' },
  { label: '🏫 Slice of Life', value: 'Slice of Life' },
  { label: '🦸 Superhero', value: 'Superhero' },
  { label: '🥷 Martial Arts', value: 'Martial Arts' },
  { label: '🏆 Sports', value: 'Sports' },
  { label: '🔮 Supernatural', value: 'Supernatural' },
  { label: '🧠 Psychological', value: 'Psychological' },
  { label: '📜 Historical', value: 'Historical' },
];

export default function GenreFilter({ active, onChange }) {
  return (
    <div className="genre-filter">
      <h3>Genre</h3>
      <button
        className={`filter-pill ${!active ? 'active' : ''}`}
        onClick={() => onChange('')}
      >
        🌐 All Genres
      </button>
      {GENRES.map(g => (
        <button
          key={g.value}
          className={`filter-pill ${active === g.value ? 'active' : ''}`}
          onClick={() => onChange(active === g.value ? '' : g.value)}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
