import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getProgress, getBookmarks, updateAvatar, changePassword } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import MangaCard from '../../components/MangaCard/MangaCard';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const [progress, setProgress] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileRef = useRef();

  // Change password
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setAvatar(user.avatar || '');
    Promise.all([getProgress(), getBookmarks()])
      .then(([p, b]) => { setProgress(p.data); setBookmarks(b.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleAvatarClick = () => fileRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please select an image file');
    if (file.size > 500000) return alert('Image too large. Max 500KB.');
    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await updateAvatar(reader.result);
        setAvatar(reader.result);
      } catch { alert('Failed to upload avatar'); }
      finally { setAvatarLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.newPw.length < 6) return setPwError('New password must be at least 6 characters');
    if (pwForm.newPw !== pwForm.confirm) return setPwError('Passwords do not match');
    setPwLoading(true);
    try {
      await changePassword(pwForm.current, pwForm.newPw);
      setPwSuccess('Password changed successfully!');
      setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => { setPwSuccess(''); setShowChangePw(false); }, 2000);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

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
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar-wrap" onClick={handleAvatarClick} title="Click to change avatar">
          {avatarLoading
            ? <div className="profile-avatar"><div className="spinner" style={{width:24,height:24,margin:0}} /></div>
            : avatar
              ? <img src={avatar} alt="avatar" className="profile-avatar-img" />
              : <div className="profile-avatar">{user.username?.[0]?.toUpperCase() || '?'}</div>
          }
          <div className="profile-avatar-overlay">📷</div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarChange} />
        </div>
        <div className="profile-user-info">
          <h1>{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-hint">Click avatar to change photo</p>
        </div>
        <div className="profile-header-actions">
          <button className="btn-change-pw" onClick={() => setShowChangePw(s => !s)}>
            🔑 {showChangePw ? 'Cancel' : 'Change Password'}
          </button>
          <button className="btn-secondary" onClick={logout}>Log Out</button>
        </div>
      </div>

      {/* Change Password */}
      {showChangePw && (
        <div className="profile-change-pw">
          <h3>🔑 Change Password</h3>
          {pwError && <div className="pw-error">{pwError}</div>}
          {pwSuccess && <div className="pw-success">{pwSuccess}</div>}
          <form onSubmit={handleChangePassword} className="pw-form">
            <input type="password" placeholder="Current password"
              value={pwForm.current} onChange={e => setPwForm({...pwForm, current: e.target.value})} required />
            <input type="password" placeholder="New password (min. 6 chars)"
              value={pwForm.newPw} onChange={e => setPwForm({...pwForm, newPw: e.target.value})} required minLength={6} />
            <input type="password" placeholder="Confirm new password"
              value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} required />
            <button type="submit" className="btn-primary" disabled={pwLoading}>
              {pwLoading ? 'Saving…' : 'Save New Password'}
            </button>
          </form>
        </div>
      )}

      {/* Reading Progress */}
      <section className="profile-section">
        <h2>📖 Reading Progress</h2>
        {loading ? <div className="spinner" /> : progress.length === 0
          ? <p className="profile-empty">No reading history yet. Start reading a manga!</p>
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
        {bookmarks.length === 0
          ? <p className="profile-empty">No bookmarks yet. Save manga from their detail pages!</p>
          : <div className="manga-grid">{bookmarks.map(m => <MangaCard key={m._id} manga={m} />)}</div>
        }
      </section>
    </main>
  );
}
