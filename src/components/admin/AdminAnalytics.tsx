import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiDollarSign, FiShoppingBag, FiTrendingUp } from 'react-icons/fi';

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.from('orders').select('total_amount');
      if (!error && data) {
        const totalRevenue = data.reduce((acc, o) => acc + Number(o.total_amount), 0);
        const totalOrders = data.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        setStats({ totalRevenue, totalOrders, avgOrderValue });
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="admin-analytics">
      <h2>Sales Analytics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginTop: '24px' }}>
        
        <div style={{ background: 'var(--white)', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: '#e6fffa', padding: '12px', borderRadius: '50%', color: '#319795' }}>
              <FiDollarSign size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Revenue</p>
              <h3 style={{ fontSize: '1.8rem' }}>₦{stats.totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--white)', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: '#ebf8ff', padding: '12px', borderRadius: '50%', color: '#3182ce' }}>
              <FiShoppingBag size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Orders</p>
              <h3 style={{ fontSize: '1.8rem' }}>{stats.totalOrders}</h3>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--white)', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: '#faf5ff', padding: '12px', borderRadius: '50%', color: '#805ad5' }}>
              <FiTrendingUp size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Avg Order Value</p>
              <h3 style={{ fontSize: '1.8rem' }}>₦{stats.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;
