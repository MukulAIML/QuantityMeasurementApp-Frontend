import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHistory, getOperationCount } from '../services/api';
import './Dashboard.css';

const OPS = ['compare', 'convert', 'add', 'subtract', 'divide'];

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, ...countRes] = await Promise.allSettled([
          getHistory(),
          ...OPS.map(op => getOperationCount(op)),
        ]);
        if (histRes.status === 'fulfilled') {
          setRecentHistory(histRes.value.data.slice(-5).reverse());
        }
        const newCounts = {};
        OPS.forEach((op, i) => {
          if (countRes[i].status === 'fulfilled') newCounts[op] = countRes[i].value.data;
          else newCounts[op] = 0;
        });
        setCounts(newCounts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const opIcons = { compare: '⇔', convert: '↺', add: '+', subtract: '−', divide: '÷' };
  const opColors = { compare: '#00e5ff', convert: '#7c3aed', add: '#22d3a5', subtract: '#f59e0b', divide: '#ff4d6d' };

  const totalOps = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="dashboard fade-in">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">DASHBOARD</h1>
          <p className="dash-subtitle">Welcome back, <span className="highlight">{user?.username}</span></p>
        </div>
        <Link to="/calculator" className="cta-btn">
          New Calculation <span>→</span>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-label">TOTAL OPERATIONS</div>
          <div className="stat-value">{loading ? '—' : totalOps}</div>
          <div className="stat-bar"></div>
        </div>
        {OPS.map(op => (
          <div className="stat-card" key={op} style={{ '--op-color': opColors[op] }}>
            <div className="stat-op-icon">{opIcons[op]}</div>
            <div className="stat-label">{op.toUpperCase()}</div>
            <div className="stat-value" style={{ color: opColors[op] }}>
              {loading ? '—' : counts[op] ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section-title">QUICK ACTIONS</div>
      <div className="quick-actions">
        {[
          { label: 'Convert Length', icon: '📏', path: '/calculator', q: 'length' },
          { label: 'Convert Weight', icon: '⚖️', path: '/calculator', q: 'weight' },
          { label: 'Convert Temperature', icon: '🌡️', path: '/calculator', q: 'temperature' },
          { label: 'Convert Volume', icon: '🧪', path: '/calculator', q: 'volume' },
          { label: 'View History', icon: '◎', path: '/history', q: '' },
        ].map(a => (
          <Link key={a.label} to={a.path} className="quick-card">
            <span className="quick-icon">{a.icon}</span>
            <span className="quick-label">{a.label}</span>
            <span className="quick-arrow">→</span>
          </Link>
        ))}
      </div>

      {/* Recent history */}
      <div className="section-title">RECENT OPERATIONS</div>
      {loading ? (
        <div className="loading-bar"></div>
      ) : recentHistory.length === 0 ? (
        <div className="empty-state">
          No operations yet. <Link to="/calculator">Start calculating →</Link>
        </div>
      ) : (
        <div className="history-list">
          {recentHistory.map(item => (
            <div key={item.id} className={`history-row ${item.error ? 'error' : ''}`}>
              <span className="history-op" style={{ color: opColors[item.operation?.toLowerCase()] }}>
                {opIcons[item.operation?.toLowerCase()]} {item.operation}
              </span>
              <span className="history-detail">
                {item.thisValue} {item.thisUnit}
                {item.thatValue != null && item.thatValue !== 0 ? ` & ${item.thatValue} ${item.thatUnit}` : ''}
              </span>
              <span className="history-result">
                {item.error ? <span className="err-tag">ERR</span> : item.resultString}
              </span>
              <span className="history-time">
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
