import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCompass, faRobot, faGlobe, faMicrophoneAlt, faMapPin, 
  faRoute, faUsers, faCrown, faCommentDots, faMapSigns,
  faUmbrellaBeach, faCity, faMountain, faTags, faArrowRight,
  faCheckCircle, faStar, faPaperPlane, faCheck,
  faPlane, faMicrophone, faMicrophoneSlash, faLocationDot,
  faHotel, faUtensils, faCamera, faCalendar, faClock,
  faXmark, faMapLocationDot, faHeadset, faShieldAlt,
  faGift, faMobileAlt, faUserTie, faBuilding,
  faHandshake, faAward, faRocket, faGem, faHeart,
  faPhone, faEnvelope, faPassport, faTicket,
  faCreditCard, faShield, faClockRotateLeft,
  faCar, faShip, faTrain, faBus,
  faWifi, faDollarSign, faExternalLinkAlt,
  faSearch, faPlus, faMinus, faTimes, faBars, faHome,
  faInfo, faQuestion, faExclamation, faTrash,
  faEdit, faSave, faUpload, faPlay, faPause, faStop,
  faSun, faMoon, faCloud, faCloudRain, faSnowflake,
  faDownload, faShare, faBookmark, faBell,
  faCheckDouble, faList, faClipboard, faFileAlt,
  faThermometerHalf, faWind, faTint, faSmog,
  faPaw, faTree, faWater, faMountain as faMountainIcon, faBinoculars,
  faCampground, faFire, faLeaf,
  faUser, faUserPlus, faSignInAlt, faSignOutAlt,
  faLock, faEnvelope as faEnvelopeIcon, faIdCard,
  faHistory, faHeart as faHeartIcon, faCog,
  faBell as faBellIcon, faMessage, faGear,
  faPen, faTrashCan, faArrowLeft, faArrowRight as faArrowRightIcon,
  faBars as faBarsIcon, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import './App.css';
import * as THREE from 'three';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  auth, 
  loginUser, 
  registerUser, 
  logoutUser, 
  getUserProfile, 
  updateUserProfile,
  updateUserPlan,
  saveTrip,
  getUserTrips,
  deleteTrip,
  bookSafari,
  getUserSafariBookings,
  updateSafariBooking,
  saveMessage,
  getUserMessages,
  saveFavoriteDestination,
  removeFavoriteDestination,
  onAuthStateChange,
  getCurrentUser,
  resetPassword,
  updateUserEmail,
  updateUserPassword
} from './components/firebase/config.js';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// --- 3D Avatar ---
function TravelAvatar() {
  const groupRef = useRef(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial color="#4d9eff" transparent opacity={0.08} />
      </mesh>
      
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.8, 1.2, 8]} />
        <meshStandardMaterial color="#2a6a9e" roughness={0.3} metalness={0.2} emissive="#113355" emissiveIntensity={0.3} />
      </mesh>
      
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.65, 24, 24]} />
        <meshStandardMaterial color="#7fc3ff" roughness={0.2} metalness={0.1} emissive="#2277cc" emissiveIntensity={0.15} />
      </mesh>
      
      <mesh position={[0, 1.2, 0.55]}>
        <torusGeometry args={[0.35, 0.07, 12, 24]} />
        <meshStandardMaterial color="#66ddff" emissive="#44aaff" emissiveIntensity={0.8} />
      </mesh>
      
      <mesh position={[0, 1.05, 0.5]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.2, 0.04, 8, 16]} />
        <meshStandardMaterial color="#88eeff" emissive="#66ccff" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff8844" emissive="#ff6633" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
        <meshStandardMaterial color="#88bbdd" />
      </mesh>
    </group>
  );
}

// --- 3D Scene ---
function Scene3D() {
  return (
    <>
      <Stars radius={8} depth={50} count={300} factor={3} saturation={0.4} fade />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, 3]} intensity={0.4} color="#7799ff" />
      <pointLight position={[1, 3, 2]} intensity={0.3} color="#88ccff" />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <circleGeometry args={[3.5, 20]} />
        <meshStandardMaterial color="#1b3347" transparent opacity={0.3} />
      </mesh>
      
      <TravelAvatar />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 3}
        target={[0, 0.7, 0]}
      />
    </>
  );
}

