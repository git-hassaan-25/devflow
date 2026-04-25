import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import api from '../api/axios.js';
import './Home.css';

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    api.get('/health')
      .then((res) => setStatus(res.data.message))
      .catch(() => setStatus('API unreachable'));
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (user) {
    navigate('/projects', { replace: true });
    return null;
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>📋 DevFlow</h1>
        <p className="tagline">A modern task management platform</p>
        <p className="description">
          Organize your projects and tasks with drag-and-drop Kanban boards.
        </p>

        <div className="status-info">
          <p>API Status: <strong>{status}</strong></p>
        </div>

        <div className="home-actions">
          <button onClick={() => navigate('/login')} className="btn-primary">
            Login
          </button>
          <button onClick={() => navigate('/register')} className="btn-secondary">
            Register
          </button>
        </div>

        <p className="demo-hint">
          Demo credentials: <code>demo@devflow.local</code> / <code>demo123456</code>
        </p>
      </div>
    </div>
  );
}
