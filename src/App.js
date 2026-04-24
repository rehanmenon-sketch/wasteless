import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LogWaste from './pages/LogWaste';
import Settings from './pages/Settings';

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('wl_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function handleLogin(userData) {
    localStorage.setItem('wl_user', JSON.stringify(userData));
    setUser(userData);
    setTab('dashboard');
  }

  function handleLogout() {
    localStorage.removeItem('wl_user');
    setUser(null);
    setTab('dashboard');
  }

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.dot} />
          <span style={styles.logoText}>WasteLess</span>
        </div>
        <button style={styles.signOutBtn} onClick={handleLogout}>Sign out</button>
      </div>

      <div style={styles.nav}>
        <button
          style={{ ...styles.navBtn, ...(tab === 'dashboard' ? styles.navBtnActive : {}) }}
          onClick={() => setTab('dashboard')}>
          Waste Dashboard
        </button>
        <button
          style={{ ...styles.navBtn, ...(tab === 'log' ? styles.navBtnActive : {}) }}
          onClick={() => setTab('log')}>
          Log Food Waste
        </button>
        <button
          style={{ ...styles.navBtn, ...(tab === 'settings' ? styles.navBtnActive : {}) }}
          onClick={() => setTab('settings')}>
          Settings
        </button>
      </div>

      <div>
        {tab === 'dashboard' && <Dashboard userEmail={user.email} />}
        {tab === 'log' && <LogWaste userEmail={user.email} onLogged={() => setTab('dashboard')} />}
        {tab === 'settings' && <Settings />}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 24px', background: '#fff',
    borderBottom: '1px solid #e8e8e4',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: '50%', background: '#1D9E75' },
  logoText: { fontSize: 15, fontWeight: 600, color: '#1a1a1a' },
  signOutBtn: {
    fontSize: 12, color: '#888', background: 'none',
    border: '1px solid #e0e0da', borderRadius: 6,
    padding: '4px 10px', cursor: 'pointer',
  },
  nav: {
    display: 'flex', background: '#fff',
    borderBottom: '1px solid #e8e8e4', padding: '0 24px',
  },
  navBtn: {
    padding: '12px 18px', fontSize: 13, fontWeight: 500,
    border: 'none', background: 'none', cursor: 'pointer',
    color: '#888', borderBottom: '2px solid transparent',
  },
  navBtnActive: { color: '#1a1a1a', borderBottomColor: '#1D9E75' },
};
