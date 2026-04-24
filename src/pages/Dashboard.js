import { useState, useEffect } from 'react';
import { db } from '../firebaseClient';
import { collection, query, where, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';

const ITEMS_ORDER = ['Milk', 'Pastries', 'Eggs', 'Bread', 'Fruit', 'Prepared Food', 'Other'];
const REASONS_ORDER = ['Not Sold', 'Expired / Spoiled', 'Leftover', 'Overproduction', 'Mistake', 'Other'];
const ITEM_PRICES = {
  Milk: 6.00,
  Pastries: 3.50,
  Eggs: 0.40,
  Bread: 4.50,
  Fruit: 1.25,
  'Prepared Food': 8.00,
  Other: 5.00,
};
const ITEM_COLORS = {
  Milk: '#378ADD', Pastries: '#1D9E75', Eggs: '#FAC775',
  Bread: '#F0997B', Fruit: '#9FE1CB', 'Prepared Food': '#7F77DD', Other: '#B4B2A9'
};
const REASON_COLORS = {
  'Not Sold': '#1D9E75', 'Expired / Spoiled': '#5DCAA5', Leftover: '#FAC775',
  Overproduction: '#F0997B', Mistake: '#D3D1C7', Other: '#B4B2A9'
};
const RECO = {
  Pastries: 'Reduce pastry orders by 10% - top wasted item.',
  Milk: 'Order milk in smaller batches to reduce spoilage.',
  Bread: 'Adjust bread orders closer to daily demand.',
  Eggs: 'Monitor egg usage vs. ordering cadence.',
  Fruit: 'Use riper fruit in prepared foods before disposal.',
  'Prepared Food': 'Scale back batch sizes for prepared items.',
  Other: 'Review ordering patterns for frequently wasted items.'
};

const FILTERS = ['Today', 'This Week', 'All Time'];

function getFilteredLogs(logs, filter) {
  const now = new Date();
  if (filter === 'Today') {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return logs.filter(l => {
      const t = l.logged_at?.seconds ? new Date(l.logged_at.seconds * 1000) : null;
      return t && t >= startOfDay;
    });
  }
  if (filter === 'This Week') {
    const day = now.getDay();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    return logs.filter(l => {
      const t = l.logged_at?.seconds ? new Date(l.logged_at.seconds * 1000) : null;
      return t && t >= startOfWeek;
    });
  }
  return logs;
}

export default function Dashboard({ userEmail }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Today');
  const [resetting, setResetting] = useState(false);

  async function fetchLogs() {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'waste_logs'),
        where('email', '==', userEmail)
      );
      const snapshot = await getDocs(q);
      const sorted = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.logged_at?.seconds ?? 0;
          const bTime = b.logged_at?.seconds ?? 0;
          return bTime - aTime;
        });
      setLogs(sorted);
    } catch (e) {
      console.error('Error fetching logs:', e);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLogs();
  }, [userEmail]);

  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, 'waste_logs', id));
      setLogs(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      console.error('Error deleting entry:', e);
    }
  }

  async function handleReset() {
    if (!window.confirm('Are you sure you want to delete all your waste log data? This cannot be undone.')) return;
    setResetting(true);
    try {
      const batch = writeBatch(db);
      logs.forEach(l => batch.delete(doc(db, 'waste_logs', l.id)));
      await batch.commit();
      setLogs([]);
    } catch (e) {
      console.error('Error resetting logs:', e);
    }
    setResetting(false);
  }

  function handleEmailSummary() {
    const subject = `WasteLess Summary — ${filter} (${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})`;
    const lines = [
      `WasteLess Waste Summary`,
      `Period: ${filter}`,
      ``,
      `Total entries: ${filteredLogs.length}`,
      `Total units wasted: ${totalUnits}`,
      `Estimated money wasted: $${totalCost.toFixed(2)}`,
      `Most wasted item: ${filteredLogs.length > 0 ? `${topItem} (${itemCounts[topItem]} units)` : 'N/A'}`,
      `Top reason: ${filteredLogs.length > 0 ? topReason : 'N/A'}`,
      ``,
      `Waste by item:`,
      ...ITEMS_ORDER.map(i => `  ${i}: ${itemCounts[i]} units`),
      ``,
      `Waste by reason:`,
      ...REASONS_ORDER.map(r => `  ${r}: ${reasonCounts[r]} units`),
      ``,
      `Weekly goal: ${goalPct}% of ${GOAL} unit limit used`,
    ];
    window.location.href = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  }

  const filteredLogs = getFilteredLogs(logs, filter);

  const itemCounts = Object.fromEntries(ITEMS_ORDER.map(i => [i, 0]));
  const reasonCounts = Object.fromEntries(REASONS_ORDER.map(r => [r, 0]));
  let totalUnits = 0;
  let totalCost = 0;
  filteredLogs.forEach(l => {
    if (itemCounts[l.item] !== undefined) itemCounts[l.item] += l.quantity;
    if (reasonCounts[l.reason] !== undefined) reasonCounts[l.reason] += l.quantity;
    totalUnits += l.quantity;
    totalCost += (ITEM_PRICES[l.item] || 0) * l.quantity;
  });

  const topItem = ITEMS_ORDER.reduce((a, b) => itemCounts[a] >= itemCounts[b] ? a : b);
  const topReason = REASONS_ORDER.reduce((a, b) => reasonCounts[a] >= reasonCounts[b] ? a : b);
  const maxItem = Math.max(1, ...ITEMS_ORDER.map(i => itemCounts[i]));
  const GOAL = 120;
  const goalPct = Math.min(100, Math.round(totalUnits / GOAL * 100));

  if (loading) return <div style={{ padding: '2rem', color: '#888', fontSize: 14 }}>Loading...</div>;

  return (
    <div style={styles.wrap}>
      <div style={styles.titleRow}>
        <div>
          <h1 style={styles.h1}>Waste Summary</h1>
          <p style={styles.sub}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div style={styles.titleActions}>
          <button style={styles.emailBtn} onClick={handleEmailSummary}>Email Summary</button>
          <button style={styles.resetBtn} onClick={handleReset} disabled={resetting || logs.length === 0}>
            {resetting ? 'Clearing...' : 'Reset All Data'}
          </button>
        </div>
      </div>

      <div style={styles.filterRow}>
        {FILTERS.map(f => (
          <button
            key={f}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
            onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Waste logs</div>
          <div style={styles.statVal}>{filteredLogs.length}</div>
          <div style={styles.statSub}>entries</div>
        </div>
        <div style={{ ...styles.statCard, background: '#FAECE7' }}>
          <div style={{ ...styles.statLabel, color: '#993C1D' }}>Money wasted</div>
          <div style={{ ...styles.statVal, color: '#993C1D' }}>${totalCost.toFixed(2)}</div>
          <div style={{ ...styles.statSub, color: '#993C1D' }}>estimated</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Most wasted item</div>
          <div style={{ ...styles.statVal, fontSize: 15 }}>{filteredLogs.length > 0 ? topItem : '--'}</div>
          <div style={styles.statSub}>{filteredLogs.length > 0 ? itemCounts[topItem] + ' unit(s)' : 'no entries yet'}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Top reason</div>
          <div style={{ ...styles.statVal, fontSize: 13 }}>{filteredLogs.length > 0 ? topReason : '--'}</div>
          <div style={styles.statSub}>
            {filteredLogs.length > 0 ? Math.round(reasonCounts[topReason] / totalUnits * 100) + '% of units' : 'no entries yet'}
          </div>
        </div>
      </div>

      <div style={styles.recoCard}>
        <div style={styles.recoLabel}>Recommendation</div>
        <div style={styles.recoText}>
          {filteredLogs.length > 0 ? RECO[topItem] : 'Log some waste entries to see recommendations.'}
        </div>
      </div>

      <div style={styles.dashGrid}>
        <div style={styles.card}>
          <div style={styles.chartTitle}>Waste by item</div>
          {ITEMS_ORDER.map(item => {
            const c = itemCounts[item] || 0;
            const w = Math.round(c / maxItem * 100);
            return (
              <div key={item} style={styles.barRow}>
                <span style={styles.barLabel}>{item}</span>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: w + '%', background: ITEM_COLORS[item] }} />
                </div>
                <span style={styles.barCount}>{c}</span>
              </div>
            );
          })}
        </div>

        <div style={styles.card}>
          <div style={styles.chartTitle}>Waste by reason</div>
          {REASONS_ORDER.map(r => {
            const v = reasonCounts[r] || 0;
            const p = totalUnits > 0 ? Math.round(v / totalUnits * 100) : 0;
            return (
              <div key={r} style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: REASON_COLORS[r] }} />
                <span style={styles.legendLabel}>{r}</span>
                <span style={styles.legendPct}>{p}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.goalCard}>
        <div style={styles.goalRow}>
          <span style={styles.goalTitle}>Weekly waste reduction goal</span>
          <span style={styles.goalPct}>{goalPct}%</span>
        </div>
        <div style={styles.goalTrack}>
          <div style={{ ...styles.goalFill, width: goalPct + '%', background: goalPct >= 100 ? '#E24B4A' : '#1D9E75' }} />
        </div>
        <div style={styles.goalNote}>
          Target: keep total waste under {GOAL} units this week - currently at {totalUnits}
        </div>
      </div>

      <div style={styles.logList}>
        <div style={styles.logListTitle}>Recent entries</div>
        {filteredLogs.length === 0
          ? <div style={styles.emptyState}>No entries for this period. Switch to Log Food Waste to get started.</div>
          : filteredLogs.slice(0, 8).map(l => (
            <div key={l.id} style={styles.logItem}>
              <span style={styles.logLeft}>{l.quantity}x {l.item}</span>
              <span style={styles.logRight}>
                {l.reason} · {l.logged_at?.toDate
                  ? l.logged_at.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </span>
              <button style={styles.deleteBtn} onClick={() => handleDelete(l.id)}>Delete</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: '1.25rem 1.5rem', maxWidth: 800, margin: '0 auto' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  h1: { fontSize: 20, fontWeight: 500, marginBottom: 3 },
  sub: { fontSize: 13, color: '#888', marginBottom: 0 },
  titleActions: { display: 'flex', gap: 8, marginTop: 4 },
  emailBtn: {
    fontSize: 12, color: '#0F6E56', background: '#E1F5EE',
    border: '1px solid #5DCAA5', borderRadius: 6,
    padding: '5px 11px', cursor: 'pointer',
  },
  resetBtn: {
    fontSize: 12, color: '#993C1D', background: '#FAECE7',
    border: '1px solid #D85A30', borderRadius: 6,
    padding: '5px 11px', cursor: 'pointer',
  },
  filterRow: { display: 'flex', gap: 6, marginBottom: 14, marginTop: 12 },
  filterBtn: {
    fontSize: 12, padding: '5px 13px', borderRadius: 20,
    border: '1px solid #d0d0ca', background: '#fff',
    color: '#888', cursor: 'pointer', fontWeight: 500,
  },
  filterBtnActive: { background: '#E1F5EE', borderColor: '#1D9E75', color: '#0F6E56' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 },
  statCard: { background: '#f5f5f0', borderRadius: 8, padding: '14px 16px' },
  statLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  statVal: { fontSize: 22, fontWeight: 500 },
  statSub: { fontSize: 11, color: '#888', marginTop: 2 },
  recoCard: {
    background: '#E1F5EE', border: '1px solid #5DCAA5',
    borderRadius: 8, padding: '11px 14px', marginBottom: 16,
  },
  recoLabel: { fontSize: 11, fontWeight: 600, color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 },
  recoText: { fontSize: 13, color: '#0F6E56' },
  dashGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  card: { background: '#fff', borderRadius: 12, border: '1px solid #e8e8e4', padding: '1rem 1.1rem' },
  chartTitle: { fontSize: 13, fontWeight: 500, marginBottom: 11 },
  barRow: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 },
  barLabel: { fontSize: 12, color: '#888', width: 90, flexShrink: 0, textAlign: 'right' },
  barTrack: { flex: 1, height: 16, background: '#f0f0ea', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.4s ease' },
  barCount: { fontSize: 11, color: '#888', width: 20 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 },
  legendDot: { width: 9, height: 9, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 12, color: '#888', flex: 1 },
  legendPct: { fontSize: 12, fontWeight: 500 },
  goalCard: { background: '#fff', borderRadius: 12, border: '1px solid #e8e8e4', padding: '1rem 1.1rem', marginBottom: 16 },
  goalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 },
  goalTitle: { fontSize: 13, fontWeight: 500 },
  goalPct: { fontSize: 13, color: '#888' },
  goalTrack: { width: '100%', height: 10, background: '#f0f0ea', borderRadius: 6, overflow: 'hidden' },
  goalFill: { height: '100%', borderRadius: 6, transition: 'width 0.4s ease' },
  goalNote: { fontSize: 11, color: '#888', marginTop: 5 },
  logList: { marginTop: 8 },
  logListTitle: { fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 },
  logItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e8e8e4', fontSize: 13 },
  logLeft: { fontWeight: 500, flex: 1 },
  logRight: { color: '#888', marginRight: 12 },
  deleteBtn: {
    fontSize: 11, color: '#993C1D', background: 'none',
    border: '1px solid #D85A30', borderRadius: 5,
    padding: '2px 8px', cursor: 'pointer', flexShrink: 0,
  },
  emptyState: { fontSize: 13, color: '#888', padding: '12px 0' },
};
