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
  faBars as faBarsIcon, faChevronLeft, faChevronRight,
  faUserCog, faKey, faEye, faEyeSlash, faRefresh,
  faGaugeHigh
} from '@fortawesome/free-solid-svg-icons';
import './App.css';
import * as THREE from 'three';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  supabase,
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
  getAllBookings,
  updateBookingStatus,
  saveMessage,
  getUserMessages,
  saveFavoriteDestination,
  removeFavoriteDestination,
  getCurrentUser,
  resetPassword,
  isUserAdmin,
  getAllUsers,
  deleteUser,
  makeUserAdmin,
  onAuthStateChanged
} from './supabase/config.js';

import AuthModal from './components/Auth.jsx';
import UserProfile from './components/UserProfile.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// --- ALL BOOKING SITES ---
const BOOKING_SITES = {
  booking: {
    name: 'Booking.com',
    url: 'https://www.booking.com',
    searchUrl: 'https://www.booking.com/searchresults.html?ss=',
    icon: '🏨',
    description: 'Hotels & Accommodations'
  },
  agoda: {
    name: 'Agoda',
    url: 'https://www.agoda.com',
    searchUrl: 'https://www.agoda.com/search?city=',
    icon: '🏩',
    description: 'Hotels & Resorts'
  },
  expedia: {
    name: 'Expedia',
    url: 'https://www.expedia.com',
    searchUrl: 'https://www.expedia.com/Hotel-Search?destination=',
    icon: '🌍',
    description: 'Hotels, Flights & Packages'
  },
  hotelscom: {
    name: 'Hotels.com',
    url: 'https://www.hotels.com',
    searchUrl: 'https://www.hotels.com/search.do?destination=',
    icon: '🏨',
    description: 'Hotel Deals'
  },
  airbnb: {
    name: 'Airbnb',
    url: 'https://www.airbnb.com',
    searchUrl: 'https://www.airbnb.com/s/',
    icon: '🏠',
    description: 'Vacation Rentals'
  },
  tripadvisor: {
    name: 'TripAdvisor',
    url: 'https://www.tripadvisor.com',
    searchUrl: 'https://www.tripadvisor.com/Search?q=',
    icon: '📝',
    description: 'Reviews & Bookings'
  },
  skyscanner: {
    name: 'Skyscanner',
    url: 'https://www.skyscanner.net',
    searchUrl: 'https://www.skyscanner.net/transport/flights/anywhere/',
    icon: '✈️',
    description: 'Flights & Travel'
  },
  kayak: {
    name: 'Kayak',
    url: 'https://www.kayak.com',
    searchUrl: 'https://www.kayak.com/hotels/',
    icon: '🔍',
    description: 'Compare Deals'
  },
  momondo: {
    name: 'Momondo',
    url: 'https://www.momondo.com',
    searchUrl: 'https://www.momondo.com/flights/',
    icon: '🌐',
    description: 'Flight Search'
  },
  trawell: {
    name: 'Trawell Safaris',
    url: 'https://trawellsafaris.co.ke/',
    searchUrl: 'https://trawellsafaris.co.ke/?s=',
    icon: '🦁',
    description: 'African Safaris Experts'
  },
  viator: {
    name: 'Viator',
    url: 'https://www.viator.com',
    searchUrl: 'https://www.viator.com/search/',
    icon: '🎯',
    description: 'Tours & Activities'
  },
  getyourguide: {
    name: 'GetYourGuide',
    url: 'https://www.getyourguide.com',
    searchUrl: 'https://www.getyourguide.com/',
    icon: '📸',
    description: 'Tours & Experiences'
  },
  rentalcars: {
    name: 'Rentalcars.com',
    url: 'https://www.rentalcars.com',
    searchUrl: 'https://www.rentalcars.com/',
    icon: '🚗',
    description: 'Car Rentals Worldwide'
  },
  europcar: {
    name: 'Europcar',
    url: 'https://www.europcar.com',
    searchUrl: 'https://www.europcar.com/en-us/car-rental/',
    icon: '🚙',
    description: 'Car Hire Europe & Worldwide'
  },
  hertz: {
    name: 'Hertz',
    url: 'https://www.hertz.com',
    searchUrl: 'https://www.hertz.com/rentacar/reservation/',
    icon: '🏎️',
    description: 'Car Rentals USA & Global'
  },
  avis: {
    name: 'Avis',
    url: 'https://www.avis.com',
    searchUrl: 'https://www.avis.com/en/home',
    icon: '🚘',
    description: 'Car Rentals Worldwide'
  },
  enterprise: {
    name: 'Enterprise',
    url: 'https://www.enterprise.com',
    searchUrl: 'https://www.enterprise.com/en/home.html',
    icon: '🚗',
    description: 'Car Rentals & Van Rentals'
  },
  sixt: {
    name: 'Sixt',
    url: 'https://www.sixt.com',
    searchUrl: 'https://www.sixt.com/car-rental/',
    icon: '🇩🇪',
    description: 'Car Rentals Europe & Worldwide'
  },
  kayakcarrental: {
    name: 'Kayak Car Rental',
    url: 'https://www.kayak.com/cars',
    searchUrl: 'https://www.kayak.com/cars/',
    icon: '🔍',
    description: 'Compare Car Rentals'
  },
  lastminute: {
    name: 'Lastminute.com',
    url: 'https://www.lastminute.com',
    searchUrl: 'https://www.lastminute.com/search?q=',
    icon: '⏰',
    description: 'Last Minute Deals'
  },
  travelocity: {
    name: 'Travelocity',
    url: 'https://www.travelocity.com',
    searchUrl: 'https://www.travelocity.com/Hotel-Search?destination=',
    icon: '🧳',
    description: 'Travel Packages'
  },
  priceline: {
    name: 'Priceline',
    url: 'https://www.priceline.com',
    searchUrl: 'https://www.priceline.com/',
    icon: '🎯',
    description: 'Hotel, Flights & Car Deals'
  },
  orbitz: {
    name: 'Orbitz',
    url: 'https://www.orbitz.com',
    searchUrl: 'https://www.orbitz.com/Hotel-Search?destination=',
    icon: '🌐',
    description: 'Travel Packages & Deals'
  }
};

