import { useAuth } from '../hooks/useAuth.js';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>📋 DevFlow</h1>
        </div>
        {user && (
          <div className="navbar-user">
            <span>{user.name}</span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
