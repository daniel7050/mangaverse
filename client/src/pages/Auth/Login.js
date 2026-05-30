import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { forgotPassword, resetPassword } from '../../utils/api';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [mode, setMode] = useState('login'); // login | forgot | reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [devCode, setDevCode] = useState(''); // dev only

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleForgot = async e => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const res = await forgotPassword(forgotEmail);
      setDevCode(res.data.resetCode || '');
      setSuccessMsg('Reset code generated! Check below (dev mode).');
      setMode('reset');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset code.');
    } finally { setLoading(false); }
  };

  const handleReset = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await resetPassword(forgotEmail, resetCode, newPassword);
      setSuccessMsg('Password reset! You can now log in.');
      setMode('login');
      setForm({ email: forgotEmail, password: '' });
      setDevCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code.');
    } finally { setLoading(false); }
  };

  // ── Forgot password form ──
  if (mode === 'forgot') return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">📚 MangaVerse</div>
        <h1>Forgot password</h1>
        <p className="auth-subtitle">Enter your email to get a reset code</p>
        {error && <div className="auth-error">{error}</div>}
        {successMsg && <div className="auth-success">{successMsg}</div>}
        <form onSubmit={handleForgot} className="auth-form">
          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)} required />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Code'}
          </button>
        </form>
        <p className="auth-switch">
          <button onClick={() => { setMode('login'); setError(''); }}>← Back to login</button>
        </p>
      </div>
    </div>
  );

  // ── Reset password form ──
  if (mode === 'reset') return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">📚 MangaVerse</div>
        <h1>Reset password</h1>
        <p className="auth-subtitle">Enter the code and your new password</p>
        {error && <div className="auth-error">{error}</div>}
        {successMsg && <div className="auth-success">{successMsg}</div>}
        {devCode && (
          <div className="auth-dev-note">
            🛠️ <strong>Dev mode:</strong> Your reset code is <strong>{devCode}</strong>
            <br /><small>(In production this would be emailed to you)</small>
          </div>
        )}
        <form onSubmit={handleReset} className="auth-form">
          <div className="auth-field">
            <label>Reset Code</label>
            <input type="text" placeholder="6-digit code" value={resetCode}
              onChange={e => setResetCode(e.target.value)} required maxLength={6} />
          </div>
          <div className="auth-field">
            <label>New Password</label>
            <div className="auth-input-wrap">
              <input type={showNewPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters" value={newPassword}
                onChange={e => setNewPassword(e.target.value)} required minLength={6} />
              <button type="button" className="auth-eye" onClick={() => setShowNewPassword(s => !s)}>
                {showNewPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
        <p className="auth-switch">
          <button onClick={() => { setMode('forgot'); setError(''); }}>← Back</button>
        </p>
      </div>
    </div>
  );

  // ── Login form ──
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">📚 MangaVerse</div>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to continue reading</p>

        {error && <div className="auth-error">{error}</div>}
        {successMsg && <div className="auth-success">{successMsg}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-field">
            <label>Email</label>
            <input type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="auth-field">
            <div className="auth-label-row">
              <label>Password</label>
              <button type="button" className="auth-forgot-link"
                onClick={() => { setMode('forgot'); setForgotEmail(form.email); setError(''); }}>
                Forgot password?
              </button>
            </div>
            <div className="auth-input-wrap">
              <input type={showPassword ? 'text' : 'password'} name="password"
                placeholder="••••••••" value={form.password} onChange={handleChange} required />
              <button type="button" className="auth-eye" onClick={() => setShowPassword(s => !s)}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
