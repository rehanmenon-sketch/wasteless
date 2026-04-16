import { useState } from 'react';

const VALID_EMAIL = 'rehanmenon@icloud.com';
const VALID_PASS = 'wasteless2026';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (email.trim().toLowerCase() === VALID_EMAIL && password === VALID_PASS) {
      setError('');
      onLogin({ email: VALID_EMAIL, name: name.trim() });
    } else {
      setError('Incorrect email or password. Please try again.');
      setPassword('');
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.dot} />
          <span style={styles.logoText}>WasteLess</span>
        </div>
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.sub}>Sign in to your account</p>

        <label style={styles.label}>Your Name</label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g. Sarah"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <label style={styles.label}>Password</label>
        <input
          style={styles.input}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />

        <button style={styles.btn} onClick={handleSubmit}>Sign In</button>
        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: '#f5f5f0',
  },
  card: {
    background: '#fff', borderRadius: 16,
    border: '1px solid #e8e8e4',
    padding: '2rem', width: '100%', maxWidth: 380,
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 12, height: 12, borderRadius: '50%', background: '#1D9E75' },
  logoText: { fontSize: 17, fontWeight: 600 },
  heading: { fontSize: 22, fontWeight: 500, marginBottom: 4 },
  sub: { fontSize: 13, color: '#888', marginBottom: 24 },
  label: {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: '#888', textTransform: 'uppercase',
    letterSpacing: '0.5px', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: '1px solid #e0e0da', borderRadius: 8,
    marginBottom: 16, outline: 'none', background: '#fff',
    color: '#1a1a1a', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: 12, background: '#1D9E75',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 15, fontWeight: 500, cursor: 'pointer', marginTop: 4,
  },
  error: {
    marginTop: 12, padding: '10px 13px', fontSize: 13,
    color: '#993C1D', background: '#FAECE7',
    border: '1px solid #D85A30', borderRadius: 8,
  },
};
