import React from 'react';
import { Trophy, ShieldCheck, Flame, ArrowRight, PlusCircle, Users, Package, CalendarCheck } from 'lucide-react';

export default function HeroBanner({ stats, setActiveTab, onOpenIssueModal, onOpenGatePassModal }) {
  return (
    <div className="flex flex-col gap-6 py-2">
      
      {/* Top Title & Subtitle matching mpgisports.in header style */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto pt-2 pb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7156a5]/10 border border-[#7156a5]/25 text-[#7156a5] dark:bg-[#18142e] dark:border-[#7156a5]/35 dark:text-[#b8a5e5] text-xs font-semibold uppercase tracking-wider mb-3">
          <Trophy className="w-3.5 h-3.5 text-[#d2ab45]" />
          <span>Official Hostel Sports Portal & Attendance Desk</span>
        </div>

        <h1 className="font-brand text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          APEX SPORTS FEST 2026
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2.5 max-w-2xl leading-relaxed">
          Daily sports turnout tracking across 12 championship disciplines, hosteller vs day scholar rosters, room verification, and sports equipment inventory ledger.
        </p>

        {/* Action Buttons: Unified Purple & Adaptive Outlines */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
          <button
            onClick={() => setActiveTab('attendance')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#7156a5] hover:bg-[#5e458e] text-white shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Daily Attendance</span>
          </button>
          
          <button
            onClick={onOpenIssueModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 dark:bg-[#12152e] dark:hover:bg-[#1a1d3d] border border-slate-200 dark:border-slate-800 hover:border-[#7156a5]/40 text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#7156a5] dark:text-[#b8a5e5]" />
            <span>Issue Sports Gear</span>
          </button>

          <button
            onClick={onOpenGatePassModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 dark:bg-[#12152e] dark:hover:bg-[#1a1d3d] border border-slate-200 dark:border-slate-800 hover:border-[#7156a5]/40 text-slate-700 dark:text-slate-300 shadow-2xs transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Day Scholar Gate Pass</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Metric Cards matching mpgisports.in clean surface */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-1">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-[#7156a5]/40 shadow-2xs transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attendance Rate</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.attendanceRate || 88}%</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Average</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Across 12 disciplines</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-[#7156a5]/40 shadow-2xs transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered Players</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.totalStudents || 12}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">({stats.hostellers || 9} Hostellers)</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{stats.dayScholars || 3} Day Scholars</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-[#7156a5]/40 shadow-2xs transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Loans</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.activeLoans || 0}</span>
            {stats.overdueLoans > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-500/30">
                {stats.overdueLoans} Overdue
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Equipment issued on field</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-[#7156a5]/40 shadow-2xs transition-colors">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tournament Sports</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">12</span>
            <span className="text-[11px] text-[#7156a5] dark:text-[#b8a5e5] font-semibold">Disciplines</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{stats.totalEquipmentItems || 95} Gear items inventoried</span>
        </div>

      </div>

    </div>
  );
}
