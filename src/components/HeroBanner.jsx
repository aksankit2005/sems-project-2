import React from 'react';
import { Trophy, ShieldCheck, Flame, ArrowUpRight } from 'lucide-react';

export default function HeroBanner({ stats, setActiveTab, onOpenIssueModal, onOpenGatePassModal }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#0b1329] to-[#0f172a] border border-amber-500/20 p-5 sm:p-7 text-white shadow-xl shadow-blue-950/20 mb-6">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Column: Title & Mission */}
        <div className="flex flex-col gap-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <img 
              src="/apex-logo.png" 
              alt="APEX Championship 2026" 
              className="h-8 sm:h-10 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.35)]" 
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/15 border border-amber-400/35 text-amber-300 uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              CHAMPIONSHIP 2026
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Official Hostel Sports System
            </span>
          </div>

          <h1 className="font-brand text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
            Hostel Sports Attendance & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
              Equipment Management System
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Mark daily attendance across 12 sports, track Hostellers vs Day Scholars, log room numbers, and manage sports gear issuing & returns with real-time stock reconciliation.
          </p>

          {/* Quick Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <button
              onClick={() => setActiveTab('attendance')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Take Sports Attendance</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenIssueModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/15 border border-white/20 text-slate-100 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Quick Issue Gear</span>
            </button>
            <button
              onClick={onOpenGatePassModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Day Scholar Gate Pass</span>
            </button>
          </div>
        </div>

        {/* Right Column: 4 KPI Quick Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:min-w-[340px]">
          
          {/* Card 1: Attendance Rate */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.attendanceRate || 88}%</span>
              <span className="text-[11px] text-emerald-500 font-bold">▲ High</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Across 12 sports disciplines</span>
          </div>

          {/* Card 2: Active Players */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Players</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400">{stats.totalStudents || 12}</span>
              <span className="text-[11px] text-slate-300 font-medium">({stats.hostellers || 9} Hostellers)</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{stats.dayScholars || 3} Day Scholars registered</span>
          </div>

          {/* Card 3: Issued Gear */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Loans</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stats.activeLoans || 0}</span>
              {stats.overdueLoans > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse">
                  {stats.overdueLoans} Overdue
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Equipment currently issued</span>
          </div>

          {/* Card 4: Equipment Inventory */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Gear Units</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-300">{stats.totalEquipmentItems || 95}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{stats.issuedEquipmentItems || 25} units deployed in games</span>
          </div>

        </div>

      </div>

    </div>
  );
}