// --- Map Component ---
function TravelMap({ destinations, selectedDestination }) {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map && selectedDestination) {
      map.flyTo([selectedDestination.lat, selectedDestination.lng], 10, {
        duration: 2
      });
    }
  }, [map, selectedDestination]);

  const defaultDestinations = [
    { id: 1, name: 'Paris, France', lat: 48.8566, lng: 2.3522, description: 'City of Love', rating: 4.8 },
    { id: 2, name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, description: 'Tech meets Tradition', rating: 4.9 },
    { id: 3, name: 'New York, USA', lat: 40.7128, lng: -74.0060, description: 'The Big Apple', rating: 4.7 },
    { id: 4, name: 'Bali, Indonesia', lat: -8.3405, lng: 115.0920, description: 'Island Paradise', rating: 4.8 },
    { id: 5, name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, description: 'Modern Luxury', rating: 4.6 },
    { id: 6, name: 'Rome, Italy', lat: 41.9028, lng: 12.4964, description: 'Eternal City', rating: 4.9 },
    { id: 7, name: 'Maasai Mara, Kenya', lat: -1.5, lng: 35.0, description: 'Great Migration Safari', rating: 4.9 },
    { id: 8, name: 'Serengeti, Tanzania', lat: -2.3, lng: 34.8, description: 'Wildlife Paradise', rating: 4.9 },
    { id: 9, name: 'Ngorongoro, Tanzania', lat: -3.2, lng: 35.5, description: 'Volcanic Crater Safari', rating: 4.8 },
  ];

  const displayDestinations = destinations && destinations.length > 0 ? destinations : defaultDestinations;

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
      ref={setMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {displayDestinations.map((dest) => (
        <Marker key={dest.id} position={[dest.lat, dest.lng]}>
          <Popup>
            <div style={{ color: '#0b1a2e' }}>
              <strong>{dest.name}</strong>
              <p>{dest.description}</p>
              <p>⭐ {dest.rating} / 5.0</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

// --- Auth Modal ---
function AuthModal({ isOpen, onClose, onLogin, onRegister, onResetPassword }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const success = await onLogin(email, password);
      if (success) {
        onClose();
        setEmail('');
        setPassword('');
      } else {
        setError('Invalid email or password');
      }
    } else {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      const success = await onRegister(name, email, password);
      if (success) {
        onClose();
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
      } else {
        setError('Registration failed. Email may already exist.');
      }
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await onResetPassword(email);
    if (success) {
      setShowReset(false);
      setError('Password reset email sent! Check your inbox.');
    } else {
      setError('Failed to send reset email. Please try again.');
    }
    setLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className="auth-header">
          <FontAwesomeIcon icon={faCompass} className="auth-logo" />
          <h2>{showReset ? 'Reset Password' : isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
          <p>{showReset ? 'Enter your email to reset password' : isLogin ? 'Sign in to continue your travels' : 'Start your journey with Wanderly'}</p>
        </div>

        {showReset ? (
          <form onSubmit={handleReset} className="auth-form">
            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
            <button 
              type="button" 
              className="auth-switch-btn"
              onClick={() => setShowReset(false)}
            >
              Back to Sign In
            </button>
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
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {!isLogin && (
              <div className="auth-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required={!isLogin}
                />
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {isLogin && (
              <button 
                type="button" 
                className="auth-switch-btn"
                onClick={() => setShowReset(true)}
              >
                Forgot Password?
              </button>
            )}
          </form>
        )}

        {!showReset && (
          <div className="auth-switch">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                {isLogin ? ' Sign Up' : ' Sign In'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- User Profile Component ---
function UserProfile({ user, onLogout, onUpdateProfile, onClose, userTrips, userBookings }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [preferences, setPreferences] = useState({
    currency: user?.preferences?.currency || 'USD',
    notifications: user?.preferences?.notifications !== false,
    darkMode: user?.preferences?.darkMode || false
  });

  if (!user) return null;

  const handleSave = () => {
    onUpdateProfile({ name, email, preferences });
    setIsEditing(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={handleOverlayClick}>
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
          <span className="profile-plan">
            <FontAwesomeIcon icon={faGem} /> {user.plan || 'Standard'} Plan
          </span>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{user.tripsPlanned || 0}</span>
            <span className="stat-label">Trips Planned</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.destinationsVisited || 0}</span>
            <span className="stat-label">Destinations</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.reviews || 0}</span>
            <span className="stat-label">Reviews</span>
          </div>
        </div>

        <div className="profile-body">
          {isEditing ? (
            <>
              <div className="profile-field">
                <label>Full Name</label>
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
              <div className="profile-field">
                <label>Preferred Currency</label>
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="KES">KES (KSh)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
              <div className="profile-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                  />
                  Enable Notifications
                </label>
              </div>
              <div className="profile-actions">
                <button className="profile-save" onClick={handleSave}>
                  <FontAwesomeIcon icon={faSave} /> Save Changes
                </button>
                <button className="profile-cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">📧 Email</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">💰 Currency</span>
                  <span className="info-value">{user.preferences?.currency || 'USD'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🔔 Notifications</span>
                  <span className="info-value">{user.preferences?.notifications !== false ? '✅ On' : '❌ Off'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">📅 Member Since</span>
                  <span className="info-value">{user.memberSince || 'January 2024'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🎯 Plan</span>
                  <span className="info-value">{user.plan || 'Standard'}</span>
                </div>
              </div>
              
              {userTrips && userTrips.length > 0 && (
                <div className="profile-section">
                  <h4>Recent Trips</h4>
                  {userTrips.slice(0, 3).map((trip) => (
                    <div key={trip.id} className="profile-trip-item">
                      <span>✈️ {trip.destination}</span>
                      <span>{trip.days} days</span>
                    </div>
                  ))}
                </div>
              )}

              {userBookings && userBookings.length > 0 && (
                <div className="profile-section">
                  <h4>Recent Safari Bookings</h4>
                  {userBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="profile-trip-item">
                      <span>🦁 {booking.packageName}</span>
                      <span className={`status-${booking.status}`}>{booking.status}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="profile-actions">
                <button className="profile-edit" onClick={() => setIsEditing(true)}>
                  <FontAwesomeIcon icon={faEdit} /> Edit Profile
                </button>
                <button className="profile-logout" onClick={onLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sidebar Component ---
function Sidebar({ isOpen, onToggle, activeTab, setActiveTab, chatHistory, loadChatHistory, clearChatHistory, userTrips, userBookings, user }) {
  return (
    <>
      {/* Toggle Button */}
      <button 
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: isOpen ? '320px' : '1.5rem',
          zIndex: 100,
          background: 'rgba(27, 47, 68, 0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          color: '#b6d9ff',
          cursor: 'pointer',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        <FontAwesomeIcon icon={isOpen ? faChevronLeft : faBars} />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{
        position: 'fixed',
        top: 0,
        left: isOpen ? '0' : '-320px',
        width: '320px',
        height: '100vh',
        background: 'rgba(11, 26, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        transition: 'left 0.3s ease',
        zIndex: 99,
        padding: '5rem 1rem 2rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="sidebar-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <h3 style={{ color: '#f0f7fe', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FontAwesomeIcon icon={faHistory} style={{ color: '#6fc3ff' }} /> History
          </h3>
          {chatHistory.length > 0 && (
            <button 
              className="sidebar-clear" 
              onClick={clearChatHistory}
              style={{
                background: 'rgba(255,68,68,0.1)',
                border: '1px solid rgba(255,68,68,0.2)',
                borderRadius: '20px',
                padding: '0.3rem 0.8rem',
                color: '#ff6b6b',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.3s'
              }}
            >
              <FontAwesomeIcon icon={faTrash} /> Clear
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="sidebar-tabs" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.3rem',
          marginBottom: '1.5rem',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          padding: '0.3rem'
        }}>
          <button 
            className={`sidebar-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '0.6rem',
              border: 'none',
              borderRadius: '10px',
              background: activeTab === 'chat' ? 'rgba(111, 195, 255, 0.15)' : 'transparent',
              color: activeTab === 'chat' ? '#6fc3ff' : '#8bb3da',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <FontAwesomeIcon icon={faCommentDots} /> Chats
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
            style={{
              padding: '0.6rem',
              border: 'none',
              borderRadius: '10px',
              background: activeTab === 'trips' ? 'rgba(111, 195, 255, 0.15)' : 'transparent',
              color: activeTab === 'trips' ? '#6fc3ff' : '#8bb3da',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <FontAwesomeIcon icon={faRoute} /> Trips
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '0.6rem',
              border: 'none',
              borderRadius: '10px',
              background: activeTab === 'bookings' ? 'rgba(111, 195, 255, 0.15)' : 'transparent',
              color: activeTab === 'bookings' ? '#6fc3ff' : '#8bb3da',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <FontAwesomeIcon icon={faTicket} /> Bookings
          </button>
        </div>

        {/* Content */}
        <div className="sidebar-content" style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'chat' && (
            <>
              {chatHistory.length === 0 ? (
                <div className="sidebar-empty" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: '#8bb3da'
                }}>
                  <FontAwesomeIcon icon={faCommentDots} style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '1rem' }}>No chat history yet</p>
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Start a conversation!</span>
                </div>
              ) : (
                chatHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="sidebar-item"
                    onClick={() => loadChatHistory(item)}
                    style={{
                      padding: '0.8rem',
                      marginBottom: '0.5rem',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      gap: '0.8rem',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(111, 195, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                    }}
                  >
                    <div className="sidebar-item-icon" style={{ color: '#6fc3ff' }}>
                      <FontAwesomeIcon icon={faClockRotateLeft} />
                    </div>
                    <div className="sidebar-item-content" style={{ flex: 1 }}>
                      <div className="sidebar-item-title" style={{ color: '#f0f7fe', fontSize: '0.8rem', fontWeight: '500' }}>
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="sidebar-item-preview" style={{ color: '#8bb3da', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        {item.preview}
                      </div>
                      <div className="sidebar-item-meta" style={{ color: '#5a7a9a', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                        {item.messages.length} messages
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'trips' && (
            <>
              {!user ? (
                <div className="sidebar-empty" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: '#8bb3da'
                }}>
                  <FontAwesomeIcon icon={faUser} style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '1rem' }}>Sign in to see your trips</p>
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Login to save and view your trips</span>
                </div>
              ) : userTrips.length === 0 ? (
                <div className="sidebar-empty" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: '#8bb3da'
                }}>
                  <FontAwesomeIcon icon={faRoute} style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '1rem' }}>No trips planned yet</p>
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Ask "Plan a trip to [destination]"</span>
                </div>
              ) : (
                userTrips.map((trip) => (
                  <div key={trip.id} className="sidebar-item" style={{
                    padding: '0.8rem',
                    marginBottom: '0.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.03)',
                    display: 'flex',
                    gap: '0.8rem',
                    alignItems: 'center'
                  }}>
                    <div className="sidebar-item-icon" style={{ color: '#6fc3ff' }}>
                      <FontAwesomeIcon icon={faMapPin} />
                    </div>
                    <div className="sidebar-item-content" style={{ flex: 1 }}>
                      <div className="sidebar-item-title" style={{ color: '#f0f7fe', fontSize: '0.9rem', fontWeight: '500' }}>
                        ✈️ {trip.destination}
                      </div>
                      <div className="sidebar-item-preview" style={{ color: '#8bb3da', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        {trip.days} days • {trip.attractions?.slice(0, 2).join(', ')}
                      </div>
                      <div className="sidebar-item-meta" style={{ color: '#5a7a9a', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                        {trip.bestTime || 'Plan your trip'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'bookings' && (
            <>
              {!user ? (
                <div className="sidebar-empty" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: '#8bb3da'
                }}>
                  <FontAwesomeIcon icon={faUser} style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '1rem' }}>Sign in to see your bookings</p>
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Login to view your safari bookings</span>
                </div>
              ) : userBookings.length === 0 ? (
                <div className="sidebar-empty" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: '#8bb3da'
                }}>
                  <FontAwesomeIcon icon={faTicket} style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '1rem' }}>No bookings yet</p>
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Book a safari with Trawell Safaris!</span>
                </div>
              ) : (
                userBookings.map((booking) => (
                  <div key={booking.id} className="sidebar-item" style={{
                    padding: '0.8rem',
                    marginBottom: '0.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.03)',
                    display: 'flex',
                    gap: '0.8rem',
                    alignItems: 'center'
                  }}>
                    <div className="sidebar-item-icon" style={{ color: '#f5c542' }}>
                      <FontAwesomeIcon icon={faTicket} />
                    </div>
                    <div className="sidebar-item-content" style={{ flex: 1 }}>
                      <div className="sidebar-item-title" style={{ color: '#f0f7fe', fontSize: '0.9rem', fontWeight: '500' }}>
                        🦁 {booking.packageName}
                      </div>
                      <div className="sidebar-item-preview" style={{ color: '#8bb3da', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        {booking.price} • {booking.days}
                      </div>
                      <div className="sidebar-item-meta" style={{ marginTop: '0.2rem' }}>
                        <span className={`status-${booking.status}`} style={{
                          color: booking.status === 'confirmed' ? '#3eff9e' : 
                                 booking.status === 'pending' ? '#f5c542' : '#ff6b6b',
                          fontSize: '0.7rem',
                          fontWeight: '500'
                        }}>
                          {booking.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// --- Safari Packages Data (from Firestore) ---
const safariPackages = {
  'budget': {
    id: 'budget',
    name: 'Budget Camping Safari',
    price: '$1,200',
    priceValue: 1200,
    days: '4 days',
    includes: ['Camping accommodation', 'Shared safari vehicle', 'All meals', 'Park fees', 'Local guide'],
    destinations: ['Maasai Mara', 'Lake Nakuru'],
    bestTime: 'June-October',
    activities: ['Game drives', 'Bird watching', 'Cultural visits'],
    image: '🏕️'
  },
  'mid': {
    id: 'mid',
    name: 'Mid-Range Lodge Safari',
    price: '$2,800',
    priceValue: 2800,
    days: '6 days',
    includes: ['Comfortable lodges', 'Private 4x4 vehicle', 'All meals', 'Park fees', 'Guided walks'],
    destinations: ['Maasai Mara', 'Serengeti', 'Ngorongoro Crater'],
    bestTime: 'June-October, December-February',
    activities: ['Game drives', 'Hot air balloons', 'Walking safaris', 'Cultural tours'],
    image: '🏨'
  },
  'luxury': {
    id: 'luxury',
    name: 'Luxury Safari Experience',
    price: '$6,500+',
    priceValue: 6500,
    days: '8 days',
    includes: ['5-star lodges', 'Private charter flights', 'Fine dining', 'Personal butler', 'Spa services'],
    destinations: ['Maasai Mara', 'Serengeti', 'Ngorongoro', 'Zanzibar'],
    bestTime: 'Year-round',
    activities: ['Private game drives', 'Helicopter tours', 'Hot air balloons', 'Gourmet bush dinners'],
    image: '👑'
  }
};

// --- Travel Data ---
const travelData = {
  'paris': {
    name: 'Paris, France',
    lat: 48.8566,
    lng: 2.3522,
    description: 'City of Love & World-Class Art',
    attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
    bestTime: 'April-June, September-October',
    currency: 'Euro (€)',
    language: 'French',
    rating: 4.8,
    priceRange: 'Luxury',
    activities: ['Museum tours', 'Wine tasting', 'River cruises', 'Shopping'],
    visaRequired: 'Schengen Visa',
    weather: 'Mild, occasional rain'
  },
  'bali': {
    name: 'Bali, Indonesia',
    lat: -8.3405,
    lng: 115.0920,
    description: 'Island Paradise & Spiritual Retreat',
    attractions: ['Ubud Monkey Forest', 'Tanah Lot Temple', 'Mount Batur', 'Kuta Beach'],
    bestTime: 'April-October',
    currency: 'Indonesian Rupiah (IDR)',
    language: 'Indonesian',
    rating: 4.8,
    priceRange: 'Affordable',
    activities: ['Yoga retreats', 'Surfing', 'Temple visits', 'Rice field walks'],
    visaRequired: 'Visa on Arrival',
    weather: 'Tropical, warm year-round'
  },
  'tokyo': {
    name: 'Tokyo, Japan',
    lat: 35.6762,
    lng: 139.6503,
    description: 'Where Tradition Meets Innovation',
    attractions: ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Tower', 'Akihabara'],
    bestTime: 'March-May, October-November',
    currency: 'Japanese Yen (¥)',
    language: 'Japanese',
    rating: 4.9,
    priceRange: 'Premium',
    activities: ['Sushi making', 'Temple visits', 'Shopping', 'Sumo watching'],
    visaRequired: 'Visa-free for 90 days',
    weather: 'Four distinct seasons'
  },
  'maasai mara': {
    name: 'Maasai Mara, Kenya',
    lat: -1.5,
    lng: 35.0,
    description: 'Home of the Great Migration & Big Five',
    attractions: ['Great Migration', 'Big Five Safaris', 'Maasai Village Tours', 'Hot Air Balloon Safaris'],
    bestTime: 'June-October, December-February',
    currency: 'Kenyan Shilling (KES)',
    language: 'English, Swahili',
    rating: 4.9,
    priceRange: 'Mid to Luxury',
    activities: ['Game drives', 'Balloon safaris', 'Cultural tours', 'Photography safaris'],
    visaRequired: 'Visa on Arrival (many countries)',
    weather: 'Warm days, cool nights'
  },
  'serengeti': {
    name: 'Serengeti, Tanzania',
    lat: -2.3,
    lng: 34.8,
    description: 'Unlimited Wildlife & Endless Plains',
    attractions: ['Great Migration', 'Big Five Safaris', 'River Crossings', 'Ngorongoro Crater'],
    bestTime: 'June-October, January-March',
    currency: 'Tanzanian Shilling (TZS)',
    language: 'English, Swahili',
    rating: 4.9,
    priceRange: 'Mid to Luxury',
    activities: ['Game drives', 'River crossings viewing', 'Walking safaris', 'Photography tours'],
    visaRequired: 'Visa on Arrival (many countries)',
    weather: 'Warm days, cool nights'
  },
  'new york': {
    name: 'New York, USA',
    lat: 40.7128,
    lng: -74.0060,
    description: 'The Energy of the Big Apple',
    attractions: ['Statue of Liberty', 'Central Park', 'Times Square', 'Broadway'],
    bestTime: 'April-June, September-November',
    currency: 'US Dollar ($)',
    language: 'English',
    rating: 4.7,
    priceRange: 'High-End',
    activities: ['Broadway shows', 'Museum visits', 'Shopping', 'Food tours'],
    visaRequired: 'ESTA / US Visa',
    weather: 'Cold winters, warm summers'
  },
  'dubai': {
    name: 'Dubai, UAE',
    lat: 25.2048,
    lng: 55.2708,
    description: 'The Epitome of Modern Luxury',
    attractions: ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Mall', 'Desert Safari'],
    bestTime: 'November-March',
    currency: 'UAE Dirham (AED)',
    language: 'Arabic, English',
    rating: 4.6,
    priceRange: 'Ultra-Luxury',
    activities: ['Desert safaris', 'Yacht cruises', 'Shopping', 'Fine dining'],
    visaRequired: 'Visa on Arrival',
    weather: 'Hot desert climate'
  },
  'rome': {
    name: 'Rome, Italy',
    lat: 41.9028,
    lng: 12.4964,
    description: 'Eternal City of History & Romance',
    attractions: ['Colosseum', 'Vatican City', 'Trevi Fountain', 'Pantheon'],
    bestTime: 'April-June, September-October',
    currency: 'Euro (€)',
    language: 'Italian',
    rating: 4.9,
    priceRange: 'Luxury',
    activities: ['Ancient ruins tours', 'Pasta making', 'Vatican visits', 'Shopping'],
    visaRequired: 'Schengen Visa',
    weather: 'Mediterranean climate'
  }
};

// --- MAIN APP ---
function App() {
  // Firebase Auth State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [userBookings, setUserBookings] = useState([]);

  // App State
  const [messages, setMessages] = useState([
    { type: 'bot', content: "🦁 Welcome to Wanderly Travel! I'm your AI travel consultant. Explore the world with us!" },
    { type: 'ai', content: '🌟 I can help with:\n• ✈️ City breaks & beach holidays\n• 🦁 African safaris with Trawell Safaris\n• 🏨 Hotel & flight bookings\n• 📋 Custom itineraries\n• 🛂 Visa assistance\n\nTry: "Plan a safari" or "Tell me about Paris"' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [plan, setPlan] = useState('free');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showChecklist, setShowChecklist] = useState(false);
  const [weather, setWeather] = useState(null);
  const [showSafariPackages, setShowSafariPackages] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState('chat');

  const [checklist, setChecklist] = useState({
    passport: false,
    visa: false,
    flights: false,
    hotels: false,
    insurance: false,
    currency: false,
    adapter: false,
    meds: false,
    copies: false,
    itinerary: false
  });
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const COMPANY_URL = 'https://www.wanderly.com';
  const BOOKING_URL = 'https://www.wanderly.com/book';
  const SAFARI_URL = 'https://www.trawellsafaris.com';
  const SAFARI_BOOKING_URL = 'https://www.trawellsafaris.com/book';

  // --- Save chat history effect ---
  useEffect(() => {
    // Save messages to history when they change
    if (messages.length > 2) {
      const history = messages.filter(msg => msg.type === 'user' || msg.type === 'ai');
      if (history.length > 0) {
        const historyItem = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          messages: history.slice(-6), // Keep last 6 messages
          preview: history[history.length - 1]?.content?.substring(0, 60) || 'Chat'
        };
        setChatHistory(prev => {
          const updated = [historyItem, ...prev].slice(0, 20);
          localStorage.setItem('chatHistory', JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [messages]);

  // --- Firebase Auth Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in - get real data from Firestore
        const { data: profile, error } = await getUserProfile(firebaseUser.uid);
        if (!error && profile) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: profile.name || firebaseUser.displayName || 'Traveler',
            plan: profile.plan || 'free',
            tripsPlanned: profile.tripsPlanned || 0,
            destinationsVisited: profile.destinationsVisited || 0,
            reviews: profile.reviews || 0,
            preferences: profile.preferences || { currency: 'USD', notifications: true, darkMode: true },
            memberSince: profile.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            favorites: profile.favorites || []
          };
          setUser(userData);
          setIsLoggedIn(true);
          setPlan(userData.plan);
          setDarkMode(userData.preferences?.darkMode !== false);
          
          // Load user trips from Firestore
          const { trips } = await getUserTrips(firebaseUser.uid);
          setUserTrips(trips || []);
          
          // Load user safari bookings from Firestore
          const { bookings } = await getUserSafariBookings(firebaseUser.uid);
          setUserBookings(bookings || []);
          
          // Save user to localStorage for persistence
          localStorage.setItem('wanderly_user', JSON.stringify(userData));
        }
      } else {
        // User is signed out - clear all data
        setUser(null);
        setIsLoggedIn(false);
        setUserTrips([]);
        setUserBookings([]);
        localStorage.removeItem('wanderly_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Apply dark mode
  useEffect(() => {
    document.body.style.background = darkMode 
      ? 'linear-gradient(145deg, #0b1a2e 0%, #1b2f44 100%)'
      : 'linear-gradient(145deg, #f0f4f8 0%, #d9e2ec 100%)';
  }, [darkMode]);

  // --- Auth Functions (All use Firebase) ---
  const handleLogin = async (email, password) => {
    const { user: firebaseUser, error } = await loginUser(email, password);
    if (error) {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: `❌ Login failed: ${error}` 
      }]);
      return false;
    }
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: `✅ Welcome back! You are now signed in.` 
    }]);
    return true;
  };

  const handleRegister = async (name, email, password) => {
    const { user: firebaseUser, error } = await registerUser(email, password, name);
    if (error) {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: `❌ Registration failed: ${error}` 
      }]);
      return false;
    }
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: `🎉 Welcome ${name}! Your account has been created successfully.` 
    }]);
    return true;
  };

  const handleLogout = async () => {
    const { error } = await logoutUser();
    if (error) {
      console.error('Logout error:', error);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: `❌ Logout failed: ${error}` 
      }]);
      return;
    }
    setShowProfile(false);
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: '👋 You have been logged out. Come back soon!' 
    }]);
  };

  const handleResetPassword = async (email) => {
    const { error } = await resetPassword(email);
    if (error) {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: `❌ Password reset failed: ${error}` 
      }]);
      return false;
    }
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: '📧 Password reset email sent! Check your inbox.' 
    }]);
    return true;
  };

  const handleUpdateProfile = async (updatedData) => {
    if (!user) return;
    
    const { error } = await updateUserProfile(user.uid, updatedData);
    if (error) {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: `❌ Failed to update profile: ${error}` 
      }]);
      return;
    }
    
    setUser(prev => ({ ...prev, ...updatedData }));
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: '✅ Profile updated successfully!' 
    }]);
  };

  const handlePlanUpgrade = async (newPlan) => {
    if (!user) {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: '🔒 Please sign in to upgrade your plan.' 
      }]);
      setShowAuth(true);
      return;
    }
    
    const { error } = await updateUserPlan(user.uid, newPlan);
    if (error) {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: `❌ Failed to upgrade plan: ${error}` 
      }]);
      return;
    }
    
    setPlan(newPlan);
    setUser(prev => ({ ...prev, plan: newPlan }));
    
    const planNames = { free: 'Standard', basic: 'Premium', pro: 'Luxury' };
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: `🎉 **Upgraded to ${planNames[newPlan]} Plan!**\n\n✅ More features unlocked\n✅ Priority support\n✅ Exclusive safari deals\n🔗 Continue booking: ${BOOKING_URL}` 
    }]);
  };

  // --- Sidebar Functions ---
  const loadChatHistory = (historyItem) => {
    setMessages(prev => {
      // Start with welcome messages
      const welcomeMessages = [
        { type: 'bot', content: "🦁 Welcome back to Wanderly Travel! I'm your AI travel consultant." }
      ];
      // Add the history messages
      return [...welcomeMessages, ...historyItem.messages];
    });
    setActiveTab('chat');
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
    setMessages([
      { type: 'bot', content: "🦁 Welcome to Wanderly Travel! I'm your AI travel consultant. Explore the world with us!" },
      { type: 'ai', content: '🌟 I can help with:\n• ✈️ City breaks & beach holidays\n• 🦁 African safaris with Trawell Safaris\n• 🏨 Hotel & flight bookings\n• 📋 Custom itineraries\n• 🛂 Visa assistance\n\nTry: "Plan a safari" or "Tell me about Paris"' }
    ]);
  };

  // --- Helper Functions ---
  const fetchTravelData = (destination) => {
    const key = Object.keys(travelData).find(k => 
      destination.toLowerCase().includes(k) || k.includes(destination.toLowerCase())
    );
    return key ? travelData[key] : null;
  };

  const addToRecent = (query) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== query);
      return [query, ...filtered].slice(0, 5);
    });
  };

  const toggleChecklist = (item) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const exportItinerary = () => {
    if (!itinerary) return;
    
    const text = `=== WANDERLY TRAVEL ITINERARY ===\n\n` +
      `Destination: ${itinerary.destination}\n` +
      `Duration: ${itinerary.days} days\n\n` +
      `=== HIGHLIGHTS ===\n${itinerary.attractions.map((a, i) => `Day ${i+1}: ${a}`).join('\n')}\n\n` +
      `=== DETAILS ===\n` +
      `Best Time: ${itinerary.bestTime}\n` +
      `Currency: ${itinerary.currency}\n` +
      `Visa: ${itinerary.visa}\n\n` +
      `=== BOOKING ===\n` +
      `Book now: ${BOOKING_URL}\n\n` +
      `Generated by Wanderly Travel AI Assistant`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itinerary.destination}-itinerary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: `📄 Itinerary for ${itinerary.destination} has been downloaded!` 
    }]);
  };

  const getWeather = async (destination) => {
    const destData = fetchTravelData(destination);
    if (!destData) return;
    
    const weatherData = {
      temp: Math.floor(Math.random() * 25 + 10),
      condition: ['☀️ Sunny', '⛅ Partly Cloudy', '🌤️ Mostly Sunny', '🌧️ Light Rain', '❄️ Snow'][Math.floor(Math.random() * 5)],
      humidity: Math.floor(Math.random() * 60 + 30),
      wind: Math.floor(Math.random() * 20 + 5)
    };
    setWeather(weatherData);
    return weatherData;
  };

  const handleQuickAction = (action) => {
    const actions = {
      'flights': 'Book flight to',
      'hotels': 'Find hotel in',
      'visa': 'Visa for',
      'itinerary': 'Plan a trip to',
      'safari': 'Plan a safari to',
      'map': 'Show map'
    };
    setInputValue(actions[action] + ' ');
    document.querySelector('.chat-input-area input')?.focus();
  };

  const handleSafariBooking = (packageId) => {
    const pkg = safariPackages[packageId];
    if (pkg) {
      setShowSafariPackages(true);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: `🦁 **${pkg.name}**\n\n` +
          `💰 Price: ${pkg.price}\n` +
          `📅 Duration: ${pkg.days}\n` +
          `📍 Destinations: ${pkg.destinations.join(', ')}\n` +
          `📅 Best Time: ${pkg.bestTime}\n\n` +
          `✅ **Includes:**\n${pkg.includes.map(item => `• ${item}`).join('\n')}\n\n` +
          `🎯 **Activities:**\n${pkg.activities.map(item => `• ${item}`).join('\n')}\n\n` +
          `🔗 **Book this safari:** ${SAFARI_BOOKING_URL}\n\n` +
          `💡 This safari is proudly offered by Trawell Safaris - Africa's Safari Experts! 🐘` 
      }]);
    }
  };

  const handleSend = (forcedInput = null) => {
    const userMsg = (forcedInput || inputValue).trim();
    if (!userMsg) return;
    
    addToRecent(userMsg);
    setMessages(prev => [...prev, { type: 'user', content: userMsg }]);
    if (!forcedInput) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let response = '';
      let destData = null;
      let destKey = null;

      for (const [key, data] of Object.entries(travelData)) {
        if (lower.includes(key) || key.split(' ').some(word => lower.includes(word))) {
          destData = data;
          destKey = key;
          break;
        }
      }

      if (destData) {
        setDestinations([{ 
          id: 1, 
          name: destData.name, 
          lat: destData.lat, 
          lng: destData.lng,
          description: destData.description,
          rating: destData.rating
        }]);
        setSelectedDestination({ lat: destData.lat, lng: destData.lng });
        setShowMap(true);
        getWeather(destKey);
      }

      // --- Handle different queries ---
      if (lower.includes('login') || lower.includes('sign in')) {
        setShowAuth(true);
        response = `🔐 Opening login window...\n\nPlease sign in to access all features including:\n• Save itineraries\n• Book safaris\n• Track your trips\n• Get personalized recommendations`;
      }
      else if (lower.includes('sign up') || lower.includes('register') || lower.includes('create account')) {
        setShowAuth(true);
        response = `📝 Opening registration window...\n\nCreate your free account to start planning your dream trips! ✈️🌍`;
      }
      else if (lower.includes('profile') || lower.includes('account') || lower.includes('settings')) {
        if (isLoggedIn) {
          setShowProfile(true);
          response = `👤 Opening your profile...\n\nYou can view and edit your account settings there.`;
        } else {
          response = `🔒 You're not signed in. Click the user icon in the top right or say "Login" to get started!`;
        }
      }
      else if (lower.includes('safari') || lower.includes('trawell') || lower.includes('wildlife') || lower.includes('animal')) {
        if (lower.includes('budget')) {
          handleSafariBooking('budget');
          setIsTyping(false);
          return;
        } else if (lower.includes('mid') || lower.includes('mid-range')) {
          handleSafariBooking('mid');
          setIsTyping(false);
          return;
        } else if (lower.includes('luxury') || lower.includes('premium')) {
          handleSafariBooking('luxury');
          setIsTyping(false);
          return;
        }
        
        response = `🦁 **African Safari Experiences with Trawell Safaris**\n\n`;
        response += `🌍 **Safari Packages:**\n\n`;
        response += `1️⃣ **Budget Camping Safari** - $1,200 (4 days)\n`;
        response += `   • Maasai Mara & Lake Nakuru\n`;
        response += `   • Camping & shared vehicles\n\n`;
        response += `2️⃣ **Mid-Range Lodge Safari** - $2,800 (6 days)\n`;
        response += `   • Maasai Mara, Serengeti & Ngorongoro\n`;
        response += `   • Comfortable lodges & private vehicles\n\n`;
        response += `3️⃣ **Luxury Safari Experience** - $6,500+ (8 days)\n`;
        response += `   • Maasai Mara, Serengeti, Zanzibar\n`;
        response += `   • 5-star lodges & private charters\n\n`;
        response += `🎯 **Try:** "Budget safari" or "Luxury safari"\n`;
        response += `🔗 **Book with Trawell Safaris:** ${SAFARI_BOOKING_URL}`;
        
        setShowSafariPackages(true);
      }
      else if (lower.includes('weather') || lower.includes('temperature')) {
        if (destData) {
          const weatherInfo = weather || { temp: 22, condition: '☀️ Sunny', humidity: 45, wind: 10 };
          response = `🌤️ **Weather in ${destData.name}**\n\n`;
          response += `🌡️ Temperature: ${weatherInfo.temp}°C\n`;
          response += `☁️ Condition: ${weatherInfo.condition}\n`;
          response += `💧 Humidity: ${weatherInfo.humidity}%\n`;
          response += `💨 Wind: ${weatherInfo.wind} km/h\n\n`;
          response += `📅 Best Time: ${destData.bestTime}`;
        } else {
          response = `🌤️ **Weather Service**\n\nPlease specify a destination (e.g., "Weather in Paris")`;
        }
      }
      else if (lower.includes('book') || lower.includes('booking')) {
        response = `📋 **Ready to Book Your Trip?**\n\n✈️ **Flights**: ${BOOKING_URL}/flights\n🏨 **Hotels**: ${BOOKING_URL}/hotels\n🦁 **Safaris**: ${SAFARI_BOOKING_URL}\n🌍 **Packages**: ${BOOKING_URL}/packages\n🛂 **Visa**: ${BOOKING_URL}/visa\n\n💡 Tell me a destination or "Plan a safari" for more info!`;
      }
      else if (lower.includes('itinerary') || lower.includes('plan') || lower.includes('trip')) {
        if (destData) {
          const days = plan === 'pro' ? 5 : plan === 'basic' ? 4 : 3;
          response = `📋 **${days}-Day ${destData.name} Itinerary**\n\n`;
          response += `🌟 **Highlights**\n`;
          destData.attractions.slice(0, days).forEach((attraction, i) => {
            response += `Day ${i+1}: ${attraction}\n`;
          });
          response += `\n📅 **Best Time**: ${destData.bestTime}\n`;
          response += `💰 **Currency**: ${destData.currency}\n`;
          response += `🛂 **Visa**: ${destData.visaRequired}\n`;
          response += `🌤️ **Weather**: ${destData.weather}\n\n`;
          
          if (lower.includes('safari')) {
            response += `🦁 **Safari Option**: Add a safari extension with Trawell Safaris!\n`;
            response += `🔗 ${SAFARI_URL}\n\n`;
          }
          
          response += `🔗 **Book now**: ${BOOKING_URL}`;
          
          setItinerary({
            destination: destData.name,
            days: days,
            attractions: destData.attractions,
            bestTime: destData.bestTime,
            currency: destData.currency,
            visa: destData.visaRequired
          });
          
          // Save trip to Firestore if user is logged in
          if (isLoggedIn && user) {
            saveTrip(user.uid, {
              destination: destData.name,
              days: days,
              attractions: destData.attractions,
              bestTime: destData.bestTime,
              currency: destData.currency,
              visa: destData.visaRequired
            });
          }
        } else {
          response = `🌍 **Let's Plan Your Trip!**\n\nI can help with:\n• 🏙️ Cities: Paris, Tokyo, New York, Rome\n• 🏝️ Beaches: Bali, Zanzibar\n• 🦁 Safaris: Maasai Mara, Serengeti\n• 🌆 Luxury: Dubai\n\n💡 Tell me which destination or "Plan a safari"!`;
        }
      }
      else if (lower.includes('visa') || lower.includes('passport')) {
        if (destData) {
          response = `🛂 **Visa for ${destData.name}**\n\n`;
          response += `📋 **Type**: ${destData.visaRequired}\n`;
          response += `⏰ **Processing**: ${plan === 'pro' ? '24-48 hours (express)' : '5-10 business days'}\n`;
          response += `📄 **Documents**:\n• Valid passport (6 months validity)\n• 2 passport photos\n• Hotel booking\n• Flight itinerary\n• Bank statements\n\n🔗 Apply: ${BOOKING_URL}/visa`;
        } else {
          response = `🛂 **Visa Services**\n\nI can help with visa requirements for any destination.\n\n📍 Specify a destination (e.g., "Visa for Kenya")\n🔗 ${BOOKING_URL}/visa`;
        }
      }
      else if (lower.includes('checklist') || lower.includes('pack')) {
        setShowChecklist(true);
        response = `✅ **Travel Checklist**\n\nI've opened your pre-trip checklist!\n\n📋 Check off items as you prepare:\n• Passport\n• Visa\n• Flights\n• Hotels\n• Insurance\n• Currency\n• Adapter\n• Medications\n• Document copies\n• Itinerary\n\n💡 Get organized before you go!`;
      }
      else if (lower.includes('export') || lower.includes('download')) {
        if (itinerary) {
          exportItinerary();
          return;
        } else {
          response = `📄 **Export Itinerary**\n\nPlease create an itinerary first by asking "Plan a trip to [destination]"`;
        }
      }
      else if (lower.includes('trawell')) {
        response = `🦁 **Trawell Safaris - Africa's Safari Experts**\n\n`;
        response += `🌍 **About Us**\n`;
        response += `Trawell Safaris is a premier African safari operator specializing in unforgettable wildlife experiences.\n\n`;
        response += `🏆 **Why Choose Trawell?**\n`;
        response += `• 15+ years of safari experience\n`;
        response += `• Expert local guides\n`;
        response += `• Customized safari packages\n`;
        response += `• Sustainable tourism practices\n`;
        response += `• 5-star customer reviews\n\n`;
        response += `📍 **Destinations**\n`;
        response += `• Kenya: Maasai Mara, Amboseli, Samburu\n`;
        response += `• Tanzania: Serengeti, Ngorongoro, Tarangire\n`;
        response += `• Uganda: Gorilla Trekking\n`;
        response += `• Rwanda: Gorilla Trekking\n\n`;
        response += `🔗 **Website**: ${SAFARI_URL}\n`;
        response += `📞 **Contact**: +254 700 123 456`;
      }
      else if (destData) {
        response = `📍 **${destData.name}**\n\n${destData.description}\n\n⭐ Rating: ${destData.rating}/5.0\n💰 Price: ${destData.priceRange}\n📅 Best Time: ${destData.bestTime}\n🛂 Visa: ${destData.visaRequired}\n💵 Currency: ${destData.currency}\n🗣️ Language: ${destData.language}\n🌤️ Weather: ${destData.weather}\n\n🏛️ **Top Attractions**\n${destData.attractions.map(a => `• ${a}`).join('\n')}\n\n🎯 **Activities**\n${destData.activities.map(a => `• ${a}`).join('\n')}\n\n🔗 **Book now**: ${BOOKING_URL}`;
        
        if (destKey === 'maasai mara' || destKey === 'serengeti') {
          response += `\n\n🦁 **Safari Tip**: Enhance your experience with a hot air balloon safari over the plains!\n`;
          response += `🔗 Book with Trawell Safaris: ${SAFARI_URL}`;
        }
      }
      else {
        response = `🌍 **How can I help you travel better?**\n\n✈️ **Try these commands:**\n\n• "Tell me about Paris" - Destination info\n• "Plan a trip to Bali" - Itinerary\n• "Plan a safari" - Safari packages\n• "Budget safari" - View budget safari\n• "Luxury safari" - View luxury safari\n• "Visa for Kenya" - Visa requirements\n• "Weather in Tokyo" - Weather info\n• "Travel checklist" - Pre-trip planning\n• "Trawell Safaris" - About safari partner\n\n🔗 **Start booking**: ${BOOKING_URL}\n🦁 **Safaris**: ${SAFARI_URL}\n\n👤 **Account**: Say "Login" or "Sign up" to create your account!`;
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'ai', content: response }]);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.abort();
      setIsListening(false);
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: '🔊 Voice recognition not supported. Please use Chrome or Edge.' 
      }]);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (user) {
      const updatedUser = { 
        ...user, 
        preferences: { ...user.preferences, darkMode: !darkMode }
      };
      setUser(updatedUser);
      updateUserProfile(user.uid, { preferences: updatedUser.preferences });
    }
  };

  // Voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          setInputValue(transcript);
          handleSend(transcript);
          setIsListening(false);
        } else {
          setInputValue(transcript);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0b1a2e',
        color: '#6fc3ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <FontAwesomeIcon icon={faCompass} style={{ fontSize: '3rem', marginBottom: '1rem' }} />
          <h2>Loading Wanderly...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        chatHistory={chatHistory}
        loadChatHistory={loadChatHistory}
        clearChatHistory={clearChatHistory}
        userTrips={userTrips}
        userBookings={userBookings}
        user={user}
      />
      
      <div className="glass-card" style={{
        marginLeft: sidebarOpen ? '340px' : '20px',
        transition: 'margin-left 0.3s ease',
        padding: '20px',
        minHeight: '100vh'
      }}>
        <header className="header">
          <div className="logo">
            <FontAwesomeIcon icon={faCompass} className="logo-icon" />
            <h1>Wanderly Travel</h1>
            <span className="badge"><FontAwesomeIcon icon={faRobot} /> AI Assistant</span>
          </div>
          <div className="header-stats" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <button
              onClick={toggleDarkMode}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                color: '#b6d9ff',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Toggle Theme"
            >
              <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
            </button>
            
            <button
              onClick={() => {
                if (isLoggedIn) {
                  setShowProfile(true);
                } else {
                  setShowAuth(true);
                }
              }}
              style={{
                background: isLoggedIn ? 'rgba(111, 195, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(111, 195, 255, 0.2)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: isLoggedIn ? '#6fc3ff' : '#b6d9ff',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                position: 'relative'
              }}
              title={isLoggedIn ? 'View Profile' : 'Sign In'}
            >
              <FontAwesomeIcon icon={isLoggedIn ? faUser : faSignInAlt} />
              {isLoggedIn && (
                <span style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                  background: '#3eff9e',
                  borderRadius: '50%',
                  border: '2px solid #0b1a2e'
                }} />
              )}
            </button>

            {isLoggedIn && (
              <span style={{ color: '#8bb3da', fontSize: '0.8rem' }}>
                👋 {user?.name}
              </span>
            )}

            <a 
              href={BOOKING_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#6fc3ff', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(111, 195, 255, 0.1)',
                borderRadius: '30px',
                border: '1px solid rgba(111, 195, 255, 0.2)',
                transition: 'all 0.3s',
                fontSize: '0.9rem'
              }}
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} /> Book Now
            </a>
          </div>
        </header>

        <div className="grid-2col">
          <div className="avatar-3d-box">
            <div className="canvas-wrapper">
              <Canvas shadows camera={{ position: [3, 2, 6], fov: 45 }}>
                <Scene3D />
              </Canvas>
            </div>
            <div className="avatar-caption">
              <span><span className="status-dot"></span> AI Travel Guide</span>
              <span><FontAwesomeIcon icon={faHeadset} /> 24/7 Support</span>
              <span><FontAwesomeIcon icon={faShieldAlt} /> Secure</span>
            </div>
            <div className="avatar-stats">
              <span><FontAwesomeIcon icon={faRoute} /> 1.2k itineraries</span>
              <span><FontAwesomeIcon icon={faUsers} /> 8.4k travelers</span>
              <span><FontAwesomeIcon icon={faStar} /> 4.9 rating</span>
            </div>
          </div>

          <div className="chat-panel">
            <div className="chat-header">
              <h3><FontAwesomeIcon icon={faCommentDots} /> Travel Consultation</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  onClick={toggleVoice}
                  style={{
                    background: isListening ? '#ff4444' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: '35px',
                    height: '35px',
                    color: isListening ? 'white' : '#b6d9ff',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem'
                  }}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  <FontAwesomeIcon icon={isListening ? faMicrophoneSlash : faMicrophone} />
                </button>
                <span className="tier-tag">
                  <FontAwesomeIcon icon={faGem} /> {plan === 'free' ? 'Standard' : plan === 'basic' ? 'Premium' : 'Luxury'}
                </span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`msg msg-${msg.type}`}>
                  {msg.type === 'bot' && <FontAwesomeIcon icon={faRobot} style={{marginRight: '8px'}} />}
                  {msg.type === 'ai' && <FontAwesomeIcon icon={faMapSigns} style={{marginRight: '8px'}} />}
                  {msg.content.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              ))}
              {isTyping && (
                <div className="msg msg-ai">
                  <span className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <input 
                type="text" 
                placeholder={isListening ? "🎤 Listening..." : "Ask about destinations, safaris, itineraries..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                style={isListening ? { borderColor: '#ff4444', boxShadow: '0 0 16px rgba(255,68,68,0.3)' } : {}}
              />
              <button onClick={() => handleSend()}>
                <FontAwesomeIcon icon={faPaperPlane} /> Send
              </button>
            </div>

            <div className="quick-actions">
              <button onClick={() => handleQuickAction('flights')}><FontAwesomeIcon icon={faPlane} /> Flights</button>
              <button onClick={() => handleQuickAction('hotels')}><FontAwesomeIcon icon={faHotel} /> Hotels</button>
              <button onClick={() => handleQuickAction('safari')}><FontAwesomeIcon icon={faPaw} /> Safari</button>
              <button onClick={() => handleQuickAction('itinerary')}><FontAwesomeIcon icon={faRoute} /> Plan</button>
              <button onClick={() => setShowChecklist(!showChecklist)}><FontAwesomeIcon icon={faClipboard} /> Checklist</button>
            </div>

            <div className="quick-suggestions">
              {recentSearches.map((search, idx) => (
                <span key={idx} onClick={() => { setInputValue(search); handleSend(search); }}>
                  🔄 {search}
                </span>
              ))}
              <span onClick={() => { setInputValue('Tell me about Paris'); handleSend('Tell me about Paris'); }}>
                <FontAwesomeIcon icon={faUmbrellaBeach} /> Paris
              </span>
              <span onClick={() => { setInputValue('Plan a safari'); handleSend('Plan a safari'); }}>
                🦁 Safari
              </span>
              <span onClick={() => { setInputValue('Budget safari'); handleSend('Budget safari'); }}>
                <FontAwesomeIcon icon={faCampground} /> Budget Safari
              </span>
              <span onClick={() => { setInputValue('Luxury safari'); handleSend('Luxury safari'); }}>
                <FontAwesomeIcon icon={faGem} /> Luxury Safari
              </span>
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onResetPassword={handleResetPassword}
        />

        {/* User Profile Modal */}
        <UserProfile 
          user={user}
          onLogout={handleLogout}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setShowProfile(false)}
          userTrips={userTrips}
          userBookings={userBookings}
        />

        {weather && (
          <div className="weather-widget">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem' }}>
              <FontAwesomeIcon icon={faCloud} style={{ fontSize: '2rem', color: '#6fc3ff' }} />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f0f7fe' }}>
                  {weather.temp}°C
                </div>
                <div style={{ color: '#8bb3da' }}>
                  {weather.condition} · 💧 {weather.humidity}% · 💨 {weather.wind} km/h
                </div>
              </div>
            </div>
          </div>
        )}

        {showSafariPackages && (
          <div className="safari-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: '#f0f7fe' }}>
                <FontAwesomeIcon icon={faPaw} style={{ color: '#f5c542', marginRight: '0.5rem' }} />
                🦁 Trawell Safaris - Safari Packages
              </h4>
              <button 
                onClick={() => setShowSafariPackages(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  color: '#b6d9ff',
                  cursor: 'pointer'
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {Object.values(safariPackages).map((pkg) => (
                <div key={pkg.id} style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ fontSize: '2rem', textAlign: 'center' }}>{pkg.image}</div>
                  <h5 style={{ color: '#f0f7fe', textAlign: 'center', margin: '0.5rem 0' }}>{pkg.name}</h5>
                  <p style={{ color: '#f5c542', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {pkg.price}
                  </p>
                  <p style={{ color: '#8bb3da', textAlign: 'center', fontSize: '0.8rem' }}>
                    📅 {pkg.days}
                  </p>
                  <ul style={{ color: '#c3dffb', fontSize: '0.8rem', listStyle: 'none', padding: '0.5rem 0' }}>
                    {pkg.includes.slice(0, 3).map((item, i) => (
                      <li key={i} style={{ padding: '0.2rem 0' }}>✅ {item}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSafariBooking(pkg.id)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'linear-gradient(135deg, #f6b83d, #e6992b)',
                      border: 'none',
                      borderRadius: '20px',
                      color: '#0b1a2e',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '0.5rem'
                    }}
                  >
                    <FontAwesomeIcon icon={faTicket} /> Book Safari
                  </button>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
              <a 
                href={SAFARI_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#6fc3ff', textDecoration: 'none', fontSize: '0.8rem' }}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} /> Visit Trawell Safaris Website
              </a>
            </div>
          </div>
        )}

        {showChecklist && (
          <div className="checklist-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: '#f0f7fe' }}>
                <FontAwesomeIcon icon={faClipboard} style={{ color: '#6fc3ff', marginRight: '0.5rem' }} />
                Pre-Trip Checklist
              </h4>
              <button 
                onClick={() => setShowChecklist(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  color: '#b6d9ff',
                  cursor: 'pointer'
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem' }}>
              {Object.entries(checklist).map(([key, value]) => (
                <label key={key} style={{ color: '#c3dffb', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={value}
                    onChange={() => toggleChecklist(key)}
                    style={{ accentColor: '#6fc3ff', width: '18px', height: '18px' }}
                  />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
              ))}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => {
                  const allChecked = Object.values(checklist).every(v => v);
                  if (allChecked) {
                    setMessages(prev => [...prev, { 
                      type: 'ai', 
                      content: '✅ **You\'re all packed and ready!** Safe travels! ✈️🌍\n🦁 Don\'t forget to book your safari with Trawell Safaris!' 
                    }]);
                    setShowChecklist(false);
                  } else {
                    setMessages(prev => [...prev, { 
                      type: 'ai', 
                      content: '📋 Keep checking items off your list. You\'re getting closer to your trip!' 
                    }]);
                  }
                }}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: 'linear-gradient(135deg, #2b7be4, #1f5fbb)',
                  border: 'none',
                  borderRadius: '30px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Check Status
              </button>
            </div>
          </div>
        )}

        {showMap && (
          <div className="map-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#f0f7fe' }}>
                <FontAwesomeIcon icon={faMapLocationDot} style={{ color: '#6fc3ff', marginRight: '0.5rem' }} />
                Explore Destinations
              </h3>
              <button 
                onClick={() => setShowMap(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  color: '#b6d9ff',
                  cursor: 'pointer'
                }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div style={{ height: '300px', borderRadius: '1.5rem', overflow: 'hidden' }}>
              <TravelMap 
                destinations={destinations} 
                selectedDestination={selectedDestination}
              />
            </div>
          </div>
        )}

        {itinerary && (
          <div className="itinerary-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: '#f0f7fe' }}>
                <FontAwesomeIcon icon={faRoute} style={{ color: '#6fc3ff', marginRight: '0.5rem' }} />
                Your Itinerary: {itinerary.destination}
              </h4>
              <button 
                onClick={exportItinerary}
                style={{
                  padding: '0.3rem 1rem',
                  background: 'rgba(111, 195, 255, 0.1)',
                  border: '1px solid rgba(111, 195, 255, 0.2)',
                  borderRadius: '20px',
                  color: '#6fc3ff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.8rem'
                }}
              >
                <FontAwesomeIcon icon={faDownload} /> Export
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ color: '#8bb3da', fontSize: '0.8rem' }}>📅 Duration</p>
                <p style={{ color: '#f0f7fe' }}>{itinerary.days} days</p>
              </div>
              <div>
                <p style={{ color: '#8bb3da', fontSize: '0.8rem' }}>🏛️ Attractions</p>
                <p style={{ color: '#f0f7fe', fontSize: '0.9rem' }}>{itinerary.attractions.slice(0, 2).join(', ')}</p>
              </div>
              <div>
                <p style={{ color: '#8bb3da', fontSize: '0.8rem' }}>🛂 Visa</p>
                <p style={{ color: '#f0f7fe', fontSize: '0.9rem' }}>{itinerary.visa}</p>
              </div>
              <div>
                <p style={{ color: '#8bb3da', fontSize: '0.8rem' }}>💰 Currency</p>
                <p style={{ color: '#f0f7fe', fontSize: '0.9rem' }}>{itinerary.currency}</p>
              </div>
            </div>
            <button 
              onClick={() => window.open(BOOKING_URL, '_blank')}
              style={{
                marginTop: '1rem',
                padding: '0.8rem 2rem',
                background: 'linear-gradient(135deg, #2b7be4, #1f5fbb)',
                border: 'none',
                borderRadius: '40px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '1rem auto 0'
              }}
            >
              <FontAwesomeIcon icon={faTicket} /> Book This Trip
            </button>
          </div>
        )}

        <div className="pricing-section">
          <div className="pricing-header">
            <h3><FontAwesomeIcon icon={faTags} style={{color: '#6fc3ff'}} /> Choose Your Plan</h3>
            <span><FontAwesomeIcon icon={faArrowRight} /> Upgrade for more features</span>
          </div>

          <div className="pricing-grid">
            <div className={`plan-card ${plan === 'free' ? 'active' : ''}`}>
              <div className="plan-name" style={{color: '#aac9f0'}}>Standard</div>
              <div className="price">$0 <small>/mo</small></div>
              <ul>
                <li><FontAwesomeIcon icon={faCheckCircle} /> 3 consultations/day</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Basic itineraries</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> 3 destinations</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Map view</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Limited safari access</li>
              </ul>
              <button 
                className={`plan-btn free ${plan === 'free' ? 'active-btn' : ''}`}
                onClick={() => handlePlanUpgrade('free')}
                disabled={plan === 'free'}
              >
                {plan === 'free' ? <><FontAwesomeIcon icon={faCheck} /> Current</> : 'Select'}
              </button>
            </div>

            <div className={`plan-card ${plan === 'basic' ? 'active' : ''}`}>
              <div className="plan-name" style={{color: '#6fd4b0'}}>Premium</div>
              <div className="price">$19 <small>/mo</small></div>
              <ul>
                <li><FontAwesomeIcon icon={faCheckCircle} /> 50 consultations/mo</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Custom itineraries</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> 10 destinations</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Visa assistance</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Export itineraries</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Safari booking access</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Saved itineraries</li>
              </ul>
              <button 
                className={`plan-btn basic ${plan === 'basic' ? 'active-btn' : ''}`}
                onClick={() => handlePlanUpgrade('basic')}
                disabled={plan === 'basic'}
              >
                {plan === 'basic' ? <><FontAwesomeIcon icon={faCheck} /> Current</> : 'Upgrade'}
              </button>
            </div>

            <div className={`plan-card pro-card ${plan === 'pro' ? 'active' : ''}`}>
              <div className="plan-name" style={{color: '#f5c542'}}>Luxury</div>
              <div className="price">$49 <small>/mo</small></div>
              <ul>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Unlimited consultations</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> VIP itinerary builder</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> 25+ destinations</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Express visa processing</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> 24/7 VIP support</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Weather insights</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Exclusive safari deals</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Trip history</li>
                <li><FontAwesomeIcon icon={faCheckCircle} /> Personal concierge</li>
              </ul>
              <button 
                className={`plan-btn pro ${plan === 'pro' ? 'active-btn' : ''}`}
                onClick={() => handlePlanUpgrade('pro')}
                disabled={plan === 'pro'}
              >
                {plan === 'pro' ? <><FontAwesomeIcon icon={faCheck} /> Current</> : <><FontAwesomeIcon icon={faStar} /> Go Luxury</>}
              </button>
            </div>
          </div>
          <div className="footnote">
            <FontAwesomeIcon icon={faShield} /> Secure · <FontAwesomeIcon icon={faClockRotateLeft} /> 24hr cancellation · <FontAwesomeIcon icon={faHeadset} /> 24/7 support · <FontAwesomeIcon icon={faCloud} /> Weather updates · 🦁 Safari bookings · <FontAwesomeIcon icon={faUser} /> User accounts
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;