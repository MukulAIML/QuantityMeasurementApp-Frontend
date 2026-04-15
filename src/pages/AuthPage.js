import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function AuthPage({ mode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const isLogin = mode === 'login';

  useEffect(() => { clearError(); }, [mode, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = isLogin
      ? await login(username, password)
      : await register(username, password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="auth-root">
      {/* Decorative blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">⊕</span>
            <span className="auth-logo-text">QUANTI<span>MEASURE</span></span>
          </div>
          <h1 className="auth-title">{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Access your measurement workspace' : 'Join and start measuring'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label">USERNAME</label>
            <input
              className="field-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your_username"
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="field-group">
            <label className="field-label">PASSWORD</label>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'} <span>→</span></>
            )}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>Don't have an account? <Link to="/register">Register →</Link></>
          ) : (
            <>Already have an account? <Link to="/login">Sign in →</Link></>
          )}
        </div>
      </div>
    </div>
  );
}
