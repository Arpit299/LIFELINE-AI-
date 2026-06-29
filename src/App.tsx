import React, { useEffect, useState } from 'react';
import { subscribeToAuth, AuthUser, logoutUser } from './lib/auth';
import { useTaskStore } from './store/taskStore';
import { useUIStore } from './store/uiStore';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import Dashboard from './pages/Dashboard';
import FocusPage from './pages/FocusPage';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import { CelebrationOverlay } from './components/features/CelebrationOverlay';

export default function App() {
  const { loadLocalTasks, syncWithFirestore, setDemoMode, demoMode } = useTaskStore();
  const { currentTab } = useUIStore();
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // 1. Check URL parameters for explicit Demo Mode activation
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
      setDemoMode(true);
      localStorage.setItem('lifeline_demo_mode', 'true');
    }

    // 2. Subscribe to Firebase Auth
    const unsubscribeAuth = subscribeToAuth((authUser) => {
      setUser(authUser);
      setAuthLoading(false);

      if (authUser) {
        if (authUser.isDemo) {
          setDemoMode(true);
          loadLocalTasks();
        } else {
          setDemoMode(false);
          // Sync with Firestore
          const unsubscribeDb = syncWithFirestore(authUser.uid);
          return () => {
            unsubscribeDb();
          };
        }
      } else {
        // If logged out, load local tasks or show login
        loadLocalTasks();
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  const handleLoginSuccess = (authUser: AuthUser) => {
    setUser(authUser);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-space-950 flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin" />
        </div>
        <span className="text-2xs text-white/30 font-mono tracking-widest uppercase">Initializing Sec-Shell...</span>
      </div>
    );
  }

  // If not logged in, render the login page
  if (!user) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <Toaster position="bottom-right" toastOptions={{ style: { backgroundColor: '#090910', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '12px' } }} />
      </>
    );
  }

  // Map active tabs to page views
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'focus':
        return <FocusPage />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col text-white antialiased">
      {/* Top Navbar Header */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Structural Body */}
      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Content Panel Area */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-73px)] custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Mobile Tabbed Navigation */}
      <MobileNav />

      {/* Global Celebratory Overlay */}
      <CelebrationOverlay />

      {/* Toast Overlay Notifications */}
      <Toaster position="bottom-right" toastOptions={{ style: { backgroundColor: '#090910', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '12px' } }} />
    </div>
  );
}
