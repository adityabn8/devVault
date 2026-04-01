import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { getMe, logout as logoutService } from '../services/authService';

const AuthContext = createContext(null);

const initialState = { user: null, loading: true, error: null };

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchUser = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data } = await getMe();
      dispatch({ type: 'SET_USER', payload: data.user });
    } catch {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } finally {
      localStorage.removeItem('dv_token');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const updateUser = useCallback((user) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, logout, updateUser, refetchUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
