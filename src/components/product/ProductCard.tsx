import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiHeart } from 'react-icons/fi';
import type { Product } from '../../types';
import { getCategoryDisplayName } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import './ProductCard.css';

interface Props {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: Props) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.id}`} className="product-card-image-wrap">
        <img
          src={product.images?.[0] || '/placeholder.svg'}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />
        <span className="product-card-category">{getCategoryDisplayName(product.category)}</span>
        {product.stock === 0 && (
          <span className="sold-out-badge">Sold Out</span>
        )}
      </Link>
      <button 
        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
        }}
        aria-label="Toggle wishlist"
      >
        <FiHeart size={20} fill={isWishlisted ? "var(--rose-gold)" : "none"} color={isWishlisted ? "var(--rose-gold)" : "var(--dark)"} />
      </button>
      <div className="product-card-info">
        <Link to={`/product/${product.id}`} className="product-card-name">
          {product.name}
        </Link>
        <div className="product-card-bottom">
          <span className="product-card-price">₦{product.price.toLocaleString()}</span>
          <button
            className="product-card-add"
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
            disabled={product.stock === 0}
          >
            <FiShoppingBag size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
