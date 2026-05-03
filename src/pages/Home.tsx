import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import ProductCard from '../components/product/ProductCard';
import Loader from '../components/ui/Loader';
import { useFeaturedProducts, useProducts } from '../hooks/useProducts';
import { CATEGORIES, getCategoryDisplayName } from '../types';
import './Home.css';

const categoryIcons: Record<string, string> = {
  Necklaces: '/icons/necklaces.png',
  Earrings: '/icons/earrings.png',
  Bracelets: '/icons/bracelets.png',
  'Hair Accessories': '/icons/hair_accessories.png',
  Rings: '/icons/rings.png',
};

const Home = () => {
  const { products: featured, loading: featuredLoading } = useFeaturedProducts();
  const { products: allProducts, loading: allLoading } = useProducts();

  const displayProducts = featured.length > 0 ? featured : allProducts.slice(0, 8);
  const loading = featuredLoading && allLoading;

  return (
    <main className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="hero-shape shape-1" />
          <div className="hero-shape shape-2" />
          <div className="hero-shape shape-3" />
        </div>
        <div className="hero-content">
          <motion.span
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            ✨ Handcrafted with love
          </motion.span>
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Elegance <span className="title-accent">Redefined</span>
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Discover our curated collection of jewelry &amp; accessories designed
            for the modern, elegant woman.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link to="/shop" className="btn-primary hero-btn">
              Shop Now <FiArrowRight />
            </Link>
            <a
              href="https://wa.me/2348063221557"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp hero-btn"
            >
              <FaWhatsapp size={18} /> Chat with us
            </a>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Shop by Category</h2>
          <p>Find exactly what you're looking for</p>
        </motion.div>
        <div className="categories-grid">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/shop?category=${encodeURIComponent(cat)}`}
                className="category-card"
              >
                <img src={categoryIcons[cat]} alt={cat} className="category-icon" />
                <span className="category-name">{getCategoryDisplayName(cat)}</span>
                <FiArrowRight className="category-arrow" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured / Recent Products */}
      <section className="section products-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>{featured.length > 0 ? 'Featured Pieces' : 'Latest Arrivals'}</h2>
          <p>Curated just for you</p>
        </motion.div>
        {loading ? (
          <Loader />
        ) : displayProducts.length === 0 ? (
          <div className="empty-state">
            <p>No products yet. Check back soon! 🌸</p>
          </div>
        ) : (
          <div className="products-grid">
            {displayProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
        {displayProducts.length > 0 && (
          <motion.div
            className="section-cta"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/shop" className="btn-outline">
              View All Products <FiArrowRight />
            </Link>
          </motion.div>
        )}
      </section>

      {/* WhatsApp CTA */}
      <section className="whatsapp-cta">
        <motion.div
          className="whatsapp-cta-content"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Have Questions?</h2>
          <p>Chat with us directly on WhatsApp for personalized recommendations</p>
          <a
            href="https://wa.me/2348063221557"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <FaWhatsapp size={20} /> Message Us on WhatsApp
          </a>
        </motion.div>
      </section>
    </main>
  );
};

export default Home;
