// src/components/Auth.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faEnvelope, faLock, faUser, faTimes } from '@fortawesome/free-solid-svg-icons';
import { signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword } from '../services/firebase.js';

function Auth({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const result = await signInWithGoogle();
    setLoading(false);
    
    if (result.success) {
      onAuthSuccess(result.user);
      onClose();
    } else {
      setError(result.error);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isLogin) {
      result = await signInWithEmail(email, password);
    } else {
      result = await signUpWithEmail(email, password, displayName);
    }

    setLoading(false);
    
    if (result.success) {
      onAuthSuccess(result.user);
      onClose();
    } else {
      setError(result.error);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    const result = await resetPassword(email);
    setLoading(false);
    
    if (result.success) {
      setResetMode(false);
      alert('Password reset email sent! Check your inbox.');
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1b2f44, #0b1a2e)',
        padding: '2.5rem',
        borderRadius: '2rem',
        maxWidth: '420px',
        width: '90%',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            color: '#b6d9ff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h2 style={{ color: '#f0f7fe', marginBottom: '0.5rem' }}>
          {resetMode ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: '#8bb3da', marginBottom: '2rem' }}>
          {resetMode 
            ? 'Enter your email to reset your password' 
            : isLogin 
              ? 'Sign in to access your saved trips' 
              : 'Start planning your dream trips'}
        </p>

        {error && (
          <div style={{
            background: 'rgba(255,68,68,0.1)',
            padding: '0.8rem',
            borderRadius: '0.8rem',
            color: '#ff6b6b',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {resetMode ? (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#8bb3da', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#f0f7fe',
                  fontSize: '1rem'
                }}
                placeholder="your@email.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #2b7be4, #1f5fbb)',
                border: 'none',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
            <button
              type="button"
              onClick={() => setResetMode(false)}
              style={{
                width: '100%',
                marginTop: '0.8rem',
                padding: '0.8rem',
                borderRadius: '1rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#8bb3da',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f7fe',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem'
              }}
            >
              <FontAwesomeIcon icon={faGoogle} style={{ color: '#ea4335' }} />
              {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <hr style={{ flex: 1, border: '1px solid rgba(255,255,255,0.05)' }} />
              <span style={{ color: '#8bb3da', fontSize: '0.8rem' }}>OR</span>
              <hr style={{ flex: 1, border: '1px solid rgba(255,255,255,0.05)' }} />
            </div>

            <form onSubmit={handleEmailAuth}>
              {!isLogin && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#8bb3da', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255,255,255,0.05)',
                      background: 'rgba(0,0,0,0.3)',
                      color: '#f0f7fe',
                      fontSize: '1rem'
                    }}
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#8bb3da', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#f0f7fe',
                    fontSize: '1rem'
                  }}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#8bb3da', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#f0f7fe',
                    fontSize: '1rem'
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #2b7be4, #1f5fbb)',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6fc3ff',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>

            {isLogin && (
              <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setResetMode(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8bb3da',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Auth;