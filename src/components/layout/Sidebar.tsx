import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { LayoutDashboard, Target, BarChart3, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab } = useUIStore();

  const navigation = [
    { id: 'dashboard', name: 'Intel Backlog', icon: LayoutDashboard },
    { id: 'focus', name: 'Tactical Focus', icon: Target },
    { id: 'analytics', name: 'Analytics Velocity', icon: BarChart3 },
  ] as const;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-black/40 border-r border-glass-border p-4 gap-6 h-[calc(100vh-73px)]">
      <div className="flex flex-col gap-1.5">
        <span className="text-3xs font-bold uppercase tracking-widest text-white/30 px-3 font-mono">Operations Command</span>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all border cursor-pointer ${
                isActive 
                  ? 'bg-violet/10 text-white border-violet/20 shadow-lg shadow-violet/10 font-bold' 
                  : 'text-white/50 border-transparent hover:text-white/80 hover:bg-white/[0.02]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-violet' : 'text-white/40'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
export default Sidebar;
