import React, { useState } from 'react';
import { MPGI_SPORTS } from '../utils/sportsConfig';
import { 
  Trophy, 
  MapPin, 
  Users, 
  CalendarCheck, 
  Package, 
  BookOpen, 
  ChevronRight, 
  X, 
  Sparkles,
  ShieldCheck,
  Flame
} from 'lucide-react';

export default function SportsGridSection({ onTakeAttendance, onManageGear }) {
  const [selectedSportForRules, setSelectedSportForRules] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Outdoor', 'Indoor', 'Combat & Traditional', 'Track & Field', 'Mind Sport'];

  const filteredSports = categoryFilter === 'All'
    ? MPGI_SPORTS
    : MPGI_SPORTS.filter(s => {
        if (categoryFilter === 'Outdoor') return s.category === 'Outdoor';
        if (categoryFilter === 'Indoor') return s.category === 'Indoor';
        if (categoryFilter === 'Combat & Traditional') return s.category.includes('Traditional') || s.category.includes('Combat') || s.category.includes('Strength');
        if (categoryFilter === 'Track & Field') return s.category.includes('Track');
        if (categoryFilter === 'Mind Sport') return s.category.includes('Mind');
        return true;
      });

  return (
    <div className="flex flex-col gap-5 my-2">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7156a5]/10 border border-[#7156a5]/25 text-[#7156a5] dark:bg-[#18142e] dark:border-[#7156a5]/30 dark:text-[#b8a5e5] text-[11px] font-semibold uppercase tracking-wider mb-1.5">
            <Trophy className="w-3 h-3 text-[#d2ab45]" />
            <span>12 Official Tournament Disciplines</span>
          </div>
          <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>MPGI Sports Fest 2026 Arena</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#7156a5]/15 border border-[#7156a5]/30 text-[#7156a5] dark:text-[#b8a5e5] font-sans font-semibold">
              APEX
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Select any sport to launch its dedicated daily attendance sheet, manage specialized gear, or view official tournament rulebook.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#7156a5] text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-50 dark:bg-[#0c0e22] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-2xs'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 12 Sports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSports.map(sport => (
          <div
            key={sport.id}
            className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#0c0e22] border border-slate-200 dark:border-slate-800 hover:border-[#7156a5]/50 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top Banner Image with Overlay */}
            <div className="relative h-36 w-full overflow-hidden bg-slate-900">
              <img
                src={sport.image}
                alt={sport.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              
              {/* Category Pill */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#070818]/80 backdrop-blur-md text-slate-200 border border-slate-700/60">
                  {sport.icon} {sport.category}
                </span>
              </div>

              {/* Rules Button */}
              <button
                type="button"
                onClick={() => setSelectedSportForRules(sport)}
                className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-black/60 hover:bg-black/80 backdrop-blur-md text-slate-200 border border-white/15 transition-all cursor-pointer flex items-center gap-1"
                title="View Official Tournament Rules"
              >
                <BookOpen className="w-3 h-3 text-[#b8a5e5]" />
                <span>Rules</span>
              </button>

              {/* Title & Format at Bottom of Image */}
              <div className="absolute bottom-2 left-3 right-3">
                <h3 className="font-brand text-lg font-bold text-white tracking-wide leading-tight drop-shadow-md">
                  {sport.name}
                </h3>
                <span className="text-[11px] text-slate-300 font-medium">
                  {sport.type}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3.5 flex flex-col gap-2.5 flex-1 justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {sport.description}
                </p>
                
                {/* Venue and Team Size */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-[#7156a5] dark:text-[#b8a5e5] flex-shrink-0" />
                    <span className="truncate">{sport.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <span>Squad: {sport.teamSize}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Unified Purple & Adaptive Outline */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onTakeAttendance && onTakeAttendance(sport.name)}
                  className="w-full py-2 px-2 rounded-xl text-xs font-semibold text-white bg-[#7156a5] hover:bg-[#5e458e] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Attendance</span>
                </button>
                <button
                  type="button"
                  onClick={() => onManageGear && onManageGear(sport.name)}
                  className="w-full py-2 px-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#12152e] dark:hover:bg-[#1a1e3d] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Package className="w-3.5 h-3.5 text-[#7156a5] dark:text-[#b8a5e5]" />
                  <span>Gear Stock</span>
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Official Rules Modal */}
      {selectedSportForRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0c0e22] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="relative p-5 bg-[#070818] text-white border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedSportForRules.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#7156a5]/20 text-[#b8a5e5] border border-[#7156a5]/30 uppercase tracking-widest">
                      Official Tournament Rules
                    </span>
                    <span className="text-xs text-slate-400">• {selectedSportForRules.category}</span>
                  </div>
                  <h3 className="font-brand text-xl font-bold text-white mt-0.5">
                    {selectedSportForRules.name} — APEX 2026
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSportForRules(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Rules List */}
            <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs sm:text-sm text-slate-300">
              <div className="p-3 rounded-2xl bg-[#070818] border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#b8a5e5]" />
                  <span className="font-semibold text-white">Venue: {selectedSportForRules.venue}</span>
                </div>
                <div className="font-semibold text-[#b8a5e5]">
                  Format: {selectedSportForRules.type}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#b8a5e5]" />
                  <span>Tournament Code of Play</span>
                </h4>
                <div className="flex flex-col gap-2">
                  {selectedSportForRules.rules.map((rule, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#070818] border border-slate-800 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#7156a5]/25 text-[#b8a5e5] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed text-slate-300">
                        {rule}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#070818] border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Official MPGI Sports Authority Standards (mpgisports.in)
              </span>
              <button
                type="button"
                onClick={() => setSelectedSportForRules(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#7156a5] hover:bg-[#5e458e] transition-colors cursor-pointer"
              >
                Close Rulebook
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
