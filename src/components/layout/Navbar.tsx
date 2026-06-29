import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { Sparkles, Flame, LogOut, CheckCircle, Plus } from 'lucide-react';
import Button from '../ui/Button';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const { stats, demoMode, setDemoMode } = useTaskStore();
  const { setAddTaskModalOpen } = useUIStore();

  const handleToggleMode = () => {
    const nextMode = !demoMode;
    setDemoMode(nextMode);
    localStorage.setItem('lifeline_demo_mode', String(nextMode));
    // refresh page to reset hooks
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-bg-surface border-b border-glass-border py-4 px-6 flex items-center justify-between">
      {/* Brand Logo & System Status Badge */}
      <div className="flex items-center gap-3.5">
        <svg width="32" height="32" viewBox="0 0 32 32" className="flex-shrink-0 animate-pulse">
          <circle cx="16" cy="16" r="14" stroke="#8B5CF6" strokeWidth="2" fill="none" />
          <path d="M16 8v16M12 12l8 8" stroke="#06B6D4" strokeWidth="2" />
        </svg>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-white leading-none tracking-tight font-sans">LIFELINE AI</h1>
            <span className="bg-gradient-to-r from-violet to-cyan text-[9px] text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              
            </span>
          </div>
          <span className="text-4xs text-white/40 tracking-widest uppercase font-bold mt-1 font-mono">Deadline Intelligence</span>
        </div>
      </div>

      {/* Center/Right controls */}
      <div className="flex items-center gap-6">
        {/* Streak Indicator (Styled to match design) */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-4xs uppercase tracking-wider text-white/40 font-bold font-mono">Current Streak</div>
            <div className="font-mono font-bold text-xs text-violet">{stats.streak > 0 ? `${stats.streak} DAYS` : '0 DAYS'}</div>
          </div>
        </div>

        {/* Demo Mode Toggle Widget */}
        <button
          onClick={handleToggleMode}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-2xs font-bold border cursor-pointer transition-all ${
            demoMode 
              ? 'bg-violet/10 text-violet border-violet/20' 
              : 'bg-white/5 text-white/50 border-white/10 hover:text-white/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan" />
          <span>Demo Mode: {demoMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Create Task Action */}
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setAddTaskModalOpen(true)}
          className="gap-1.5 rounded-xl text-xs py-2"
        >
          <Plus className="w-4 h-4" />
          Capture
        </Button>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                referrerPolicy="no-referrer" 
                className="w-10 h-10 rounded-full bg-glass border border-violet shadow-lg shadow-violet/15 object-cover" 
              />
            ) : (
              <div className="w-10 h-10 bg-glass border border-violet rounded-full flex items-center justify-center text-xs font-bold font-mono text-violet shadow-lg shadow-violet/15">
                {user.displayName?.charAt(0) || 'D'}
              </div>
            )}
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold text-white/95">{user.displayName}</span>
              <span className="text-4xs text-white/40 font-mono">{user.email}</span>
            </div>
            
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 border border-transparent transition-all cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;
