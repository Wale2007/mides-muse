import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { generateWhatsAppLink } from '../utils/whatsapp';
import toast from 'react-hot-toast';
import './Cart.css';

const Cart = () => {
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cart-empty-content"
          >
            <FiShoppingBag size={64} className="cart-empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet</p>
            <Link to="/shop" className="btn-primary">
              Browse Products
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  const whatsappLink = generateWhatsAppLink(items, total);

  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (user) {
      try {
        // Create order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            total_amount: total,
            status: 'Pending'
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map(item => ({
          order_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price_at_time: item.product.price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        clearCart();
        window.open(whatsappLink, '_blank');
      } catch (err: any) {
        console.error('Checkout error:', err);
        toast.error('Failed to process order. Opening WhatsApp anyway...');
        window.open(whatsappLink, '_blank');
      }
    } else {
      // Guest checkout (doesn't save to DB for now, just goes to WhatsApp)
      window.open(whatsappLink, '_blank');
      clearCart();
    }
  };

  return (
    <main className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p>{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                className="cart-item"
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Link
                  to={`/product/${item.product.id}`}
                  className="cart-item-image-wrap"
                >
                  <img
                    src={item.product.images?.[0] || '/placeholder.svg'}
                    alt={item.product.name}
                  />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.product.id}`} className="cart-item-name">
                    {item.product.name}
                  </Link>
                  <span className="cart-item-category">{item.product.category}</span>
                  <p className="cart-item-price">₦{item.product.price.toLocaleString()}</p>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-controls">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <FiMinus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <p className="cart-item-subtotal">
                    ₦{(item.product.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.product.id)}
                    aria-label="Remove item"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button className="clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        <motion.div
          className="order-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items ({itemCount})</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="btn-whatsapp checkout-btn"
          >
            <FaWhatsapp size={20} /> Complete Order via WhatsApp
          </button>
          <p className="checkout-note">
            You'll be redirected to WhatsApp to confirm your order with the seller.
          </p>
        </motion.div>
      </div>
    </main>
  );
};

export default Cart;
