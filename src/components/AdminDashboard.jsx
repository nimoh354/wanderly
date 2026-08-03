import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, faUsers, faTicket, faChartLine, faCrown,
  faTrash, faCheck, faTimes as faTimesIcon, faRefresh
} from '@fortawesome/free-solid-svg-icons';
import { getAllUsers, getAllBookings, updateBookingStatus, deleteUser } from '../supabase/config';

function AdminDashboard({ user, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    revenue: 0
  });

  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    const { users: userList } = await getAllUsers();
    const { bookings: bookingList } = await getAllBookings();
    
    setUsers(userList || []);
    setBookings(bookingList || []);
    
    const pending = (bookingList || []).filter(b => b.status === 'pending').length;
    const totalRevenue = (bookingList || [])
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.price_value || 0), 0);
    
    setStats({
      totalUsers: (userList || []).length,
      totalBookings: (bookingList || []).length,
      pendingBookings: pending,
      revenue: totalRevenue
    });
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div className="admin-overlay" onClick={onClose}>
        <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <FontAwesomeIcon icon={faCrown} style={{ fontSize: '3rem', color: '#ff6b6b' }} />
            <h2 style={{ color: '#f0f7fe', marginTop: '1rem' }}>Access Denied</h2>
            <p style={{ color: '#8bb3da' }}>You don't have admin privileges.</p>
            <button onClick={onClose} style={{
              marginTop: '1.5rem',
              padding: '0.8rem 2rem',
              background: 'linear-gradient(135deg, #2b7be4, #1f5fbb)',
              border: 'none',
              borderRadius: '30px',
              color: 'white',
              cursor: 'pointer'
            }}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal admin-dashboard" onClick={(e) => e.stopPropagation()}>
        <button className="admin-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="admin-header">
          <h2>
            <FontAwesomeIcon icon={faCrown} style={{ color: '#f5c542' }} />
            Admin Dashboard
          </h2>
          <span style={{ color: '#8bb3da', fontSize: '0.8rem' }}>
            Welcome, {user?.name}
          </span>
        </div>

        <div className="admin-stats">
          <div className="stat-card" style={{ borderColor: '#6fc3ff' }}>
            <FontAwesomeIcon icon={faUsers} style={{ color: '#6fc3ff' }} />
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card" style={{ borderColor: '#f5c542' }}>
            <FontAwesomeIcon icon={faTicket} style={{ color: '#f5c542' }} />
            <div className="stat-number">{stats.totalBookings}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card" style={{ borderColor: '#ff6b6b' }}>
            <FontAwesomeIcon icon={faChartLine} style={{ color: '#ff6b6b' }} />
            <div className="stat-number">{stats.pendingBookings}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card" style={{ borderColor: '#3eff9e' }}>
            <FontAwesomeIcon icon={faTicket} style={{ color: '#3eff9e' }} />
            <div className="stat-number">${stats.revenue}</div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ color: '#f0f7fe' }}>Users</h4>
          {users.slice(0, 5).map((u) => (
            <div key={u.id} style={{
              padding: '0.5rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '0.5rem',
              marginBottom: '0.3rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ color: '#f0f7fe' }}>{u.name}</span>
                <span style={{ color: '#8bb3da', fontSize: '0.7rem', marginLeft: '0.5rem' }}>{u.email}</span>
              </div>
              <span style={{
                padding: '0.1rem 0.5rem',
                borderRadius: '10px',
                background: u.is_admin ? 'rgba(245, 197, 66, 0.2)' : 'rgba(255,255,255,0.05)',
                color: u.is_admin ? '#f5c542' : '#8bb3da',
                fontSize: '0.6rem'
              }}>
                {u.is_admin ? '👑 Admin' : 'User'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;