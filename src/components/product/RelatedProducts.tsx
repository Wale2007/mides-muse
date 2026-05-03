import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ProductCard from './ProductCard';
import type { Product, Category } from '../../types';

interface RelatedProductsProps {
  currentProductId: string;
  category: Category;
}

const RelatedProducts = ({ currentProductId, category }: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', currentProductId)
        .limit(4);

      if (!error && data) {
        const mapped = data.map((p) => ({
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
    };

    fetchRelated();
  }, [category, currentProductId]);

  if (products.length === 0) return null;

  return (
    <div className="related-products-section" style={{ marginTop: '60px' }}>
      <h3 style={{ fontSize: '1.8rem', marginBottom: '24px', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>
        You May Also Like
      </h3>
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '24px' 
        }}
      >
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
