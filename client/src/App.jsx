import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import MobileMenu from './components/layout/MobileMenu';
import SearchModal from './components/search/SearchModal';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import useKeyboardShortcut from './hooks/useKeyboardShortcut';

// Lazy-loaded pages
import Dashboard from './pages/Dashboard';
import Vaults from './pages/Vaults';
import VaultDetail from './pages/VaultDetail';
import ResourceDetailPage from './pages/ResourceDetailPage';
import AddResource from './pages/AddResource';
import Profile from './pages/Profile';
import SharedVault from './pages/SharedVault';

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dummy, setDummy] = useState(null);

  useKeyboardShortcut(['ctrl+k'], () => setSearchOpen(true));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        onSearchClick={() => setSearchOpen(true)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          onMenuClick={() => setMobileMenuOpen(true)}
          onSearchClick={() => setSearchOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vaults" element={<Vaults />} />
            <Route path="/vaults/:id" element={<VaultDetail />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />
            <Route path="/add" element={<AddResource />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/shared/:token" element={<SharedVault />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/*" element={<AppLayout />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
