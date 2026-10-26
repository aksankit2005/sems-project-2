import React from 'react';
import { 
  Trophy, 
  Sun, 
  Moon, 
  PlusCircle, 
  LayoutDashboard, 
  CalendarCheck, 
  Package, 
  Users, 
  BarChart3,
  ShieldCheck,
  LogOut,
  Bell,
  User
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ activeTab, setActiveTab, onOpenIssueModal, onOpenGatePassModal, currentUser, onLogout }) {
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'equipment', label: 'Equipment & Loans', icon: Package },
    { id: 'students', label: 'Players Roster', icon: Users },
    { id: 'reports', label: 'Reports & Logs', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/95 dark:bg-[#070818]/90 border-b border-slate-200 dark:border-[#1a1d3b] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Brand Logo matching mpgisports.in */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <img 
              src="/apex-logo.png" 
              alt="APEX Sports" 
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </div>

          {/* Desktop Navigation Links (Clean, subtle purple active pill matching mpgisports.in) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#7156a5]/10 border border-[#7156a5]/30 text-[#7156a5] dark:bg-[#1e1935] dark:border-[#7156a5]/50 dark:text-white font-semibold shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#12152e]/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#7156a5] dark:text-[#b8a5e5]' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions matching mpgisports.in */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Gate Pass action button */}
            <button
              onClick={onOpenGatePassModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 dark:text-slate-300 dark:bg-[#12152e] dark:hover:bg-[#1a1d3d] border border-slate-200 dark:border-slate-800 hover:border-[#7156a5]/40 shadow-2xs transition-all cursor-pointer"
              title="Create Day Scholar Gate Pass for Security Guard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#7156a5] dark:text-[#b8a5e5]" />
              <span>Gate Pass</span>
            </button>

            {/* Primary Issue Gear CTA (Unified Purple matching mpgisports.in) */}
            <button
              onClick={onOpenIssueModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#7156a5] hover:bg-[#5e458e] border border-[#8b5cf6]/30 shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Issue Gear</span>
            </button>

            {/* Dark/Light Mode Switcher (Simple clean circle) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white hover:bg-slate-50 dark:bg-[#12152e] dark:hover:bg-[#1a1d3d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>

            {/* User Profile Pill matching mpgisports.in header */}
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white dark:bg-[#12152e] border border-slate-200 dark:border-slate-800 shadow-2xs text-xs">
                <div className="w-6 h-6 rounded-full bg-[#7156a5] text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.username ? currentUser.username[0].toUpperCase() : 'A'}
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                    {currentUser.username || 'Natwar kumar jha'}
                  </span>
                  <span className="text-[9px] text-[#7156a5] dark:text-[#b8a5e5] uppercase font-bold tracking-wider">
                    SPORT COORD
                  </span>
                </div>
              </div>
            )}

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Lock & Logout"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
