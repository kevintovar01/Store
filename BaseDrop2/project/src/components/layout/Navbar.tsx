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

  // Función de verificación de autenticación más robusta
  const checkAuthStatus = useCallback(() => {
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);
  }, []);

  // Efecto para manejar cambios de autenticación
  useEffect(() => {
    // Verificar estado inicial de autenticación
    checkAuthStatus();

    // Escuchar eventos de almacenamiento para cambios en múltiples pestañas/ventanas
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Configurar un observador personalizado para cambios en localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const event = new Event('storage');
      (event as any).key = key;
      (event as any).newValue = value;
      originalSetItem.apply(this, arguments as any);
      window.dispatchEvent(event);
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, [checkAuthStatus]);

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/login'); // Redirigir a página de login
    setIsMenuOpen(false); // Cerrar menú móvil
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">ShopDrop</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link to="/store" className="text-gray-700 hover:text-blue-600 px-3 py-2">Store</Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-600 px-3 py-2">Products</Link>
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

            <div className="hidden sm:flex sm:items-center sm:space-x-8">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 p-2 flex items-center">
                <LogIn className="w-5 h-5 mr-1" /> Login
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-blue-600 p-2 flex items-center">
                <UserPlus className="w-5 h-5 mr-1" /> Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/account" className="text-gray-700 hover:text-blue-600 p-2">
                <User className="w-6 h-6" />
              </Link>
              <Link to="/admin" className="text-gray-700 hover:text-blue-600 p-2">
                <Settings className="w-6 h-6" />
              </Link>
              {/**<button 
                onClick={handleLogout} 
                className="text-gray-700 hover:text-red-600 p-2"
              >
                Logout
              </button> */}
            </>
          )}
        </div>

          {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
      {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {/* Otras opciones de menú */}
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                    Login
                  </Link>
                  <Link to="/register" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/account" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                    Account
                  </Link>
                  <Link to="/admin" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                    Admin
                  </Link>
                  {/** <button 
                    onClick={handleLogout} 
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600"
                  >
                    Logout
                  </button> */}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};