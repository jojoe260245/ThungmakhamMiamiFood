import { create } from 'zustand';

export interface CartItem {
  id: string; // Unique ID for the cart item (since same menu can have different notes)
  menuId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  note?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (newItem) => {
    set((state) => {
      // Check if item with same menuId and note already exists
      const existingItemIndex = state.items.findIndex(
        (i) => i.menuId === newItem.menuId && i.note === newItem.note
      );

      if (existingItemIndex > -1) {
        // Increase quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return { items: updatedItems };
      }

      // Add new item with a generated ID
      const id = `${newItem.menuId}-${Date.now()}`;
      return { items: [...state.items, { ...newItem, id }] };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.id !== id) };
      }
      return {
        items: state.items.map((i) => 
          i.id === id ? { ...i, quantity } : i
        ),
      };
    });
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
}));
