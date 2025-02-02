import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Tipos
interface User {
  id: string;
  email: string;
  userType: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SIGN_OUT' };

  interface AuthContextType {
    state: AuthState;
    user: User | null; // Agregamos acceso directo a user
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, userType: string) => Promise<void>;
    signOut: () => Promise<void>;
  }
  


// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SIGN_OUT':
      return { user: null, loading: false, error: null };
    default:
      return state;
  }
};

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null
  });

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkSession();
  }, []);

  // Simular una llamada a la API para autenticación
  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Aquí irían tus llamadas reales a la API
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }

      const userData = await response.json();
      localStorage.setItem('user', JSON.stringify(userData));
      dispatch({ type: 'SET_USER', payload: userData });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userType: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Aquí irían tus llamadas reales a la API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType }),
      });

      if (!response.ok) {
        throw new Error('Error en el registro');
      }

      const userData = await response.json();
      localStorage.setItem('user', JSON.stringify(userData));
      dispatch({ type: 'SET_USER', payload: userData });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Aquí irían tus llamadas reales a la API
      await fetch('/api/auth/signout', {
        method: 'POST',
      });

      localStorage.removeItem('user');
      dispatch({ type: 'SIGN_OUT' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ state, user: state.user, signIn, signUp, signOut }}>

      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}