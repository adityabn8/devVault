import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refetchUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('[AuthCallback] token from URL:', token ? token.substring(0, 20) + '...' : 'NULL');
    console.log('[AuthCallback] full URL:', window.location.href);
    if (token) {
      localStorage.setItem('dv_token', token);
      console.log('[AuthCallback] token saved, calling refetchUser');
      refetchUser().then(() => navigate('/dashboard', { replace: true }));
    } else {
      navigate('/?error=auth_failed', { replace: true });
    }
  }, [searchParams, navigate, refetchUser]);

  return null;
};

export default AuthCallback;
