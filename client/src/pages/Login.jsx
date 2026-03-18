import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github, BookOpen } from 'lucide-react';

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authError = searchParams.get('error') === 'auth_failed';
  const serverUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true });
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">DevVault</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Stop losing what you learn. Save, organize,<br />and track your developer knowledge.</p>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-400">
            Authentication failed. Please try again.
          </div>
        )}

        <a
          href={`${serverUrl}/auth/github`}
          className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </a>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">Free forever. No credit card needed.</p>
      </div>
    </div>
  );
};

export default Login;
