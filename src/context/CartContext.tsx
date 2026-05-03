import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product, CartItem } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

const STORAGE_KEY = 'mides-muse-cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync from Supabase on login
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setIsInitialized(true);
        return;
      }
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          products:product_id (*)
        `)
        .eq('user_id', user.id);

      if (!error && data) {
        // Merge Supabase with LocalStorage
        const localItems = [...items];
        let merged = [...localItems];
        
        for (const dbItem of data as any[]) {
          if (!dbItem.products) continue;
          
          const product = {
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

          const existingIndex = merged.findIndex(i => i.product.id === product.id);
          if (existingIndex >= 0) {
            // Take the higher quantity, or just DB
            merged[existingIndex].quantity = Math.max(merged[existingIndex].quantity, dbItem.quantity);
          } else {
            merged.push({ product, quantity: dbItem.quantity });
          }
        }
        
        setItems(merged);
        
        // Push merged state back to Supabase in background
        if (merged.length > 0) {
          const upserts = merged.map(i => ({
            user_id: user.id,
            product_id: i.product.id,
            quantity: i.quantity
          }));
          supabase.from('cart_items').upsert(upserts).then();
        }
      }
      setIsInitialized(true);
    };

    if (user && !isInitialized) {
      fetchCart();
    }
  }, [user, isInitialized]);

  // Sync to LocalStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = async (product: Product, qtyToAdd = 1) => {
    const existing = items.find(i => i.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const newQty = currentQty + qtyToAdd;

    if (newQty > product.stock) {
      toast.error(`Only ${product.stock} available in stock`);
      return;
    }

    setItems((prev) => {
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: newQty } : i);
      }
      return [...prev, { product, quantity: qtyToAdd }];
    });
    
    toast.success(existing ? 'Cart updated!' : 'Added to cart!');

    if (user) {
      supabase.from('cart_items').upsert({
        user_id: user.id,
        product_id: product.id,
        quantity: newQty
      }).then();
    }
  };

  const removeFromCart = async (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    toast.success('Removed from cart');
    
    if (user) {
      supabase.from('cart_items').delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .then();
    }
  };

  const updateQuantity = async (productId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    
    const existing = items.find(i => i.product.id === productId);
    if (existing && qty > existing.product.stock) {
      toast.error(`Only ${existing.product.stock} available in stock`);
      return;
    }

    setItems((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)));

    if (user) {
      supabase.from('cart_items').update({ quantity: qty })
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .then();
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      supabase.from('cart_items').delete().eq('user_id', user.id).then();
    }
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
