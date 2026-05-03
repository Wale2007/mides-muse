import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/product/ProductCard';
import Loader from '../components/ui/Loader';
import { useProducts } from '../hooks/useProducts';
import { CATEGORIES, getCategoryDisplayName, type Category } from '../types';
import './Shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as Category | null;
  const [activeCategory, setActiveCategory] = useState<Category | undefined>(
    categoryParam || undefined
  );

  useEffect(() => {
    const cat = searchParams.get('category') as Category | null;
    setActiveCategory(cat || undefined);
  }, [searchParams]);

  const { products, loading } = useProducts(activeCategory);

  const handleCategoryChange = (cat?: Category) => {
    setActiveCategory(cat);
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
  };

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {activeCategory ? getCategoryDisplayName(activeCategory) : 'All Products'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {products.length} {products.length === 1 ? 'product' : 'products'} available
        </motion.p>
      </section>

      <section className="shop-content">
        <div className="filter-bar">
          <button
            className={`filter-pill ${!activeCategory ? 'active' : ''}`}
            onClick={() => handleCategoryChange(undefined)}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {getCategoryDisplayName(cat)}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found in this category. 🌸</p>
          </div>
        ) : (
          <motion.div
            className="products-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
};

export default Shop;
