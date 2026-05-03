import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="admin-orders">
      <h2>Order Management</h2>
      <div className="orders-table-wrapper" style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Order ID</th>
              <th style={{ padding: '12px' }}>Customer</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Total</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center' }}>No orders found.</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '12px', fontSize: '0.9rem' }}>{o.id.slice(0, 8)}...</td>
                <td style={{ padding: '12px' }}>{o.profiles?.first_name || 'Guest'} {o.profiles?.last_name || ''}</td>
                <td style={{ padding: '12px' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>₦{o.total_amount.toLocaleString()}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                    background: o.status === 'Pending' ? '#fff3cd' : o.status === 'Processing' ? '#cce5ff' : o.status === 'Shipped' ? '#d4edda' : '#e2e8f0',
                    color: o.status === 'Pending' ? '#856404' : o.status === 'Processing' ? '#004085' : o.status === 'Shipped' ? '#155724' : '#383d41'
                  }}>
                    {o.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <select 
                    value={o.status} 
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