// --- Text-to-Speech Function ---
const speakText = (text, onEnd = null) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => voice.name.includes('Google UK') || voice.name.includes('Samantha'));
    if (femaleVoice) utterance.voice = femaleVoice;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
    return utterance;
  }
  return null;
};

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
      map.flyTo([selectedDestination.lat, selectedDestination.lng], 10, { duration: 2 });
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
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }} ref={setMap}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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

// --- Sidebar Component ---
function Sidebar({ isOpen, onToggle, activeTab, setActiveTab, chatHistory, loadChatHistory, clearChatHistory, userTrips, userBookings, user }) {
  return (
    <>
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
            <button className="sidebar-clear" onClick={clearChatHistory} style={{
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
            }}>
              <FontAwesomeIcon icon={faTrash} /> Clear
            </button>
          )}
        </div>

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
                  <div key={item.id} className="sidebar-item" onClick={() => loadChatHistory(item)} style={{
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
                  }}>
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

// --- Safari Packages Data ---
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
  // Auth State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [isAdminUser, setIsAdminUser] = useState(false);

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
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [isVoiceFirstTime, setIsVoiceFirstTime] = useState(true);
  
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

  // --- Booking Functions ---
  const openBookingSite = (url) => {
    window.open(url, '_blank');
  };

  const searchOnBookingSite = (siteKey, destination) => {
    const site = BOOKING_SITES[siteKey];
    if (!site) return null;
    
    let searchUrl = site.searchUrl;
    if (destination) {
      searchUrl = site.searchUrl + encodeURIComponent(destination);
    }
    openBookingSite(searchUrl);
    return searchUrl;
  };

  // --- Save chat history effect ---
  useEffect(() => {
    if (messages.length > 2) {
      const history = messages.filter(msg => msg.type === 'user' || msg.type === 'ai');
      if (history.length > 0) {
        const historyItem = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          messages: history.slice(-6),
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

  // --- Supabase Auth Listener ---
  useEffect(() => {
    const { unsubscribe } = onAuthStateChanged(async (userData) => {
      if (userData) {
        const userInfo = {
          uid: userData.id,
          auth_id: userData.auth_id,
          email: userData.email,
          name: userData.name || 'Traveler',
          plan: userData.plan || 'free',
          role: userData.role || 'user',
          isAdmin: userData.is_admin || false,
          tripsPlanned: userData.trips_planned || 0,
          destinationsVisited: userData.destinations_visited || 0,
          reviews: userData.reviews || 0,
          preferences: userData.preferences || { currency: 'USD', notifications: true, darkMode: true },
          memberSince: userData.created_at ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          favorites: userData.favorites || []
        };
        setUser(userInfo);
        setIsLoggedIn(true);
        setPlan(userInfo.plan);
        setIsAdminUser(userInfo.isAdmin || userInfo.role === 'admin');
        setDarkMode(userInfo.preferences?.darkMode !== false);
        
        const { trips } = await getUserTrips(userData.id);
        setUserTrips(trips || []);
        
        const { bookings } = await getUserSafariBookings(userData.id);
        setUserBookings(bookings || []);
        
        localStorage.setItem('wanderly_user', JSON.stringify(userInfo));
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setIsAdminUser(false);
        setUserTrips([]);
        setUserBookings([]);
        localStorage.removeItem('wanderly_user');
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
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

  // --- Auth Functions ---
  const handleLogin = async (email, password) => {
    const { user: userData, error } = await loginUser(email, password);
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
    const { user: userData, error } = await registerUser(name, email, password);
    if (error) {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: `❌ Registration failed: ${error}` 
      }]);
      return false;
    }
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: `🎉 Welcome ${name}! Your account has been created and you are now signed in.` 
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
    setShowAdmin(false);
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
    
    try {
      const { data, error } = await updateUserProfile(user.uid, updatedData);
      if (error) {
        setMessages(prev => [...prev, { 
          type: 'ai', 
          content: `❌ Failed to update profile: ${error}` 
        }]);
        return false;
      }
      
      setUser(prev => ({ ...prev, ...updatedData }));
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: '✅ Profile updated successfully!' 
      }]);
      return true;
    } catch (error) {
      console.error('Update error:', error);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: `❌ Failed to update profile: ${error.message}` 
      }]);
      return false;
    }
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
      content: `🎉 **Upgraded to ${planNames[newPlan]} Plan!**\n\n✅ More features unlocked\n✅ Priority support\n✅ Exclusive safari deals\n🔗 Start booking: https://www.booking.com` 
    }]);
  };

  // --- Admin Functions ---
  const handleAdminLogin = (adminUser) => {
    setShowAdminLogin(false);
    setShowAdmin(true);
    setIsAdminUser(true);
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: `👑 Welcome back, Admin ${adminUser.displayName || 'User'}! You now have access to the admin dashboard.` 
    }]);
  };

  const openAdmin = () => {
    if (isAdminUser) {
      setShowAdmin(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  // --- Sidebar Functions ---
  const loadChatHistory = (historyItem) => {
    setMessages(prev => {
      const welcomeMessages = [
        { type: 'bot', content: "🦁 Welcome back to Wanderly Travel! I'm your AI travel consultant." }
      ];
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
      `🏨 Booking.com: https://www.booking.com\n` +
      `✈️ Skyscanner: https://www.skyscanner.net\n` +
      `🦁 Trawell Safaris: https://trawellsafaris.co.ke/\n` +
      `🚗 Rentalcars.com: https://www.rentalcars.com\n\n` +
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
      'hotels': 'Find hotels in',
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
          `🔗 **Book this safari:** https://trawellsafaris.co.ke/contact/\n\n` +
          `💡 This safari is proudly offered by Trawell Safaris - Africa's Safari Experts! 🐘` 
      }]);
    }
  };

  // --- Voice Assistant ---
  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.abort();
      setIsListening(false);
      window.speechSynthesis.cancel();
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      
      const greeting = "Hello! How may I help you today?";
      speakText(greeting);
      
      if (isVoiceFirstTime) {
        setIsVoiceFirstTime(false);
        setMessages(prev => [...prev, { 
          type: 'ai', 
          content: `🎤 **Voice Assistant Activated**\n\nHello! How may I help you today?` 
        }]);
      }
    } else {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: '🔊 Voice recognition not supported. Please use Chrome or Edge.' 
      }]);
    }
  };

  // --- Voice recognition setup ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          setInputValue(transcript);
          
          const lower = transcript.toLowerCase();
          let destination = null;
          const destMatch = transcript.match(/in\s+([a-zA-Z\s]+)/i) || 
                           transcript.match(/to\s+([a-zA-Z\s]+)/i) ||
                           transcript.match(/at\s+([a-zA-Z\s]+)/i);
          if (destMatch) {
            destination = destMatch[1].trim();
          }
          
          // Check for booking site commands
          for (const [key, site] of Object.entries(BOOKING_SITES)) {
            if (lower.includes(key)) {
              const url = destination ? searchOnBookingSite(key, destination) : site.url;
              setMessages(prev => [...prev, { type: 'user', content: transcript }]);
              setMessages(prev => [...prev, { 
                type: 'ai', 
                content: `${site.icon} **Opening ${site.name}${destination ? ' for ' + destination : ''}...**\n\n🔗 ${url}` 
              }]);
              setIsListening(false);
              return;
            }
          }
          
          handleSend(transcript);
          setIsListening(false);
        } else {
          setInputValue(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMessages(prev => [...prev, { 
            type: 'ai', 
            content: '🔊 Microphone access denied. Please allow microphone access and try again.' 
          }]);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

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
      
      let destination = null;
      const destMatch = userMsg.match(/in\s+([a-zA-Z\s]+)/i) || 
                       userMsg.match(/to\s+([a-zA-Z\s]+)/i) ||
                       userMsg.match(/at\s+([a-zA-Z\s]+)/i);
      if (destMatch) {
        destination = destMatch[1].trim();
      }

      // Check for booking site commands
      for (const [key, site] of Object.entries(BOOKING_SITES)) {
        if (lower.includes(key)) {
          const url = destination ? searchOnBookingSite(key, destination) : site.url;
          response = `${site.icon} **Opening ${site.name}${destination ? ' for ' + destination : ''}...**\n\n${site.description}\n\n🔗 ${url}`;
          setIsTyping(false);
          setMessages(prev => [...prev, { type: 'ai', content: response }]);
          return;
        }
      }

      // Check for travel destinations
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

      // Handle different queries
      if (lower.includes('login') || lower.includes('sign in')) {
        setShowAuth(true);
        response = `🔐 Opening login window...`;
      }
      else if (lower.includes('sign up') || lower.includes('register') || lower.includes('create account')) {
        setShowAuth(true);
        response = `📝 Opening registration window...`;
      }
      else if (lower.includes('profile') || lower.includes('account') || lower.includes('settings')) {
        if (isLoggedIn) {
          setShowProfile(true);
          response = `👤 Opening your profile...`;
        } else {
          response = `🔒 You're not signed in. Click the user icon to get started!`;
        }
      }
      else if (lower.includes('admin') || lower.includes('dashboard')) {
        if (isLoggedIn) {
          openAdmin();
          response = `👑 Opening admin dashboard...`;
        } else {
          response = `🔒 Please login first to access the admin dashboard.`;
        }
      }
      else if (lower.includes('safari') || lower.includes('wildlife') || lower.includes('animal')) {
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
        response += `🔗 **Book with Trawell Safaris:** https://trawellsafaris.co.ke/`;
        setShowSafariPackages(true);
      }
      else if (lower.includes('car') || lower.includes('rental') || lower.includes('rent a car') || lower.includes('hire')) {
        let dest = destination || 'anywhere';
        response = `🚗 **Car Rentals${dest ? ' in ' + dest : ''}**\n\n`;
        response += `🔍 **Compare & Book:**\n`;
        response += `• Rentalcars.com: https://www.rentalcars.com\n`;
        response += `• Kayak Car Rental: https://www.kayak.com/cars\n`;
        response += `• Expedia Car Rental: https://www.expedia.com/Cars\n`;
        response += `• Booking.com Cars: https://www.booking.com/cars\n\n`;
        response += `🏎️ **Top Rental Companies:**\n`;
        response += `• Hertz: https://www.hertz.com\n`;
        response += `• Avis: https://www.avis.com\n`;
        response += `• Enterprise: https://www.enterprise.com\n`;
        response += `• Budget: https://www.budget.com\n`;
        response += `• Sixt: https://www.sixt.com\n`;
        response += `• Europcar: https://www.europcar.com\n\n`;
        response += `💡 **Tip:** Compare prices across multiple sites for the best deal!`;
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
          response += `🔗 **Book hotels**: https://www.booking.com\n`;
          response += `✈️ **Book flights**: https://www.skyscanner.net\n`;
          response += `🚗 **Book car rental**: https://www.rentalcars.com`;
          
          setItinerary({
            destination: destData.name,
            days: days,
            attractions: destData.attractions,
            bestTime: destData.bestTime,
            currency: destData.currency,
            visa: destData.visaRequired
          });
          
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
          response += `📄 **Documents**:\n• Valid passport (6 months validity)\n• 2 passport photos\n• Hotel booking\n• Flight itinerary\n• Bank statements\n\n🔗 Check requirements: https://www.tripadvisor.com`;
        } else {
          response = `🛂 **Visa Services**\n\nI can help with visa requirements for any destination.\n\n📍 Specify a destination (e.g., "Visa for Kenya")`;
        }
      }
      else if (lower.includes('checklist') || lower.includes('pack')) {
        setShowChecklist(true);
        response = `✅ **Travel Checklist**\n\nI've opened your pre-trip checklist!`;
      }
      else if (lower.includes('export') || lower.includes('download')) {
        if (itinerary) {
          exportItinerary();
          return;
        } else {
          response = `📄 **Export Itinerary**\n\nPlease create an itinerary first by asking "Plan a trip to [destination]"`;
        }
      }
      else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        response = `👋 Hello there! How can I help you with your travel plans today?\n\nYou can ask me about:\n• 🌍 Destinations\n• 🏨 Hotels & Accommodations\n• ✈️ Flights\n• 🦁 Safaris\n• 🚗 Car Rentals\n• 📋 Itineraries\n• 🛂 Visas\n\nWhat would you like to know?`;
      }
      else if (destData) {
        response = `📍 **${destData.name}**\n\n${destData.description}\n\n⭐ Rating: ${destData.rating}/5.0\n💰 Price: ${destData.priceRange}\n📅 Best Time: ${destData.bestTime}\n🛂 Visa: ${destData.visaRequired}\n💵 Currency: ${destData.currency}\n🗣️ Language: ${destData.language}\n🌤️ Weather: ${destData.weather}\n\n🏛️ **Top Attractions**\n${destData.attractions.map(a => `• ${a}`).join('\n')}\n\n🎯 **Activities**\n${destData.activities.map(a => `• ${a}`).join('\n')}\n\n🔗 **Book hotels**: https://www.booking.com\n✈️ **Book flights**: https://www.skyscanner.net\n🚗 **Book car rental**: https://www.rentalcars.com`;
      }
      else {
        response = `🌍 **How can I help you travel better?**\n\n🏨 **Hotels:** Booking.com, Agoda, Expedia, Airbnb\n✈️ **Flights:** Skyscanner, Kayak, Google Flights\n🦁 **Safaris:** Trawell Safaris, Viator\n🚗 **Car Rentals:** Rentalcars.com, Hertz, Avis, Enterprise, Budget\n\n💡 **Try these commands:**\n• "Tell me about Paris"\n• "Plan a trip to Bali"\n• "Plan a safari"\n• "Car rental in New York"\n• "Weather in Tokyo"\n• "Travel checklist"\n• "Login" or "Sign up"`;
      }
      
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'ai', content: response }]);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
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
            
            {/* Theme Toggle */}
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

            {/* Admin Button */}
            {isLoggedIn && (
              <button
                onClick={() => {
                  if (isAdminUser) {
                    setShowAdmin(true);
                  } else {
                    setShowAdminLogin(true);
                  }
                }}
                style={{
                  background: isAdminUser ? 'rgba(245, 197, 66, 0.3)' : 'rgba(255,255,255,0.05)',
                  border: isAdminUser ? '2px solid #f5c542' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: isAdminUser ? '#f5c542' : '#8bb3da',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  position: 'relative'
                }}
                title={isAdminUser ? '👑 Admin Dashboard' : 'Admin Login'}
              >
                <FontAwesomeIcon icon={faCrown} />
                {isAdminUser && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '14px',
                    height: '14px',
                    background: '#3eff9e',
                    borderRadius: '50%',
                    border: '2px solid #0b1a2e',
                    animation: 'pulse-dot 1.8s infinite'
                  }} />
                )}
              </button>
            )}

            {/* User Profile Button */}
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
              <span style={{ color: '#8bb3da', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                👋 {user?.name}
                {isAdminUser && (
                  <span style={{
                    padding: '0.1rem 0.5rem',
                    borderRadius: '10px',
                    background: 'rgba(245, 197, 66, 0.2)',
                    color: '#f5c542',
                    fontSize: '0.6rem',
                    fontWeight: 'bold'
                  }}>
                    👑 ADMIN
                  </span>
                )}
              </span>
            )}

            <a 
              href="https://www.booking.com" 
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
                    fontSize: '1rem',
                    animation: isListening ? 'pulse-voice 1s infinite' : 'none'
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
                placeholder={isListening ? "🎤 Listening..." : "Ask about destinations, hotels, flights, safaris, car rentals..."}
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
              <button onClick={() => {
                const dest = prompt('Where are you looking for hotels?');
                if (dest) {
                  const url = searchOnBookingSite('booking', dest);
                  setMessages(prev => [...prev, { 
                    type: 'ai', 
                    content: `🏨 **Opening Booking.com for ${dest}...**\n\n🔗 ${url}` 
                  }]);
                }
              }}>
                <FontAwesomeIcon icon={faHotel} /> Hotels
              </button>
              
              <button onClick={() => {
                const dest = prompt('Where are you flying to?');
                if (dest) {
                  const url = searchOnBookingSite('skyscanner', dest);
                  setMessages(prev => [...prev, { 
                    type: 'ai', 
                    content: `✈️ **Opening Skyscanner for ${dest}...**\n\n🔗 ${url}` 
                  }]);
                }
              }}>
                <FontAwesomeIcon icon={faPlane} /> Flights
              </button>
              
              <button onClick={() => {
                const dest = prompt('Where do you need a car rental?');
                if (dest) {
                  const url = searchOnBookingSite('rentalcars', dest);
                  setMessages(prev => [...prev, { 
                    type: 'ai', 
                    content: `🚗 **Opening Rentalcars.com for ${dest}...**\n\n🔗 ${url}` 
                  }]);
                }
              }}>
                <FontAwesomeIcon icon={faCar} /> Car Rental
              </button>
              
              <button onClick={() => {
                openBookingSite(BOOKING_SITES.trawell.url);
                setMessages(prev => [...prev, { 
                  type: 'ai', 
                  content: `🦁 **Opening Trawell Safaris...**\n\nAfrica's Safari Experts!` 
                }]);
              }}>
                <FontAwesomeIcon icon={faPaw} /> Safari
              </button>
              
              <button onClick={() => {
                openBookingSite(BOOKING_SITES.airbnb.url);
                setMessages(prev => [...prev, { 
                  type: 'ai', 
                  content: `🏠 **Opening Airbnb...**\n\nFind unique stays worldwide!` 
                }]);
              }}>
                <FontAwesomeIcon icon={faHome} /> Airbnb
              </button>
              
              <button onClick={() => handleQuickAction('itinerary')}>
                <FontAwesomeIcon icon={faRoute} /> Plan
              </button>
            </div>

            <div className="quick-suggestions">
              {recentSearches.map((search, idx) => (
                <span key={idx} onClick={() => { setInputValue(search); handleSend(search); }}>
                  🔄 {search}
                </span>
              ))}
              <span onClick={() => { setInputValue('Open Booking.com Paris'); handleSend('Open Booking.com Paris'); }}>
                🏨 Booking Paris
              </span>
              <span onClick={() => { setInputValue('Open Skyscanner Tokyo'); handleSend('Open Skyscanner Tokyo'); }}>
                ✈️ Skyscanner Tokyo
              </span>
              <span onClick={() => { setInputValue('Open Trawell'); handleSend('Open Trawell'); }}>
                🦁 Trawell Safari
              </span>
              <span onClick={() => { setInputValue('Open Airbnb Bali'); handleSend('Open Airbnb Bali'); }}>
                🏠 Airbnb Bali
              </span>
              <span onClick={() => { setInputValue('Rent a car in Paris'); handleSend('Rent a car in Paris'); }}>
                🚗 Paris Car Rental
              </span>
              <span onClick={() => { setInputValue('Open Hertz'); handleSend('Open Hertz'); }}>
                🏎️ Hertz
              </span>
              <span onClick={() => { setInputValue('Plan a safari'); handleSend('Plan a safari'); }}>
                🦁 Safari
              </span>
              <span onClick={() => { setInputValue('Hello'); handleSend('Hello'); }}>
                👋 Hello
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
        {showProfile && (
          <UserProfile 
            user={user}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            onClose={() => setShowProfile(false)}
            userTrips={userTrips}
            userBookings={userBookings}
            onBackToDashboard={() => {
              setShowProfile(false);
              setShowAdmin(true);
            }}
          />
        )}

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <AdminLogin 
            onClose={() => setShowAdminLogin(false)}
            onLoginSuccess={handleAdminLogin}
          />
        )}

        {/* Admin Dashboard */}
        {showAdmin && (
          <AdminDashboard 
            user={user}
            onClose={() => {
              setShowAdmin(false);
            }}
          />
        )}

        {/* Weather Widget */}
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

        {/* Safari Packages */}
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
                    onClick={() => {
                      openBookingSite('https://trawellsafaris.co.ke/contact/');
                      setMessages(prev => [...prev, { 
                        type: 'ai', 
                        content: `🦁 **Redirecting to Trawell Safaris booking page...**` 
                      }]);
                    }}
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
                href="https://trawellsafaris.co.ke/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#6fc3ff', textDecoration: 'none', fontSize: '0.8rem' }}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} /> Visit Trawell Safaris Website
              </a>
            </div>
          </div>
        )}

  <div className="booking-sites-section" style={{
  marginTop: '1.5rem',
  padding: '1.5rem',
  background: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '1.5rem',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  animation: 'slideUp 0.5s ease'
}}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
    <h4 style={{ color: '#f0f7fe' }}>
      <FontAwesomeIcon icon={faGlobe} style={{ color: '#6fc3ff', marginRight: '0.5rem' }} />
      🌐 All Booking Sites
    </h4>
    <span style={{ color: '#8bb3da', fontSize: '0.7rem' }}>Click to open</span>
  </div>
  
  <div style={{ marginBottom: '0.8rem' }}>
    <h5 style={{ color: '#8bb3da', fontSize: '0.8rem', marginBottom: '0.5rem' }}>🏨 Hotels & Accommodations</h5>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
      {['booking', 'agoda', 'expedia', 'hotelscom', 'airbnb', 'tripadvisor'].map((key) => {
        const site = BOOKING_SITES[key];
        if (!site) return null;
        return (
          <div
            key={key}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.8rem',
              padding: '0.6rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={() => {
              openBookingSite(site.url);
              setMessages(prev => [...prev, { 
                type: 'ai', 
                content: `${site.icon} **Opening ${site.name}...**\n\n${site.description}\n\n🔗 ${site.url}` 
              }]);
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <div style={{ fontSize: '1.2rem' }}>{site.icon}</div>
            <div style={{ color: '#f0f7fe', fontSize: '0.7rem' }}>{site.name}</div>
          </div>
        );
      })}
    </div>
  </div>

  <div style={{ marginBottom: '0.8rem' }}>
    <h5 style={{ color: '#8bb3da', fontSize: '0.8rem', marginBottom: '0.5rem' }}>✈️ Flights</h5>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
      {['skyscanner', 'kayak', 'momondo', 'cheapflights', 'googleflights'].map((key) => {
        const site = BOOKING_SITES[key];
        if (!site) return null;
        return (
          <div
            key={key}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.8rem',
              padding: '0.6rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={() => {
              openBookingSite(site.url);
              setMessages(prev => [...prev, { 
                type: 'ai', 
                content: `${site.icon} **Opening ${site.name}...**\n\n${site.description}\n\n🔗 ${site.url}` 
              }]);
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <div style={{ fontSize: '1.2rem' }}>{site.icon}</div>
            <div style={{ color: '#f0f7fe', fontSize: '0.7rem' }}>{site.name}</div>
          </div>
        );
      })}
    </div>
  </div>

  <div style={{ marginBottom: '0.8rem' }}>
    <h5 style={{ color: '#8bb3da', fontSize: '0.8rem', marginBottom: '0.5rem' }}>🦁 Safaris & Tours</h5>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
      {['trawell', 'viator', 'getyourguide'].map((key) => {
        const site = BOOKING_SITES[key];
        if (!site) return null;
        return (
          <div
            key={key}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.8rem',
              padding: '0.6rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={() => {
              openBookingSite(site.url);
              setMessages(prev => [...prev, { 
                type: 'ai', 
                content: `${site.icon} **Opening ${site.name}...**\n\n${site.description}\n\n🔗 ${site.url}` 
              }]);
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <div style={{ fontSize: '1.2rem' }}>{site.icon}</div>
            <div style={{ color: '#f0f7fe', fontSize: '0.7rem' }}>{site.name}</div>
          </div>
        );
      })}
    </div>
  </div>

  <div style={{ marginBottom: '0.8rem' }}>
    <h5 style={{ color: '#8bb3da', fontSize: '0.8rem', marginBottom: '0.5rem' }}>🚗 Car Rentals</h5>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
      {['rentalcars', 'europcar', 'hertz', 'avis', 'budget', 'enterprise', 'alamo', 'national', 'sixt', 'thrifty', 'dollar', 'kayakcarrental', 'expedia_cars', 'booking_cars'].map((key) => {
        const site = BOOKING_SITES[key];
        if (!site) return null;
        return (
          <div
            key={key}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.8rem',
              padding: '0.6rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={() => {
              openBookingSite(site.url);
              setMessages(prev => [...prev, { 
                type: 'ai', 
                content: `${site.icon} **Opening ${site.name}...**\n\n${site.description}\n\n🔗 ${site.url}` 
              }]);
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <div style={{ fontSize: '1.2rem' }}>{site.icon}</div>
            <div style={{ color: '#f0f7fe', fontSize: '0.7rem' }}>{site.name}</div>
          </div>
        );
      })}
    </div>
  </div>

  <div>
    <h5 style={{ color: '#8bb3da', fontSize: '0.8rem', marginBottom: '0.5rem' }}>🧳 Packages & Deals</h5>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
      {['lastminute', 'travelocity', 'priceline', 'orbitz'].map((key) => {
        const site = BOOKING_SITES[key];
        if (!site) return null;
        return (
          <div
            key={key}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.8rem',
              padding: '0.6rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={() => {
              openBookingSite(site.url);
              setMessages(prev => [...prev, { 
                type: 'ai', 
                content: `${site.icon} **Opening ${site.name}...**\n\n${site.description}\n\n🔗 ${site.url}` 
              }]);
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <div style={{ fontSize: '1.2rem' }}>{site.icon}</div>
            <div style={{ color: '#f0f7fe', fontSize: '0.7rem' }}>{site.name}</div>
          </div>
        );
      })}
    </div>
  </div>
