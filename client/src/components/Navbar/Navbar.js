import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiBookmark, FiUser, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { searchManga } from '../../utils/api';
import './Navbar.css';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('mv_theme') || 'dark');
  const [searching, setSearching] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mv_theme', theme);
  }, [theme]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); setShowDropdown(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchManga(query);
        setSuggestions(res.data.slice(0, 6));
        setShowDropdown(true);
      } catch { setSuggestions([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery(''); setSuggestions([]); setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (manga) => {
    navigate(`/manga/${manga._id}`);
    setQuery(''); setSuggestions([]); setShowDropdown(false);
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">📚 MangaVerse</Link>

        <div className="navbar-search-wrap" ref={dropdownRef}>
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text" placeholder="Search manga…" value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => suggestions.length && setShowDropdown(true)}
            />
            <button type="submit">
              {searching ? <span className="search-spinner" /> : <FiSearch />}
            </button>
          </form>

          {showDropdown && suggestions.length > 0 && (
            <div className="search-dropdown">
              {suggestions.map(m => (
                <button key={m._id} className="search-suggestion" onClick={() => handleSuggestionClick(m)}>
                  <div className="suggestion-cover">
                    {m.coverImage
                      ? <img src={m.coverImage} alt={m.title} />
                      : <span>📖</span>
                    }
                  </div>
                  <div className="suggestion-info">
                    <span className="suggestion-title">{m.title}</span>
                    <span className="suggestion-meta">
                      {m.genres?.slice(0, 2).join(' · ')} · {m.status}
                    </span>
                  </div>
                </button>
              ))}
              <button className="suggestion-all" onClick={handleSearch}>
                See all results for "{query}" →
              </button>
            </div>
          )}
        </div>

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
