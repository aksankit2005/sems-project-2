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
  UserCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ activeTab, setActiveTab, onOpenIssueModal, onOpenGatePassModal, currentUser, onLogout }) {
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'equipment', label: 'Equipment & Loans', icon: Package },
    { id: 'students', label: 'Students Directory', icon: Users },
    { id: 'reports', label: 'Reports & Logs', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/95 dark:bg-[#020617]/95 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo & Title with APEX Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            {/* Real APEX Logo with transparent background */}
            <div className="flex items-center py-0.5">
              <img 
                src="/apex-logo.png" 
                alt="APEX Sports" 
                className="h-7 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105 dark:drop-shadow-[0_1px_10px_rgba(255,255,255,0.3)] drop-shadow-xs" 
              />
            </div>
            
            <div className="hidden sm:flex flex-col">
              <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200 tracking-normal leading-tight">
                Hostel Sports Attendance & Equipment
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                MPGI Sports Fest 2026
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs font-bold' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-white' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Live Indicator (Desktop only) */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Session 2026</span>
            </div>

            {/* Day Scholar Gate Pass CTA */}
            <button
              onClick={onOpenGatePassModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all duration-150 active:scale-95 cursor-pointer whitespace-nowrap"
              title="Create Day Scholar Gate Pass for Security Guard"
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
              <span className="hidden sm:inline">Gate Pass</span>
              <span className="sm:hidden">Pass</span>
            </button>

            {/* Issue Gear Quick CTA */}
            <button
              onClick={onOpenIssueModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-sm shadow-blue-500/25 transition-all duration-150 active:scale-95 cursor-pointer border border-white/20 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Issue Gear</span>
              <span className="sm:hidden">Issue</span>
            </button>

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all duration-150 cursor-pointer active:scale-90 shadow-2xs"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Lock & Logout (sems_campus)"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition-all duration-150 cursor-pointer active:scale-90 shadow-2xs"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
