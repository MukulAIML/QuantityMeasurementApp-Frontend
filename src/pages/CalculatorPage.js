import React, { useState } from 'react';
import {
  compareQuantities, convertQuantity,
  addQuantities, subtractQuantities, divideQuantities
} from '../services/api';
import './CalculatorPage.css';

const UNITS = {
  length: ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  weight: ['KILOGRAM', 'GRAM', 'POUND'],
  volume: ['LITRE', 'MILLILITRE', 'GALLON'],
  temperature: ['CELSIUS', 'FAHRENHEIT'],
};

const TYPES = Object.keys(UNITS);

const OPERATIONS = [
  { id: 'convert', label: 'CONVERT', icon: '↺', dual: false, desc: 'Convert a value from one unit to another' },
  { id: 'compare', label: 'COMPARE', icon: '⇔', dual: true, desc: 'Check if two quantities are equal' },
  { id: 'add', label: 'ADD', icon: '+', dual: true, desc: 'Add two quantities together' },
  { id: 'subtract', label: 'SUBTRACT', icon: '−', dual: true, desc: 'Subtract second quantity from first' },
  { id: 'divide', label: 'DIVIDE', icon: '÷', dual: true, desc: 'Divide first quantity by second' },
];

const OP_COLORS = { convert: '#7c3aed', compare: '#00e5ff', add: '#22d3a5', subtract: '#f59e0b', divide: '#ff4d6d' };

export default function CalculatorPage() {
  const [operation, setOperation] = useState('convert');
  const [type, setType] = useState('length');
  const [val1, setVal1] = useState('');
  const [unit1, setUnit1] = useState(UNITS.length[0]);
  const [val2, setVal2] = useState('');
  const [unit2, setUnit2] = useState(UNITS.length[1]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const opInfo = OPERATIONS.find(o => o.id === operation);
  const isDual = opInfo?.dual;
  const units = UNITS[type];

  const handleTypeChange = (t) => {
    setType(t);
    setUnit1(UNITS[t][0]);
    setUnit2(UNITS[t][1] || UNITS[t][0]);
    setResult(null);
    setError(null);
  };

  const handleOperationChange = (op) => {
    setOperation(op);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      let res;
      const t = type.toUpperCase();
      switch (operation) {
        case 'convert': res = await convertQuantity(val1, unit1, t, unit2); break;
        case 'compare': res = await compareQuantities(val1, unit1, t, val2, unit2, t); break;
        case 'add': res = await addQuantities(val1, unit1, t, val2, unit2, t); break;
        case 'subtract': res = await subtractQuantities(val1, unit1, t, val2, unit2, t); break;
        case 'divide': res = await divideQuantities(val1, unit1, t, val2, unit2, t); break;
        default: break;
      }
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Operation failed. Check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setUnit1(unit2);
    setUnit2(unit1);
    setVal1(val2);
    setVal2(val1);
  };

  return (
    <div className="calc-page fade-in">
      <div className="calc-header">
        <h1 className="calc-title">CALCULATOR</h1>
        <p className="calc-subtitle">Perform quantity operations with precision</p>
      </div>

      <div className="calc-layout">
        {/* Left: operation & type selectors */}
        <aside className="calc-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">OPERATION</div>
            {OPERATIONS.map(op => (
              <button
                key={op.id}
                className={`op-btn ${operation === op.id ? 'active' : ''}`}
                style={{ '--c': OP_COLORS[op.id] }}
                onClick={() => handleOperationChange(op.id)}
              >
                <span className="op-icon">{op.icon}</span>
                <div>
                  <div className="op-name">{op.label}</div>
                  <div className="op-desc">{op.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">MEASUREMENT TYPE</div>
            {TYPES.map(t => (
              <button
                key={t}
                className={`type-btn ${type === t ? 'active' : ''}`}
                onClick={() => handleTypeChange(t)}
              >
                <span className="type-icon">
                  {t === 'length' ? '📏' : t === 'weight' ? '⚖️' : t === 'volume' ? '🧪' : '🌡️'}
                </span>
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </aside>

        {/* Right: form */}
        <div className="calc-main">
          <div className="calc-card">
            <div className="calc-card-header" style={{ '--c': OP_COLORS[operation] }}>
              <span className="card-op-icon">{opInfo?.icon}</span>
              <div>
                <div className="card-op-name">{opInfo?.label} — {type.toUpperCase()}</div>
                <div className="card-op-units">Available units: {units.join(', ')}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="calc-form">
              {/* Row 1 */}
              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">
                    {isDual ? 'FIRST VALUE' : 'VALUE'}
                  </label>
                  <input
                    className="calc-input"
                    type="number"
                    step="any"
                    value={val1}
                    onChange={e => setVal1(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">
                    {operation === 'convert' ? 'FROM UNIT' : 'UNIT'}
                  </label>
                  <select
                    className="calc-select"
                    value={unit1}
                    onChange={e => setUnit1(e.target.value)}
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Swap button (convert) or Row 2 (dual ops) */}
              {operation === 'convert' ? (
                <div className="swap-row">
                  <div className="swap-line"></div>
                  <button type="button" className="swap-btn" onClick={handleSwap} title="Swap units">⇅ SWAP</button>
                  <div className="swap-line"></div>
                </div>
              ) : null}

              {/* To unit (convert) or second operand (dual) */}
              {operation === 'convert' ? (
                <div className="input-row">
                  <div className="input-group" style={{ visibility: 'hidden' }}>
                    <label className="input-label">—</label>
                    <input className="calc-input" disabled />
                  </div>
                  <div className="input-group">
                    <label className="input-label">TO UNIT</label>
                    <select
                      className="calc-select"
                      value={unit2}
                      onChange={e => setUnit2(e.target.value)}
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              ) : isDual ? (
                <div className="input-row second-row">
                  <div className="op-divider">
                    <span>{opInfo?.icon}</span>
                  </div>
                  <div className="input-group">
                    <label className="input-label">SECOND VALUE</label>
                    <input
                      className="calc-input"
                      type="number"
                      step="any"
                      value={val2}
                      onChange={e => setVal2(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">UNIT</label>
                    <select
                      className="calc-select"
                      value={unit2}
                      onChange={e => setUnit2(e.target.value)}
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                className="calc-submit"
                disabled={loading}
                style={{ '--c': OP_COLORS[operation] }}
              >
                {loading
                  ? <><span className="spinner-sm"></span> CALCULATING...</>
                  : <>{opInfo?.icon} {opInfo?.label}</>
                }
              </button>
            </form>

            {/* Error */}
            {error && (
              <div className="calc-error">
                <span>⚠</span>
                <span>{typeof error === 'object' ? JSON.stringify(error) : error}</span>
              </div>
            )}

            {/* Result */}
            {result && !result.error && (
              <div className="result-panel" style={{ '--c': OP_COLORS[operation] }}>
                <div className="result-label">RESULT</div>
                <div className="result-value">{result.resultString}</div>
                {result.resultValue != null && (
                  <div className="result-numeric">
                    {result.resultValue} {result.resultUnit}
                  </div>
                )}
                <div className="result-meta">
                  {result.thisValue} {result.thisUnit}
                  {result.thatValue ? ` ${opInfo?.icon} ${result.thatValue} ${result.thatUnit}` : ''}
                </div>
              </div>
            )}

            {result?.error && (
              <div className="calc-error">
                <span>⚠</span> {result.errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
