import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/product/ProductCard';
import { FiHeart } from 'react-icons/fi';

const Wishlist = () => {
  const { items } = useWishlist();

  return (
    <div className="page-container">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', textAlign: 'center' }}>My Wishlist</h1>

        {items.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 0' }}>
            <FiHeart size={64} color="var(--muted)" style={{ opacity: 0.5, marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '16px', color: 'var(--muted)' }}>Your wishlist is empty</h2>
            <Link to="/shop" className="btn-primary">
              Discover Favorites
            </Link>
          </div>
        ) : (
          <div 
            className="products-grid" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '32px' 
            }}
          >
            {items.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
