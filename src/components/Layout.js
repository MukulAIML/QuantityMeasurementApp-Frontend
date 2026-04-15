import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">⊕</span>
          <span className="brand-name">QUANTI<span className="brand-accent">MEASURE</span></span>
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
            <span className="nav-icon">◈</span> Dashboard
          </NavLink>
          <NavLink to="/calculator" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
            <span className="nav-icon">⊞</span> Calculator
          </NavLink>
          <NavLink to="/history" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
            <span className="nav-icon">◎</span> History
          </NavLink>
        </div>

        <div className="navbar-user">
          <span className="user-badge">{user?.username?.[0]?.toUpperCase()}</span>
          <span className="username">{user?.username}</span>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
