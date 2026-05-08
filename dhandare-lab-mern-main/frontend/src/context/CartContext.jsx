import { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';

// 1. Create the Context
const CartContext = createContext();

// 2. Create the Provider Component
export const CartProvider = ({ children }) => {
  // Try to load cart from local storage first, so if they refresh, the cart stays!
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('labCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Whenever the cart changes, save it to local storage
  useEffect(() => {
    localStorage.setItem('labCart', JSON.stringify(cart));
  }, [cart]);

  // Function to add a test to the cart
  const addToCart = (test) => {
    // Check if test is already in cart to prevent duplicates
    const isAlreadyInCart = cart.find((item) => item._id === test._id);
    if (isAlreadyInCart) {
      toast.error(`${test.name} is already in your cart!`);
      return;
    }
    setCart([...cart, test]);
    toast.success(`${test.name} added to cart!`);
  };

  // Function to remove a test
  const removeFromCart = (testId) => {
    setCart(cart.filter((item) => item._id !== testId));
  };

  // Function to clear the cart entirely (after successful booking)
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('labCart');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. Custom hook to make it easy to use in other files
export const useCart = () => useContext(CartContext);