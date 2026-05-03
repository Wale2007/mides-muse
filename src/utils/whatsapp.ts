import type { CartItem } from '../types';

const WHATSAPP_NUMBER = '2348063221557';

export const generateWhatsAppLink = (items: CartItem[], total: number): string => {
  let message = '🌸 *New Order from Mide\'s MUSE*\n\n';
  message += '━━━━━━━━━━━━━━━━━━━\n';

  items.forEach((item, index) => {
    message += `${index + 1}. *${item.product.name}*\n`;
    message += `   Category: ${item.product.category}\n`;
    message += `   Qty: ${item.quantity} × ₦${item.product.price.toLocaleString()}\n`;
    message += `   Subtotal: ₦${(item.product.price * item.quantity).toLocaleString()}\n\n`;
  });

  message += '━━━━━━━━━━━━━━━━━━━\n';
  message += `💰 *Total: ₦${total.toLocaleString()}*\n\n`;
  message += 'Please confirm availability and payment details. Thank you! 🙏';

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const generateSingleProductLink = (name: string, price: number, qty: number): string => {
  let message = '🌸 *Order from Mide\'s MUSE*\n\n';
  message += `Product: *${name}*\n`;
  message += `Qty: ${qty}\n`;
  message += `Price: ₦${(price * qty).toLocaleString()}\n\n`;
  message += 'I\'d like to order this. Please confirm availability! 🙏';

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
