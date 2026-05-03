import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FiLogOut, FiPackage, FiHeart, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Account.css';

const Account = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profileError && profileData) setProfile(profileData);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!ordersError && ordersData) setOrders(ordersData);

      setLoading(false);
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  if (loading) {
    return <div className="page-container account-loading">Loading...</div>;
  }

  return (
    <div className="page-container account-page">
      <div className="account-header">
        <h1>My Account</h1>
        <p>Welcome back, {profile?.first_name || user?.email?.split('@')[0]}</p>
      </div>

      <div className="account-content">
        <aside className="account-sidebar">
          <nav className="account-nav">
            <button className="account-nav-btn active">
              <FiSettings /> Profile Details
            </button>
            <button className="account-nav-btn" onClick={() => navigate('/wishlist')}>
              <FiHeart /> Wishlist
            </button>
            <button className="account-nav-btn">
              <FiPackage /> Order History
            </button>
            <button className="account-nav-btn text-danger" onClick={handleSignOut}>
              <FiLogOut /> Sign Out
            </button>
          </nav>
        </aside>

        <main className="account-main">
          <section className="account-section">
            <h2>Profile Details</h2>
            <div className="profile-info">
              <div className="info-group">
                <label>First Name</label>
                <p>{profile?.first_name || '-'}</p>
              </div>
              <div className="info-group">
                <label>Last Name</label>
                <p>{profile?.last_name || '-'}</p>
              </div>
              <div className="info-group">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="info-group">
                <label>Phone Number</label>
                <p>{profile?.phone || 'Not provided'}</p>
              </div>
              <div className="info-group full-width">
                <label>Shipping Address</label>
                <p>{profile?.shipping_address || 'No default address set'}</p>
              </div>
            </div>
            <button className="btn-outline mt-4">Edit Profile</button>
          </section>

          <section className="account-section mt-8">
            <h2>Recent Orders</h2>
            {orders.length === 0 ? (
              <div className="empty-state">
                <FiPackage size={48} />
                <p>You haven't placed any orders yet.</p>
                <button className="btn-primary" onClick={() => navigate('/shop')}>
                  Start Shopping
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(183,110,121,0.2)' }}>
                      <th style={{ padding: '12px 8px' }}>Order ID</th>
                      <th style={{ padding: '12px 8px' }}>Date</th>
                      <th style={{ padding: '12px 8px' }}>Total</th>
                      <th style={{ padding: '12px 8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '16px 8px', fontSize: '0.9rem' }}>{o.id.slice(0, 8)}</td>
                        <td style={{ padding: '16px 8px', color: 'var(--muted)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 8px', fontWeight: 600 }}>₦{o.total_amount.toLocaleString()}</td>
                        <td style={{ padding: '16px 8px' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                            background: o.status === 'Pending' ? '#fff3cd' : o.status === 'Processing' ? '#cce5ff' : o.status === 'Shipped' ? '#d4edda' : '#e2e8f0',
                            color: o.status === 'Pending' ? '#856404' : o.status === 'Processing' ? '#004085' : o.status === 'Shipped' ? '#155724' : '#383d41'
                          }}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Account;
