import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Browse from './pages/Browse/Browse';
import Search from './pages/Search/Search';
import Detail from './pages/Detail/Detail';
import Read from './pages/Read/Read';
import Profile from './pages/Profile/Profile';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import { AuthProvider } from './context/AuthContext';
import useScrollTop from './hooks/useScrollTop';

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
    <h2>404 — Page Not Found</h2>
    <a href="/" style={{ color: 'var(--accent)', marginTop: '1rem', display: 'block' }}>← Go Home</a>
  </div>
);

function AppRoutes() {
  useScrollTop(); // scroll to top on every navigation
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/search" element={<Search />} />
      <Route path="/manga/:id" element={<Detail />} />
      <Route path="/read/:mangaId/:chapterNum" element={<Read />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/bookmarks" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <AppRoutes />
    </AuthProvider>
  );
}
