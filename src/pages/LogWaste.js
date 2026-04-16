import { useState } from 'react';
import { db } from '../firebaseClient';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const REASONS = ['Expired / Spoiled', 'Leftover', 'Not Sold', 'Overproduction', 'Mistake', 'Other'];
const ITEMS = ['Milk', 'Pastries', 'Eggs', 'Bread', 'Fruit', 'Prepared Food', 'Other'];

function nowLocal() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function LogWaste({ userEmail, staffName, onLogged }) {
  const [reason, setReason] = useState('');
  const [item, setItem] = useState('');
  const [qty, setQty] = useState(1);
  const [logDate, setLogDate] = useState(nowLocal());
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!reason || !item) { setStatus('error'); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'waste_logs'), {
        email: userEmail,
        staff_name: staffName,
        item,
        reason,
        quantity: qty,
        logged_at: Timestamp.fromDate(new Date(logDate)),
      });
      setStatus('success');
      setReason('');
      setItem('');
      setQty(1);
      setLogDate(nowLocal());
      setTimeout(() => { setStatus(''); onLogged(); }, 1800);
    } catch (e) {
      setStatus('dberror');
    }
    setLoading(false);
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>Log Food Waste</h1>
      <p style={styles.sub}>Logging as <strong>{staffName}</strong></p>

      <div style={styles.sectionLabel}>Why is this being thrown away?</div>
      <div style={styles.chips}>
        {REASONS.map(r => (
          <button key={r}
            style={{ ...styles.chip, ...(reason === r ? styles.chipSel : {}) }}
            onClick={() => setReason(r)}>{r}
          </button>
        ))}
      </div>

      <div style={styles.sectionLabel}>What item?</div>
      <div style={styles.chips}>
        {ITEMS.map(i => (
          <button key={i}
            style={{ ...styles.chip, ...(item === i ? styles.chipSel : {}) }}
            onClick={() => setItem(i)}>{i}
          </button>
        ))}
      </div>

      <div style={styles.sectionLabel}>Quantity</div>
      <div style={styles.qtyRow}>
        <button style={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
        <span style={styles.qtyVal}>{qty}</span>
        <button style={styles.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
        <span style={styles.qtyUnit}>unit(s)</span>
      </div>

      <div style={styles.sectionLabel}>Date & Time</div>
      <input
        style={styles.dateInput}
        type="datetime-local"
        value={logDate}
        onChange={e => setLogDate(e.target.value)}
      />

      <div style={styles.divider} />
      <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : 'Submit Entry'}
      </button>

      {status === 'success' && (
        <div style={styles.successBanner}>
          Entry recorded — {qty}x {item} ({reason})
        </div>
      )}
      {status === 'error' && (
        <div style={styles.errorBanner}>Please select a reason and an item.</div>
      )}
      {status === 'dberror' && (
        <div style={styles.errorBanner}>Something went wrong. Check your Firebase connection.</div>
      )}
    </div>
  );
}

const styles = {
  wrap: { padding: '1.25rem 1.5rem', maxWidth: 520, margin: '0 auto' },
  h1: { fontSize: 20, fontWeight: 500, marginBottom: 3 },
  sub: { fontSize: 13, color: '#888', marginBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: 600, color: '#888',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    marginBottom: 9, marginTop: 18,
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: {
    padding: '6px 13px', fontSize: 13, borderRadius: 20,
    border: '1px solid #d0d0ca', background: '#fff',
    color: '#1a1a1a', cursor: 'pointer',
  },
  chipSel: { background: '#E1F5EE', borderColor: '#1D9E75', color: '#0F6E56', fontWeight: 500 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 },
  qtyBtn: {
    width: 34, height: 34, borderRadius: 8,
    border: '1px solid #d0d0ca', background: '#fff',
    fontSize: 18, cursor: 'pointer', color: '#1a1a1a',
  },
  qtyVal: { fontSize: 22, fontWeight: 500, minWidth: 28, textAlign: 'center' },
  qtyUnit: { fontSize: 13, color: '#888' },
  dateInput: {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: '1px solid #e0e0da', borderRadius: 8,
    outline: 'none', background: '#fff', color: '#1a1a1a',
    boxSizing: 'border-box',
  },
  divider: { height: 1, background: '#e8e8e4', margin: '20px 0' },
  submitBtn: {
    width: '100%', padding: 12, background: '#1D9E75',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 15, fontWeight: 500, cursor: 'pointer',
  },
  successBanner: {
    marginTop: 12, padding: '11px 15px', fontSize: 13,
    fontWeight: 500, color: '#0F6E56', background: '#E1F5EE',
    border: '1px solid #1D9E75', borderRadius: 8,
  },
  errorBanner: {
    marginTop: 12, padding: '11px 15px', fontSize: 13,
    color: '#993C1D', background: '#FAECE7',
    border: '1px solid #D85A30', borderRadius: 8,
  },
};
