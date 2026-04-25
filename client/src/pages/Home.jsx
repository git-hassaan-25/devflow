import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function Home() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    api.get('/health')
      .then((res) => setStatus(res.data.message))
      .catch(() => setStatus('API unreachable'));
  }, []);

  return (
    <main style={{ padding: 32, maxWidth: 720, margin: '0 auto' }}>
      <h1>DevFlow</h1>
      <p>API says: <strong>{status}</strong></p>
    </main>
  );
}
