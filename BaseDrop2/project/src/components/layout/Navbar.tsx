import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, User, Menu, Settings, LogIn, UserPlus } from 'lucide-react';
import { useCart } from '../../store/CartContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { state } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const checkAuthStatus = useCallback(() => {
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);
  }, []);

  useEffect(() => {
    checkAuthStatus();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuthStatus]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/login');
    setIsMenuOpen(false);
  }, [navigate]);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">COLineStore</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {/**<Link to="/store" className="text-gray-700 hover:text-blue-600 px-3 py-2">
              Store
            </Link>*/}
            <Link to="/products" className="text-gray-700 hover:text-blue-600 px-3 py-2">
              Products
            </Link>
            <Link to="/virtual-try-on" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-200">
              Virtual Try-On
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 p-2">
              <ShoppingCart className="w-6 h-6" />
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.items.length}
                </span>
              )}
            </Link>

            {/* Authentication Links */}
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/login" 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/account" 
                    className="text-gray-700 hover:text-blue-600 p-2"
                    aria-label="Account"
                  >
                    <User className="w-6 h-6" />
                  </Link>
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-blue-600 p-2"
                    aria-label="Settings"
                  >
                    <Settings className="w-6 h-6" />
                  </Link>
                  {/*<button 
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Logout
                  </button>*/}
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/**<Link 
                to="/store" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Store
              </Link>*/}
              <Link 
                to="/products" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Products
              </Link>
              <Link 
                to="/virtual-try-on" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Virtual Try-On
              </Link>
              
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/account" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Account
                  </Link>
                  <Link 
                    to="/admin" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Admin
                  </Link>
                  {/*<button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-gray-50"
                  >
                    Logout
                  </button>*/}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};