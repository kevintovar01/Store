import React from 'react';
import { ShoppingCart, User, Menu, Settings, LogIn, UserPlus } from 'lucide-react';
import { useCart } from '../../store/CartContext';
import { useAuth } from '../../store/AuthContext';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { state } = useCart();
  const { user, signOut } = useAuth();
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
            <Link to="/virtual-try-on" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-200">
              Virtual Try-On
            </Link>
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 p-2">
              <ShoppingCart className="w-6 h-6" />
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.items.length}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/account" className="text-gray-700 hover:text-blue-600 p-2">
                  <User className="w-6 h-6" />
                </Link>
                {user.user_metadata.user_type === 'business' && (
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 p-2">
                    <Settings className="w-6 h-6" />
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2"
                >
                  <LogIn className="w-5 h-5 mr-1" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
                >
                  <UserPlus className="w-5 h-5 mr-1" />
                  Register
                </Link>
              </div>
            )}
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
            {user ? (
              <>
                <Link
                  to="/account"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                >
                  Account
                </Link>
                {user.user_metadata.user_type === 'business' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};