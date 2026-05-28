import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBookmark, FiUser, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('mv_theme') || 'dark');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mv_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handleSearch = e => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setMenuOpen(false);
    }
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
          <Link to="/browse" onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link to="/bookmarks" onClick={() => setMenuOpen(false)}><FiBookmark /> Saved</Link>
          {user
            ? <Link to="/profile" onClick={() => setMenuOpen(false)}><FiUser /> {user.username}</Link>
            : <Link to="/login" onClick={() => setMenuOpen(false)}><FiUser /> Log In</Link>
          }
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
        </div>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
}
