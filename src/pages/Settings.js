import { useState, useEffect } from 'react';

const ITEMS = ['Milk', 'Pastries', 'Eggs', 'Bread', 'Fruit', 'Prepared Food', 'Other'];
const DEFAULT_PRICES = {
  Milk: 6.00, Pastries: 3.50, Eggs: 0.40, Bread: 4.50,
  Fruit: 1.25, 'Prepared Food': 8.00, Other: 5.00,
};

export function loadPrices() {
  try {
    const saved = localStorage.getItem('wl_prices');
    if (saved) return { ...DEFAULT_PRICES, ...JSON.parse(saved) };
  } catch (e) {}
  return { ...DEFAULT_PRICES };
}

export default function Settings() {
  const [prices, setPrices] = useState(loadPrices());
  const [savedFlash, setSavedFlash] = useState(false);

  function update(item, val) {
    setPrices(p => ({ ...p, [item]: val }));
  }

  function handleSave() {
    const cleaned = {};
    for (const item of ITEMS) {
      const num = parseFloat(prices[item]);
      cleaned[item] = isNaN(num) || num < 0 ? 0 : num;
    }
    localStorage.setItem('wl_prices', JSON.stringify(cleaned));
    setPrices(cleaned);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  function handleReset() {
    if (!window.confirm('Reset all prices to the defaults?')) return;
    localStorage.removeItem('wl_prices');
    setPrices({ ...DEFAULT_PRICES });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>Item Prices</h1>
      <p style={styles.sub}>Set the cost per unit for each item. Used to estimate money wasted on the dashboard.</p>

      <div style={styles.list}>
        {ITEMS.map(item => (
          <div key={item} style={styles.row}>
            <label style={styles.label}>{item}</label>
            <div style={styles.inputWrap}>
              <span style={styles.dollar}>$</span>
              <input
                style={styles.input}
                type="number"
                step="0.01"
                min="0"
                value={prices[item]}
                onChange={e => update(item, e.target.value)}
              />
              <span style={styles.perUnit}>per unit</span>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.actions}>
        <button style={styles.saveBtn} onClick={handleSave}>Save Prices</button>
        <button style={styles.resetBtn} onClick={handleReset}>Reset to Defaults</button>
      </div>

      {savedFlash && <div style={styles.savedBanner}>Prices saved successfully.</div>}
    </div>
  );
}

const styles = {
  wrap: { padding: '1.25rem 1.5rem', maxWidth: 520, margin: '0 auto' },
  h1: { fontSize: 20, fontWeight: 500, marginBottom: 3 },
  sub: { fontSize: 13, color: '#888', marginBottom: 20 },
  list: { background: '#fff', border: '1px solid #e8e8e4', borderRadius: 12, padding: '0.5rem 1rem' },
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 0', borderBottom: '1px solid #f0f0ea',
  },
  label: { fontSize: 14, fontWeight: 500, color: '#1a1a1a' },
  inputWrap: { display: 'flex', alignItems: 'center', gap: 6 },
  dollar: { fontSize: 13, color: '#888' },
  input: {
    width: 80, padding: '6px 8px', fontSize: 14,
    border: '1px solid #d0d0ca', borderRadius: 6,
    outline: 'none', textAlign: 'right', color: '#1a1a1a', background: '#fff',
  },
  perUnit: { fontSize: 12, color: '#888' },
  actions: { display: 'flex', gap: 8, marginTop: 16 },
  saveBtn: {
    padding: '10px 18px', background: '#1D9E75', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer',
  },
  resetBtn: {
    padding: '10px 18px', background: '#fff', color: '#888',
    border: '1px solid #d0d0ca', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer',
  },
  savedBanner: {
    marginTop: 12, padding: '11px 15px', fontSize: 13, fontWeight: 500,
    color: '#0F6E56', background: '#E1F5EE', border: '1px solid #1D9E75', borderRadius: 8,
  },
};
