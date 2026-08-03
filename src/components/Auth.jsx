import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCompass, faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';

function AuthModal({ isOpen, onClose, onLogin, onRegister, onResetPassword }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    let success;
    if (isLogin) {
      success = await onLogin(email, password);
    } else {
      success = await onRegister(name, email, password);
    }

    setLoading(false);
    if (success) {
      onClose();
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await onResetPassword(email);
    setLoading(false);
    if (success) {
      setShowReset(false);
      setEmail('');
    }
  };

  const handleSwitch = () => {
    setIsLogin(!isLogin);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="auth-header">
          <div className="auth-logo">
            <FontAwesomeIcon icon={faCompass} />
          </div>
          <h2>{showReset ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{showReset ? 'Enter your email to reset your password' : isLogin ? 'Sign in to continue your journey' : 'Start your travel adventure today'}</p>
        </div>

        {showReset ? (
          <form onSubmit={handleReset} className="auth-form">
            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>

            <div className="auth-switch">
              <button type="button" onClick={() => setShowReset(false)}>
                Back to login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="auth-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? 'Enter your password' : 'Create a password (min 6 characters)'}
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="auth-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {isLogin && (
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => setShowReset(true)}
              >
                Forgot password?
              </button>
            )}

            <div className="auth-switch">
              <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
              <button type="button" onClick={handleSwitch}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;