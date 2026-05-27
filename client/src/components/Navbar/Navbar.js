import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBookmark, FiUser, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/search?q=${encodeURIComponent(query.trim())}`); setQuery(''); }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">📚 MangaVerse</Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text" placeholder="Search manga…" value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit"><FiSearch /></button>
        </form>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/browse">Browse</Link>
          <Link to="/bookmarks"><FiBookmark /> Saved</Link>
          <Link to="/profile"><FiUser /> Profile</Link>
        </div>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
}
