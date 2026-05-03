import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType);

const STORAGE_KEY = 'mides-muse-wishlist';

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setIsInitialized(true);
        return;
      }
      
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          products:product_id (*)
        `)
        .eq('user_id', user.id);

      if (!error && data) {
        const localItems = [...items];
        let merged = [...localItems];
        
        for (const dbItem of data as any[]) {
          if (!dbItem.products) continue;
          
          const product: Product = {
            id: dbItem.products.id,
            name: dbItem.products.name,
            price: dbItem.products.price,
            category: dbItem.products.category,
            description: dbItem.products.description,
            images: dbItem.products.images,
            stock: dbItem.products.stock,
            featured: dbItem.products.featured,
            createdAt: new Date(dbItem.products.created_at).getTime(),
          };

          if (!merged.find(i => i.id === product.id)) {
            merged.push(product);
          }
        }
        
        setItems(merged);
        
        if (merged.length > 0) {
          const upserts = merged.map(i => ({
            user_id: user.id,
            product_id: i.id,
          }));
          supabase.from('wishlists').upsert(upserts, { onConflict: 'user_id,product_id' }).then();
        }
      }
      setIsInitialized(true);
    };

    if (user && !isInitialized) {
      fetchWishlist();
    }
  }, [user, isInitialized]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToWishlist = async (product: Product) => {
    setItems((prev) => {
      if (prev.find(i => i.id === product.id)) return prev;
      toast.success('Added to wishlist', { icon: '❤️' });
      return [...prev, product];
    });

    if (user) {
      supabase.from('wishlists').upsert({
        user_id: user.id,
        product_id: product.id,
      }).then();
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
    toast.success('Removed from wishlist');
    
    if (user) {
      supabase.from('wishlists').delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .then();
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some((i) => i.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
