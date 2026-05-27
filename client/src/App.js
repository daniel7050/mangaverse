import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Read from './pages/Read/Read';
import Profile from './pages/Profile/Profile';
import { AuthProvider } from './context/AuthContext';

/**
 * Pages assigned to Hamzat:
 *   /manga/:id   — MangaDetail page (cover, synopsis, chapter list)
 *   /search      — SearchResults page
 *   /bookmarks   — Bookmarks page
 *   /login       — Login page
 *   /register    — Register page
 */

// Placeholder for Hamzat's pages
const Todo = ({ name }) => (
  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
    <h2>🚧 {name}</h2>
    <p>Assigned to: <strong>Hamzat Olajuwon</strong> (@juwonabdullahi007-arc)</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Daniel's routes */}
        <Route path="/" element={<Home />} />
        <Route path="/read/:mangaId/:chapterNum" element={<Read />} />
        <Route path="/profile" element={<Profile />} />

        {/* Hamzat's routes — implement these! */}
        <Route path="/manga/:id" element={<Todo name="Manga Detail Page" />} />
        <Route path="/search" element={<Todo name="Search & Filter Page" />} />
        <Route path="/browse" element={<Todo name="Browse / Genre Filter Page" />} />
        <Route path="/bookmarks" element={<Todo name="Bookmarks Page" />} />
        <Route path="/login" element={<Todo name="Login Page" />} />
        <Route path="/register" element={<Todo name="Register Page" />} />

        {/* 404 */}
        <Route path="*" element={<Todo name="404 — Page Not Found" />} />
      </Routes>
    </AuthProvider>
  );
}
