import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, faUser, faCrown, faSignOutAlt, faEdit, faSave,
  faRoute, faTicket, faStar, faCalendar, faGem
} from '@fortawesome/free-solid-svg-icons';

function UserProfile({ user, onLogout, onUpdateProfile, onClose, userTrips, userBookings }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setLoading(true);
    await onUpdateProfile({ name, email });
    setLoading(false);
    setIsEditing(false);
  };

  const getPlanBadge = (plan) => {
    const plans = {
      free: { color: '#aac9f0', label: 'Standard' },
      basic: { color: '#6fd4b0', label: 'Premium' },
      pro: { color: '#f5c542', label: 'Luxury' }
    };
    return plans[plan] || plans.free;
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            <FontAwesomeIcon icon={faUser} size="3x" />
          </div>
          <h2>{user.name || 'Traveler'}</h2>
          <p>{user.email}</p>
          <div className="profile-plan">
            <FontAwesomeIcon icon={faGem} style={{ marginRight: '4px' }} />
            {getPlanBadge(user.plan).label} Plan
          </div>
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
            <h4>Account Information</h4>
            {isEditing ? (
              <div className="profile-edit-form">
                <div className="profile-field">
                  <label>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="profile-actions">
                  <button 
                    className="profile-save" 
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSave} /> {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="profile-cancel" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{user.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Plan</span>
                  <span className="info-value" style={{ color: getPlanBadge(user.plan).color }}>
                    {getPlanBadge(user.plan).label}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">{user.memberSince || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>

          {userTrips && userTrips.length > 0 && (
            <div className="profile-section">
              <h4><FontAwesomeIcon icon={faRoute} /> Recent Trips</h4>
              {userTrips.slice(0, 3).map((trip) => (
                <div key={trip.id} className="profile-trip-item">
                  <span>✈️ {trip.destination}</span>
                  <span className="status-confirmed">{trip.days} days</span>
                </div>
              ))}
            </div>
          )}

          {userBookings && userBookings.length > 0 && (
            <div className="profile-section">
              <h4><FontAwesomeIcon icon={faTicket} /> Recent Bookings</h4>
              {userBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="profile-trip-item">
                  <span>🦁 {booking.packageName}</span>
                  <span className={`status-${booking.status}`}>
                    {booking.status || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="profile-actions" style={{ marginTop: '1rem' }}>
            {!isEditing && (
              <button 
                className="profile-edit" 
                onClick={() => setIsEditing(true)}
              >
                <FontAwesomeIcon icon={faEdit} /> Edit Profile
              </button>
            )}
            <button 
              className="profile-logout" 
              onClick={onLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;