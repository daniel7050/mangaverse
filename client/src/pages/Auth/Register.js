import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (form.username.length < 3) return 'Username must be at least 3 characters';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirm) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);
    setError(''); setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  // Password strength indicator
  const getStrength = (p) => {
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
    if (p.length < 8) return { label: 'Weak', color: '#f97316', width: '40%' };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: '#eab308', width: '60%' };
    if (p.length >= 10) return { label: 'Strong', color: '#22c55e', width: '100%' };
    return { label: 'Good', color: '#3b82f6', width: '80%' };
  };

  const strength = getStrength(form.password);

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
            <input type="text" name="username" placeholder="coolreader99"
              value={form.username} onChange={handleChange} required minLength={3} />
            {form.username && form.username.length < 3 && (
              <span className="auth-hint">At least 3 characters</span>
            )}
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrap">
              <input type={showPassword ? 'text' : 'password'} name="password"
                placeholder="Min. 6 characters" value={form.password}
                onChange={handleChange} required minLength={6} />
              <button type="button" className="auth-eye" onClick={() => setShowPassword(s => !s)}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {strength && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div style={{ width: strength.width, background: strength.color }} />
                </div>
                <span style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label>Confirm Password</label>
            <input type="password" name="confirm" placeholder="Re-enter password"
              value={form.confirm} onChange={handleChange} required />
            {form.confirm && form.password !== form.confirm && (
              <span className="auth-hint auth-hint-error">Passwords don't match</span>
            )}
            {form.confirm && form.password === form.confirm && form.confirm.length > 0 && (
              <span className="auth-hint auth-hint-ok">✓ Passwords match</span>
            )}
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
