import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiLogOut, FiPlus } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/admin/ImageUploader';
import AdminOrders from '../components/admin/AdminOrders';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import Loader from '../components/ui/Loader';
import { CATEGORIES, getCategoryDisplayName, type Product, type Category } from '../types';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const emptyForm = {
  name: '',
  price: '',
  category: 'Necklaces' as Category,
  description: '',
  images: [] as string[],
  stock: '',
  featured: false,
};

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching:', error);
    } else {
      const mapped = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category as Category,
        description: p.description || '',
        images: p.images || [],
        stock: p.stock || 0,
        featured: p.featured || false,
        createdAt: new Date(p.created_at).getTime(),
      }));
      setProducts(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('admin-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Please fill in product name and price');
      return;
    }
    if (form.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setSaving(true);

    const productData = {
      name: form.name,
      price: Number(form.price),
      category: form.category,
      description: form.description,
      images: form.images,
      stock: Number(form.stock) || 0,
      featured: form.featured,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Product updated!');
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Product added!');
      }
      setForm(emptyForm);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    }

    setSaving(false);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      description: product.description,
      images: product.images || [],
      stock: String(product.stock || 0),
      featured: product.featured,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted');
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const handleToggleSoldOut = async (product: Product) => {
    try {
      const newStock = product.stock === 0 ? 1 : 0;
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', product.id);

      if (error) throw error;
      toast.success(newStock === 0 ? 'Marked as Sold Out' : 'Restocked');
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error('Failed to update status');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  if (authLoading) return <Loader />;
  if (!user) return null;

  return (
    <main className="admin-dashboard">
      <div className="admin-topbar">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your products</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button onClick={() => setActiveTab('products')} style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'products' ? 600 : 400, color: activeTab === 'products' ? 'var(--rose-gold)' : 'var(--muted)', cursor: 'pointer', borderBottom: activeTab === 'products' ? '2px solid var(--rose-gold)' : 'none' }}>Products</button>
        <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'orders' ? 600 : 400, color: activeTab === 'orders' ? 'var(--rose-gold)' : 'var(--muted)', cursor: 'pointer', borderBottom: activeTab === 'orders' ? '2px solid var(--rose-gold)' : 'none' }}>Orders</button>
        <button onClick={() => setActiveTab('analytics')} style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'analytics' ? 600 : 400, color: activeTab === 'analytics' ? 'var(--rose-gold)' : 'var(--muted)', cursor: 'pointer', borderBottom: activeTab === 'analytics' ? '2px solid var(--rose-gold)' : 'none' }}>Analytics</button>
      </div>

      <div className="admin-layout">
        {activeTab === 'analytics' && <AdminAnalytics />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'products' && (
          <>
            {/* Product Form */}
        <motion.div
          className="admin-form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>

          <form onSubmit={handleSubmit} className="product-form">
            <ImageUploader
              images={form.images}
              onImagesChange={(urls) => setForm({ ...form, images: urls })}
            />

            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Gold Pendant Necklace"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (₦)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{getCategoryDisplayName(cat)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="e.g. 10"
                />
              </div>
              <div className="form-group form-check-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  Featured Product
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your product..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                <FiPlus /> {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => { setEditingId(null); setForm(emptyForm); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Products List */}
        <div className="admin-products">
          <h2>Products ({products.length})</h2>
          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <p className="empty-state">No products yet. Add your first product!</p>
          ) : (
            <div className="admin-products-list">
              <AnimatePresence>
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    className="admin-product-item"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="admin-product-thumb">
                      <img
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.name}
                      />
                    </div>
                    <div className="admin-product-info">
                      <h4>{product.name}</h4>
                      <span className="admin-product-cat">{getCategoryDisplayName(product.category)}</span>
                    </div>
                    <span className="admin-product-price">
                      ₦{product.price.toLocaleString()}
                    </span>
                    <div className="admin-product-actions">
                      <button
                        onClick={() => handleToggleSoldOut(product)}
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        {product.stock === 0 ? 'Restock' : 'Mark Sold Out'}
                      </button>
                      <button onClick={() => handleEdit(product)} className="edit-btn" aria-label="Edit">
                        <FiEdit2 size={14} />
                      </button>
                      
                      {confirmDeleteId === product.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => handleDelete(product.id)} className="delete-btn" style={{ color: 'red', borderColor: 'red' }}>Sure?</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="edit-btn">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(product.id)} className="delete-btn" aria-label="Delete">
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
