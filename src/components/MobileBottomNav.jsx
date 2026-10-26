import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Package, 
  Users, 
  BarChart3 
} from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'equipment', label: 'Equipment', icon: Package },
    { id: 'students', label: 'Players', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden backdrop-blur-xl bg-white/95 dark:bg-[#020617]/95 border-t border-amber-500/20 dark:border-[#7156a5]/30 px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl shadow-black/30 transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-amber-500 dark:text-amber-400 font-black scale-105' 
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-amber-300'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-amber-500/15 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 shadow-xs' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-bold">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-0.5 shadow-[0_0_8px_rgba(210,171,69,0.8)]"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