</div>

        {/* Checklist */}
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
                      content: '✅ **You\'re all packed and ready!** Safe travels! ✈️🌍' 
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

        {/* Map */}
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

        {/* Itinerary */}
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
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => window.open('https://www.booking.com', '_blank')}
                style={{
                  padding: '0.8rem 2rem',
                  background: 'linear-gradient(135deg, #2b7be4, #1f5fbb)',
                  border: 'none',
                  borderRadius: '40px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FontAwesomeIcon icon={faHotel} /> Book Hotels
              </button>
              <button 
                onClick={() => window.open('https://www.skyscanner.net', '_blank')}
                style={{
                  padding: '0.8rem 2rem',
                  background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                  border: 'none',
                  borderRadius: '40px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FontAwesomeIcon icon={faPlane} /> Book Flights
              </button>
              <button 
                onClick={() => window.open('https://www.rentalcars.com', '_blank')}
                style={{
                  padding: '0.8rem 2rem',
                  background: 'linear-gradient(135deg, #00A3E0, #0077B3)',
                  border: 'none',
                  borderRadius: '40px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FontAwesomeIcon icon={faCar} /> Book Car Rental
              </button>
              <button 
                onClick={() => window.open('https://trawellsafaris.co.ke/', '_blank')}
                style={{
                  padding: '0.8rem 2rem',
                  background: 'linear-gradient(135deg, #f6b83d, #e6992b)',
                  border: 'none',
                  borderRadius: '40px',
                  color: '#0b1a2e',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FontAwesomeIcon icon={faPaw} /> Book Safari
              </button>
            </div>
          </div>
        )}

        {/* Pricing Section */}
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
            <FontAwesomeIcon icon={faShield} /> Secure · <FontAwesomeIcon icon={faClockRotateLeft} /> 24hr cancellation · <FontAwesomeIcon icon={faHeadset} /> 24/7 support · <FontAwesomeIcon icon={faCloud} /> Weather updates · 🦁 Safari bookings · 🚗 Car rentals · <FontAwesomeIcon icon={faUser} /> User accounts
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;