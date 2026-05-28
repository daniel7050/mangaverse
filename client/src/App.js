import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Browse from './pages/Browse/Browse';
import Read from './pages/Read/Read';
import Profile from './pages/Profile/Profile';
import { AuthProvider } from './context/AuthContext';

// Placeholder for Hamzat's pages
const Todo = ({ name }) => (
  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
    <h2>🚧 {name}</h2>
    <p>Assigned to: <strong>Hamzat Olajuwon</strong> (@juwonabdullahi007-arch)</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Daniel's routes */}
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/read/:mangaId/:chapterNum" element={<Read />} />
        <Route path="/profile" element={<Profile />} />

        {/* Hamzat's routes */}
        <Route path="/manga/:id" element={<Todo name="Manga Detail Page" />} />
        <Route path="/search" element={<Todo name="Search & Filter Page" />} />
        <Route path="/bookmarks" element={<Todo name="Bookmarks Page" />} />
        <Route path="/login" element={<Todo name="Login Page" />} />
        <Route path="/register" element={<Todo name="Register Page" />} />

        <Route path="*" element={<Todo name="404 — Page Not Found" />} />
      </Routes>
    </AuthProvider>
  );
}
