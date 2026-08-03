import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUserCog, faEnvelope, faLock, faKey } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabase/config';

function AdminLogin({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('is_admin, role')
        .eq('auth_id', data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile?.is_admin && profile?.role !== 'admin') {
        throw new Error('Admin privileges required');
      }

      setLoading(false);
      onLoginSuccess(data.user);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="admin-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="admin-login-header">
          <div className="admin-login-icon">
            <FontAwesomeIcon icon={faUserCog} />
          </div>
          <h2>Admin Login</h2>
          <p>Enter your admin credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label><FontAwesomeIcon icon={faEnvelope} /> Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="admin-login-field">
            <label><FontAwesomeIcon icon={faLock} /> Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div style={{
              color: '#ff6b6b',
              fontSize: '0.9rem',
              padding: '0.5rem',
              background: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="admin-login-submit" disabled={loading}>
            {loading ? 'Checking...' : <><FontAwesomeIcon icon={faKey} /> Login to Admin</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;