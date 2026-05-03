import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';

export const useProducts = (category?: Category) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        // Map snake_case DB fields to camelCase
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

    fetchProducts();

    // Real-time subscription
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  return { products, loading };
};

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured:', error);
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

    fetchFeatured();
  }, []);

  return { products, loading };
};
