import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">📚 MangaVerse</div>
        <h1>Create account</h1>
        <p className="auth-subtitle">Start your manga journey</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Username</label>
            <input
              type="text" name="username" placeholder="coolreader99"
              value={form.username} onChange={handleChange} required minLength={3}
            />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password" name="password" placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange} required minLength={6}
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}
