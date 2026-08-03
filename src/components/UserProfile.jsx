import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faUser, 
  faCrown, 
  faSignOutAlt, 
  faEdit, 
  faSave,
  faRoute, 
  faTicket, 
  faStar, 
  faCalendar, 
  faGem,
  faArrowLeft,
  faGaugeHigh
} from '@fortawesome/free-solid-svg-icons';

function UserProfile({ user, onLogout, onUpdateProfile, onClose, userTrips, userBookings, onBackToDashboard }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // If no user, return null (after all hooks)
  if (!user) return null;

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      alert('Name and email are required');
      return;
    }
    
    setLoading(true);
    try {
      await onUpdateProfile({ name, email });
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile. Please try again.');
    }
    setLoading(false);
  };

  const getPlanBadge = (plan) => {
    const plans = {
      free: { color: '#aac9f0', label: 'Standard', icon: '👤' },
      basic: { color: '#6fd4b0', label: 'Premium', icon: '⭐' },
      pro: { color: '#f5c542', label: 'Luxury', icon: '👑' }
    };
    return plans[plan] || plans.free;
  };

  const planInfo = getPlanBadge(user.plan);
  const isAdmin = user.isAdmin || user.role === 'admin';

  // Handle close function - make sure it calls onClose
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={handleOverlayClick}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button - Top Right X */}
        <button 
          className="profile-close" 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleClose();
          }}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            color: '#b6d9ff',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
          title="Close Profile"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            <FontAwesomeIcon icon={faUser} size="3x" />
          </div>
          <h2>{user.name || 'Traveler'}</h2>
          <p>{user.email}</p>
          <div className="profile-plan" style={{
            display: 'inline-block',
            padding: '0.2rem 1rem',
            borderRadius: '20px',
            background: 'rgba(255,215,0,0.15)',
            color: planInfo.color,
            fontSize: '0.8rem',
            marginTop: '0.3rem'
          }}>
            {planInfo.icon} {planInfo.label} Plan
          </div>
          {isAdmin && (
            <div style={{
              marginTop: '0.3rem',
              padding: '0.2rem 0.8rem',
              borderRadius: '10px',
              background: 'rgba(245, 197, 66, 0.2)',
              color: '#f5c542',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              👑 ADMIN
            </div>
          )}
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{userTrips?.length || 0}</span>
            <span className="stat-label">Trips</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userBookings?.length || 0}</span>
            <span className="stat-label">Bookings</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.reviews || 0}</span>
            <span className="stat-label">Reviews</span>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-section">
            <h4 style={{ color: '#8bb3da', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Account Information
            </h4>
            {isEditing ? (
              <div className="profile-edit-form">
                <div className="profile-field">
                  <label style={{ color: '#b3d6ff', fontSize: '0.85rem' }}>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(0,0,0,0.3)',
                      color: '#f0f7fe',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div className="profile-field">
                  <label style={{ color: '#b3d6ff', fontSize: '0.85rem' }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(0,0,0,0.3)',
                      color: '#f0f7fe',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div className="profile-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    className="profile-save" 
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '0.7rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #2b7be4, #1f5fbb)',
                      color: 'white',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    <FontAwesomeIcon icon={faSave} /> {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="profile-cancel" 
                    onClick={() => setIsEditing(false)}
                    style={{
                      flex: 1,
                      padding: '0.7rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent',
                      color: '#8bb3da',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-row" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <span className="info-label" style={{ color: '#8bb3da' }}>Name</span>
                  <span className="info-value" style={{ color: '#f0f7fe' }}>{user.name}</span>
                </div>
                <div className="info-row" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <span className="info-label" style={{ color: '#8bb3da' }}>Email</span>
                  <span className="info-value" style={{ color: '#f0f7fe' }}>{user.email}</span>
                </div>
                <div className="info-row" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <span className="info-label" style={{ color: '#8bb3da' }}>Plan</span>
                  <span className="info-value" style={{ color: planInfo.color }}>
                    {planInfo.icon} {planInfo.label}
                  </span>
                </div>
                <div className="info-row" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0'
                }}>
                  <span className="info-label" style={{ color: '#8bb3da' }}>Member Since</span>
                  <span className="info-value" style={{ color: '#f0f7fe' }}>
                    {user.memberSince || 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {userTrips && userTrips.length > 0 && (
            <div className="profile-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: '#8bb3da', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <FontAwesomeIcon icon={faRoute} /> Recent Trips
              </h4>
              {userTrips.slice(0, 3).map((trip) => (
                <div key={trip.id} className="profile-trip-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  color: '#f0f7fe',
                  fontSize: '0.9rem',
                  borderBottom: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <span>✈️ {trip.destination}</span>
                  <span style={{ color: '#6fd4b0' }}>{trip.days} days</span>
                </div>
              ))}
            </div>
          )}

          {userBookings && userBookings.length > 0 && (
            <div className="profile-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: '#8bb3da', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <FontAwesomeIcon icon={faTicket} /> Recent Bookings
              </h4>
              {userBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="profile-trip-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  color: '#f0f7fe',
                  fontSize: '0.9rem',
                  borderBottom: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <span>🦁 {booking.packageName}</span>
                  <span className={`status-${booking.status}`} style={{
                    color: booking.status === 'confirmed' ? '#3eff9e' : 
                           booking.status === 'pending' ? '#f5c542' : '#ff6b6b'
                  }}>
                    {booking.status || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="profile-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!isEditing && (
                <button 
                  className="profile-edit" 
                  onClick={() => setIsEditing(true)}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(111, 195, 255, 0.2)',
                    background: 'rgba(43, 123, 228, 0.2)',
                    color: '#6fc3ff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} /> Edit Profile
                </button>
              )}
              <button 
                className="profile-logout" 
                onClick={() => {
                  // Close profile first, then logout
                  handleClose();
                  if (onLogout) {
                    onLogout();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  background: 'rgba(255, 107, 107, 0.15)',
                  color: '#ff6b6b',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </button>
            </div>

            {/* Back to Dashboard Button - Only show if admin */}
            {isAdmin && (
              <button 
                onClick={() => {
                  handleClose();
                  if (onBackToDashboard) {
                    onBackToDashboard();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(245, 197, 66, 0.3)',
                  background: 'rgba(245, 197, 66, 0.1)',
                  color: '#f5c542',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 197, 66, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 197, 66, 0.1)';
                }}
              >
                <FontAwesomeIcon icon={faGaugeHigh} /> Back to Dashboard
              </button>
            )}

            {/* Close Button at bottom */}
            <button 
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: '#8bb3da',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;