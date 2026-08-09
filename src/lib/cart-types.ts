export type CartItem = {
  id: string;
  qty: number;
};

export type CartDetailedItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  qty: number;
  lineTotal: number;
};

export type CartSummary = {
  items: CartDetailedItem[];
  subtotal: number;
  count: number;
};

export type CartActionResult = {
  error?: string;
  cart: CartSummary;
};
