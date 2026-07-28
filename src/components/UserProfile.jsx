// src/components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faSignOutAlt, faEnvelope, faCalendar, 
  faRoute, faStar, faCog, faTimes, faCloud
} from '@fortawesome/free-solid-svg-icons';
import { signOutUser, getUserProfile, getUserItineraries } from '../services/firebase.js';

function UserProfile({ user, onClose, onSignOut }) {
  const [profile, setProfile] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const profileResult = await getUserProfile(user.uid);
        if (profileResult.success) {
          setProfile(profileResult.data);
        }
        
        const itinerariesResult = await getUserItineraries(user.uid);
        if (itinerariesResult.success) {
          setItineraries(itinerariesResult.data);
        }
        
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user]);

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      onSignOut();
      onClose();
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
        padding: '2rem',
        borderRadius: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
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
            cursor: 'pointer'
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#8bb3da' }}>
            Loading...
          </div>
        ) : (
          <>
            {/* User Info */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2b7be4, #1f5fbb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2.5rem',
                color: 'white'
              }}>
                <FontAwesomeIcon icon={faUser} />
              </div>
              <h3 style={{ color: '#f0f7fe' }}>{profile?.displayName || 'Traveler'}</h3>
              <p style={{ color: '#8bb3da', fontSize: '0.9rem' }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '0.5rem' }} />
                {user?.email}
              </p>
              <p style={{ color: '#8bb3da', fontSize: '0.8rem' }}>
                <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '0.5rem' }} />
                Member since {profile?.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
              </p>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6fc3ff' }}>
                  {itineraries.length}
                </div>
                <div style={{ color: '#8bb3da', fontSize: '0.8rem' }}>Trips</div>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6fc3ff' }}>
                  {profile?.savedItineraries?.length || 0}
                </div>
                <div style={{ color: '#8bb3da', fontSize: '0.8rem' }}>Saved</div>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6fc3ff' }}>
                  {profile?.preferences?.defaultPlan || 'Free'}
                </div>
                <div style={{ color: '#8bb3da', fontSize: '0.8rem' }}>Plan</div>
              </div>
            </div>

            {/* Saved Itineraries */}
            {itineraries.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#f0f7fe', marginBottom: '0.5rem' }}>
                  <FontAwesomeIcon icon={faRoute} style={{ color: '#6fc3ff', marginRight: '0.5rem' }} />
                  Your Trips
                </h4>
                {itineraries.slice(0, 3).map((itinerary) => (
                  <div key={itinerary.id} style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.8rem',
                    borderRadius: '0.8rem',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ color: '#f0f7fe' }}>{itinerary.destination}</div>
                      <div style={{ color: '#8bb3da', fontSize: '0.8rem' }}>
                        {itinerary.days} days · {itinerary.attractions?.length || 0} attractions
                      </div>
                    </div>
                    {itinerary.shared && (
                      <span style={{ color: '#6fc3ff', fontSize: '0.7rem' }}>
                        <FontAwesomeIcon icon={faCloud} /> Shared
                      </span>
                    )}
                  </div>
                ))}
                {itineraries.length > 3 && (
                  <p style={{ color: '#8bb3da', fontSize: '0.8rem', textAlign: 'center' }}>
                    +{itineraries.length - 3} more trips
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleSignOut}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '1rem',
                  background: 'rgba(255,68,68,0.1)',
                  border: '1px solid rgba(255,68,68,0.2)',
                  color: '#ff6b6b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserProfile;