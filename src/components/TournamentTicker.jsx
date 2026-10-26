import React from 'react';
import { Flame, Trophy, Radio, MapPin, Sparkles } from 'lucide-react';

export default function TournamentTicker() {
  const tickerItems = [
    { label: 'MPGI SPORTS FEST 2026', tag: 'APEX CHAMPIONSHIP', icon: Trophy, color: 'text-amber-400' },
    { label: 'SESSION ACTIVE', tag: '12 DISCIPLINES', icon: Radio, color: 'text-emerald-400' },
    { label: 'Cricket T20', tag: 'Stadium Ground 1', icon: Sparkles, color: 'text-blue-400' },
    { label: '5v5 Mini Football', tag: 'Ground 1 & 2', icon: Sparkles, color: 'text-emerald-400' },
    { label: 'Badminton Championship', tag: 'Courts 1-4', icon: Sparkles, color: 'text-purple-400' },
    { label: 'Table Tennis Singles/Doubles', tag: 'Complex Hall A', icon: Sparkles, color: 'text-cyan-400' },
    { label: 'Basketball 5v5', tag: 'Synthetic Court', icon: Sparkles, color: 'text-amber-400' },
    { label: 'Pro Kabaddi Mats', tag: 'Arena Mat 1', icon: Sparkles, color: 'text-rose-400' },
    { label: 'FIDE Rapid Chess', tag: 'Auditorium Hall B', icon: Sparkles, color: 'text-indigo-400' },
    { label: 'Track & Field Athletics', tag: 'Synthetic Track', icon: Sparkles, color: 'text-amber-400' },
    { label: 'Volleyball 6v6', tag: 'Outdoor Court 1', icon: Sparkles, color: 'text-sky-400' },
    { label: 'Kho-Kho Knockout', tag: 'Sports Field 2', icon: Sparkles, color: 'text-emerald-400' },
    { label: 'Tug of War Showdown', tag: 'Central Lawn', icon: Sparkles, color: 'text-orange-400' },
    { label: 'Box Gully Cricket', tag: 'Street Pitch 1', icon: Sparkles, color: 'text-yellow-400' }
  ];

  return (
    <div className="w-full bg-[#020617] border-y border-[#d2ab45]/20 text-white overflow-hidden py-2 select-none relative shadow-xs">
      {/* Left & Right gradient fades for smooth marquee entrance/exit */}
      <div className="absolute left-0 inset-y-0 w-12 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center gap-6 text-xs whitespace-nowrap">
        {[...tickerItems, ...tickerItems].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/5 border border-white/10">
                <Icon className={`w-3 h-3 ${item.color}`} />
              </span>
              <span className="font-bold text-slate-200 tracking-wide">{item.label}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7156a5]/20 border border-[#7156a5]/40 text-[#b8a5e5] font-semibold">
                {item.tag}
              </span>
              <span className="text-amber-500/40 text-xs pl-3">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
