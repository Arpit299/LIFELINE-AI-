import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { LayoutDashboard, Target, BarChart3, Settings } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentTab, setCurrentTab } = useUIStore();

  const navigation = [
    { id: 'dashboard', name: 'Intel', icon: LayoutDashboard },
    { id: 'focus', name: 'Focus', icon: Target },
    { id: 'analytics', name: 'Velocity', icon: BarChart3 },
  ] as const;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-surface/80 backdrop-blur-xl border-t border-glass-border py-2 px-4 flex justify-around items-center z-40 pb-safe">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-all cursor-pointer ${
              isActive ? 'text-violet font-bold scale-105' : 'text-white/40'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-3xs font-medium">{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
};
export default MobileNav;
