import React, { useEffect, useState, useCallback } from 'react';
import { getHistory, getHistoryByOperation } from '../services/api';
import './HistoryPage.css';

const ALL_OPS = ['compare', 'convert', 'add', 'subtract', 'divide'];
const OP_COLORS = { compare: '#00e5ff', convert: '#7c3aed', add: '#22d3a5', subtract: '#f59e0b', divide: '#ff4d6d' };
const OP_ICONS = { compare: '⇔', convert: '↺', add: '+', subtract: '−', divide: '÷' };

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = filter === 'all'
        ? await getHistory()
        : await getHistoryByOperation(filter);
      setHistory([...res.data].reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = history.filter(h => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      h.operation?.toLowerCase().includes(s) ||
      h.thisUnit?.toLowerCase().includes(s) ||
      h.thatUnit?.toLowerCase().includes(s) ||
      h.resultString?.toLowerCase().includes(s) ||
      String(h.thisValue).includes(s) ||
      String(h.thatValue).includes(s)
    );
  });

  const formatDate = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="history-page fade-in">
      <div className="history-header">
        <div>
          <h1 className="history-title">HISTORY</h1>
          <p className="history-subtitle">Complete log of all your operations</p>
        </div>
        <button className="refresh-btn" onClick={fetchHistory} disabled={loading} title="Refresh">
          <span className={loading ? 'spin' : ''}>↺</span> REFRESH
        </button>
      </div>

      {/* Filter + Search bar */}
      <div className="filter-bar">
        <div className="filter-tabs">
          <button className={`ftab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            ALL
          </button>
          {ALL_OPS.map(op => (
            <button
              key={op}
              className={`ftab ${filter === op ? 'active' : ''}`}
              style={{ '--c': OP_COLORS[op] }}
              onClick={() => setFilter(op)}
            >
              <span>{OP_ICONS[op]}</span> {op.toUpperCase()}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          type="text"
          placeholder="Search operations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Stats row */}
      <div className="history-stats">
        <span className="hstat">
          <span className="hstat-value">{filtered.length}</span>
          <span className="hstat-label">SHOWN</span>
        </span>
        <span className="hstat">
          <span className="hstat-value">{filtered.filter(h => !h.error).length}</span>
          <span className="hstat-label" style={{ color: 'var(--success)' }}>SUCCESS</span>
        </span>
        <span className="hstat">
          <span className="hstat-value">{filtered.filter(h => h.error).length}</span>
          <span className="hstat-label" style={{ color: 'var(--error)' }}>ERRORS</span>
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="history-loading">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.07}s` }}></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="hist-empty">
          <div className="hist-empty-icon">◎</div>
          <div>{search ? 'No results match your search' : 'No operations recorded yet'}</div>
        </div>
      ) : (
        <div className="hist-table-wrap">
          <table className="hist-table">
            <thead>
              <tr>
                <th>#</th>
                <th>OPERATION</th>
                <th>INPUT A</th>
                <th>INPUT B</th>
                <th>RESULT</th>
                <th>STATUS</th>
                <th>TIME</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} className={row.error ? 'err-row' : ''}>
                  <td className="td-id">{row.id}</td>
                  <td>
                    <span className="op-tag" style={{ '--c': OP_COLORS[row.operation?.toLowerCase()] }}>
                      {OP_ICONS[row.operation?.toLowerCase()]} {row.operation}
                    </span>
                  </td>
                  <td className="td-val">
                    <span className="val-num">{row.thisValue}</span>
                    <span className="val-unit">{row.thisUnit}</span>
                  </td>
                  <td className="td-val">
                    {row.thatValue != null && row.thatValue !== 0 ? (
                      <>
                        <span className="val-num">{row.thatValue}</span>
                        <span className="val-unit">{row.thatUnit}</span>
                      </>
                    ) : <span className="val-unit">—</span>}
                  </td>
                  <td className="td-result">
                    {row.error
                      ? <span className="res-error">{row.errorMessage || 'Error'}</span>
                      : <span className="res-ok">{row.resultString}</span>
                    }
                  </td>
                  <td>
                    {row.error
                      ? <span className="badge badge-err">ERR</span>
                      : <span className="badge badge-ok">OK</span>
                    }
                  </td>
                  <td className="td-time">{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
