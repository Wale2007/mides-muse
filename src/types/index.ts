export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  images: string[];
  stock: number;
  featured: boolean;
  createdAt: number;
}

export type Category =
  | 'Necklaces'
  | 'Earrings'
  | 'Bracelets'
  | 'Hair Accessories'
  | 'Rings';

export const CATEGORIES: Category[] = [
  'Necklaces',
  'Earrings',
  'Bracelets',
  'Hair Accessories',
  'Rings',
];

export const getCategoryDisplayName = (cat: string) => {
  if (cat === 'Necklaces') return 'Necklaces/Chain';
  if (cat === 'Hair Accessories') return 'Hair/Hand Accessories';
  return cat;
};

export interface CartItem {
  product: Product;
  quantity: number;
}
