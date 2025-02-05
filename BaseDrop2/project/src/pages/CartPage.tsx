import React, { useState, useEffect } from 'react';
import { useCart } from '../store/CartContext';
import { Button } from '../components/common/Button';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWishCar, addItemToWishCar, listItemsInWishCar, removeItemFromWishCar } from '../api/wishcar';

export const CartPage: React.FC = () => {
  const { state, dispatch } = useCart();
  const { isAuthenticated } = state;
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const token = localStorage.getItem('authToken');
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      if (token) {
        try {
          const cart = await getWishCar();
          setCartId(cart.id);
          dispatch({ type: 'SET_CART_ITEMS', payload: cart.items });
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      }
    };
    fetchCart();
  }, [token, dispatch]);

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1 || !cartId || !token) return;
    try {
      await addItemToWishCar(id);  // Se asume que esta función maneja la lógica del carrito
      const updatedCart = await listItemsInWishCar(cartId);
      dispatch({ type: 'SET_CART_ITEMS', payload: updatedCart.items });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (id: string) => {
    if (!token) return;
    try {
      await removeItemFromWishCar(id);
      if (cartId) {
        const updatedCart = await listItemsInWishCar(cartId);
        dispatch({ type: 'SET_CART_ITEMS', payload: updatedCart.items });
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    dispatch({ type: 'CLEAR_CART' });
    navigate('/account');
  };

  const handleLoginRedirect = () => {
    sessionStorage.setItem('returnUrl', '/cart');
    navigate('/login');
  };

  if (state.items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some products to your cart to continue shopping</p>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      <div className="space-y-6">
        {state.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            <img
              src={item.server_image_url}
              alt={item.name}
              className="w-24 h-24 object-cover rounded-md"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-gray-600">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded" disabled={item.quantity <= 1}>
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded" disabled={item.quantity >= item.stock}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right min-w-[100px]">
              <div className="font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
              <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between text-lg font-semibold mb-4">
          <span>Total</span>
          <span>${state.total.toFixed(2)}</span>
        </div>
        {isAuthenticated ? (
          <Button className="w-full" onClick={handleCheckout} isLoading={isCheckingOut} icon={<CreditCard className="w-5 h-5" />}>
            Proceed to Checkout
          </Button>
        ) : (
          <Button className="w-full" onClick={handleLoginRedirect} icon={<LogIn className="w-5 h-5" />}>
            Sign in to Checkout
          </Button>
        )}
      </div>
    </div>
  );
};
