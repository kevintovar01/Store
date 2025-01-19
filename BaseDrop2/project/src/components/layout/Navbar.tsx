import React from 'react';
import { ShoppingCart, User, Menu, Settings } from 'lucide-react';
import { useCart } from '../../store/CartContext';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { state } = useCart();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">ShopDrop</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link to="/store" className="text-gray-700 hover:text-blue-600 px-3 py-2">
              Store
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-600 px-3 py-2">
              Products
            </Link>
            <Link to="/virtual-try-on" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-200">Virtual Try-On</Link>
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 p-2">
              <ShoppingCart className="w-6 h-6" />
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.items.length}
                </span>
              )}
            </Link>
            <Link to="/account" className="text-gray-700 hover:text-blue-600 p-2">
              <User className="w-6 h-6" />
            </Link>
            <Link to="/admin" className="text-gray-700 hover:text-blue-600 p-2">
              <Settings className="w-6 h-6" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/store"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Store
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Products
            </Link>
            <Link
              to="/cart"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Cart ({state.items.length})
            </Link>
            <Link
              to="/account"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Account
            </Link>
            <Link
              to="/admin"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};