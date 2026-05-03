import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiMinus, FiPlus } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { generateSingleProductLink } from '../utils/whatsapp';
import Loader from '../components/ui/Loader';
import HoverMagnifier from '../components/ui/HoverMagnifier';
import ReviewSection from '../components/product/ReviewSection';
import RelatedProducts from '../components/product/RelatedProducts';
import { getCategoryDisplayName, type Product, type Category } from '../types';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
      } else if (data) {
        setProduct({
          id: data.id,
          name: data.name,
          price: data.price,
          category: data.category as Category,
          description: data.description || '',
          images: data.images || [],
          stock: data.stock || 0,
          featured: data.featured || false,
          createdAt: new Date(data.created_at).getTime(),
        });
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="page-container"><Loader /></div>;
  if (!product) return <div className="page-container"><p className="empty-state">Product not found.</p></div>;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <main className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>
          {getCategoryDisplayName(product.category)}
        </Link>
        <span>/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-detail-layout">
        {/* Image Gallery */}
        <motion.div
          className="product-gallery"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="gallery-main" style={{ position: 'relative', overflow: 'visible' }}>
            <HoverMagnifier 
              src={product.images?.[selectedImage] || '/placeholder.svg'}
              alt={product.name}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="gallery-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`gallery-thumb ${i === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          className="product-info"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="product-detail-category">{getCategoryDisplayName(product.category)}</span>
          <h1 className="product-detail-name">{product.name}</h1>
          <p className="product-detail-price">₦{product.price.toLocaleString()}</p>

          {product.description && (
            <p className="product-detail-desc">{product.description}</p>
          )}

          {product.stock === 0 ? (
            <div className="sold-out-message" style={{ margin: '20px 0', padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '8px', fontWeight: 'bold' }}>
              Currently Sold Out
            </div>
          ) : (
            <div className="quantity-selector">
              <span className="qty-label">Quantity</span>
              <div className="qty-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <FiMinus />
                </button>
                <span className="qty-value">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                  <FiPlus />
                </button>
              </div>
            </div>
          )}

          <div className="product-detail-actions">
            <button 
              className="btn-primary btn-lg" 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <FiShoppingBag /> {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
            {product.stock > 0 && (
              <a
                href={generateSingleProductLink(product.name, product.price, quantity)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp btn-lg"
              >
                <FaWhatsapp size={18} /> Buy via WhatsApp
              </a>
            )}
          </div>

          {product.stock !== undefined && product.stock > 0 && (
            <p className="stock-info">✓ {product.stock} in stock</p>
          )}
        </motion.div>
      </div>

      <div className="product-detail-bottom-sections" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <ReviewSection productId={product.id} />
        <RelatedProducts currentProductId={product.id} category={product.category} />
      </div>
    </main>
  );
};

export default ProductDetail;
