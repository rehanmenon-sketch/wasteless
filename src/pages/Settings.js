import { useState } from 'react';

const DEFAULT_ITEMS = [
  { name: 'Milk', price: 6.00, isDefault: true },
  { name: 'Pastries', price: 3.50, isDefault: true },
  { name: 'Eggs', price: 0.40, isDefault: true },
  { name: 'Bread', price: 4.50, isDefault: true },
  { name: 'Fruit', price: 1.25, isDefault: true },
  { name: 'Prepared Food', price: 8.00, isDefault: true },
  { name: 'Other', price: 5.00, isDefault: true },
];

export function loadItems() {
  try {
    const saved = localStorage.getItem('wl_items');
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch (e) {}
  return [...DEFAULT_ITEMS];
}

export function loadPrices() {
  const map = {};
  for (const item of loadItems()) map[item.name] = item.price;
  return map;
}

export default function Settings() {
  const [items, setItems] = useState(loadItems());
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState('');

  function updatePrice(idx, val) {
    setItems(items.map((it, i) => i === idx ? { ...it, price: val } : it));
  }

  function deleteItem(idx) {
    if (!window.confirm(`Delete "${items[idx].name}"? Past entries logged with this item will still count in totals.`)) return;
    setItems(items.filter((_, i) => i !== idx));
  }

  function addItem() {
    const name = newName.trim();
    if (!name) { setError('Enter an item name.'); return; }
    if (items.some(it => it.name.toLowerCase() === name.toLowerCase())) {
      setError('That item already exists.'); return;
    }
    const price = parseFloat(newPrice);
    setItems([...items, { name, price: isNaN(price) ? 0 : price, isDefault: false }]);
    setNewName('');
    setNewPrice('');
    setError('');
  }

  function handleSave() {
    const cleaned = items.map(it => {
      const n = parseFloat(it.price);
      return { ...it, price: isNaN(n) || n < 0 ? 0 : n };
    });
    localStorage.setItem('wl_items', JSON.stringify(cleaned));
    setItems(cleaned);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  function handleReset() {
    if (!window.confirm('Reset all items and prices to defaults? Custom items will be removed.')) return;
    localStorage.removeItem('wl_items');
    setItems([...DEFAULT_ITEMS]);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>Items & Prices</h1>
      <p style={styles.sub}>Edit prices for default items, or add your own custom items to the tracker.</p>

      <div style={styles.list}>
        {items.map((item, idx) => (
          <div key={idx} style={styles.row}>
            <div style={styles.labelWrap}>
              <span style={styles.label}>{item.name}</span>
              {!item.isDefault && <span style={styles.customBadge}>custom</span>}
            </div>
            <div style={styles.inputWrap}>
              <span style={styles.dollar}>$</span>
              <input
                style={styles.input}
                type="number"
                step="0.01"
                min="0"
                value={item.price}
                onChange={e => updatePrice(idx, e.target.value)}
              />
              {!item.isDefault && (
                <button style={styles.delBtn} onClick={() => deleteItem(idx)} title="Delete item">×</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.addCard}>
        <div style={styles.addLabel}>Add custom item</div>
        <div style={styles.addRow}>
          <input
            style={styles.nameInput}
            type="text"
            placeholder="e.g. Coffee"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <span style={styles.dollar}>$</span>
          <input
            style={styles.priceInput}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <button style={styles.addBtn} onClick={addItem}>+ Add</button>
        </div>
        {error && <div style={styles.errorText}>{error}</div>}
      </div>

      <div style={styles.actions}>
        <button style={styles.saveBtn} onClick={handleSave}>Save Changes</button>
        <button style={styles.resetBtn} onClick={handleReset}>Reset to Defaults</button>
      </div>

      {savedFlash && <div style={styles.savedBanner}>Saved successfully.</div>}
    </div>
  );
}

const styles = {
  wrap: { padding: '1.25rem 1.5rem', maxWidth: 560, margin: '0 auto' },
  h1: { fontSize: 20, fontWeight: 500, marginBottom: 3 },
  sub: { fontSize: 13, color: '#888', marginBottom: 20 },
  list: { background: '#fff', border: '1px solid #e8e8e4', borderRadius: 12, padding: '0.25rem 1rem' },
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 0', borderBottom: '1px solid #f0f0ea',
  },
  labelWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 14, fontWeight: 500, color: '#1a1a1a' },
  customBadge: {
    fontSize: 10, color: '#0F6E56', background: '#E1F5EE',
    border: '1px solid #5DCAA5', padding: '1px 7px', borderRadius: 10,
    textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600,
  },
  inputWrap: { display: 'flex', alignItems: 'center', gap: 6 },
  dollar: { fontSize: 13, color: '#888' },
  input: {
    width: 80, padding: '6px 8px', fontSize: 14,
    border: '1px solid #d0d0ca', borderRadius: 6,
    outline: 'none', textAlign: 'right', color: '#1a1a1a', background: '#fff',
  },
  delBtn: {
    width: 26, height: 26, borderRadius: 6,
    border: '1px solid #D85A30', background: '#FAECE7',
    color: '#993C1D', fontSize: 16, lineHeight: 1, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  addCard: {
    background: '#f5f5f0', borderRadius: 12, padding: '14px 16px', marginTop: 16,
  },
  addLabel: {
    fontSize: 11, fontWeight: 600, color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 9,
  },
  addRow: { display: 'flex', alignItems: 'center', gap: 6 },
  nameInput: {
    flex: 1, padding: '8px 10px', fontSize: 14,
    border: '1px solid #d0d0ca', borderRadius: 6,
    outline: 'none', color: '#1a1a1a', background: '#fff',
  },
  priceInput: {
    width: 80, padding: '8px 8px', fontSize: 14,
    border: '1px solid #d0d0ca', borderRadius: 6,
    outline: 'none', textAlign: 'right', color: '#1a1a1a', background: '#fff',
  },
  addBtn: {
    padding: '8px 14px', background: '#1D9E75', color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  errorText: { fontSize: 12, color: '#993C1D', marginTop: 8 },
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
