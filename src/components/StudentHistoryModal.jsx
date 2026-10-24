import React, { useState, useEffect } from 'react';
import { 
  History, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  HelpCircle, 
  Building, 
  Phone, 
  Trophy, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../utils/api';

export default function StudentHistoryModal({ student, onClose }) {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) {
      setLoading(true);
      api.getStudentHistory(student.id).then(data => {
        setHistoryData(data);
        setLoading(false);
      });
    }
  }, [student]);

  if (!student) return null;

  const summary = historyData?.summary || {
    totalSessions: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    attendancePct: 100
  };

  const history = historyData?.history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  {student.name}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                  {student.gender}
                </span>
              </div>
              <span className="font-mono text-xs text-slate-400">
                Roll No: {student.rollNumber}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Residency & Hostel Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-500" />
            <span className="text-slate-600 dark:text-slate-300">
              Residency: <strong className="text-slate-900 dark:text-slate-100">{student.residency}</strong>
              {student.residency === 'Hosteller' && ` — ${student.hostelName} (Room ${student.roomNumber})`}
            </span>
          </div>

          {student.phone && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>{student.phone}</span>
            </div>
          )}
        </div>

        {/* Sports Participated */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase">Sports Played:</span>
          {student.sports?.map(sp => (
            <span key={sp} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-700/50">
              {sp}
            </span>
          ))}
        </div>

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
          
          {/* Rate */}
          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 p-3 rounded-2xl flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Turnout</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {summary.totalSessions > 0 && summary.attendancePct !== null ? `${summary.attendancePct}%` : '—'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {summary.totalSessions > 0 ? 'Rate' : 'No Sessions Yet'}
            </span>
          </div>

          {/* Present */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-2.5 rounded-2xl flex flex-col items-center">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-500 mb-1" />
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{summary.presentCount}</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold">Present</span>
          </div>

          {/* Absent */}
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 p-2.5 rounded-2xl flex flex-col items-center">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-500 mb-1" />
            <span className="text-lg font-bold text-rose-700 dark:text-rose-400">{summary.absentCount}</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold">Absent</span>
          </div>

          {/* Late */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-2.5 rounded-2xl flex flex-col items-center">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-500 mb-1" />
            <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{summary.lateCount}</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold">Late</span>
          </div>

          {/* Excused */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 p-2.5 rounded-2xl flex flex-col items-center">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-500 mb-1" />
            <span className="text-lg font-bold text-blue-700 dark:text-cyan-400">{summary.excusedCount}</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold">Excused</span>
          </div>

        </div>

        {/* Detailed Timeline Table */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            Session Attendance Log History
          </h4>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading history logs...</div>
          ) : history.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              No previous attendance sessions recorded for this student yet.
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Sport Discipline</th>
                    <th className="p-3">Session</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Notes / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {history.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{item.date}</td>
                      <td className="p-3 font-semibold text-blue-600 dark:text-cyan-400">{item.sport}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{item.sessionType}</td>
                      <td className="p-3">
                        {item.status === 'Present' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                            ● Present
                          </span>
                        )}
                        {item.status === 'Absent' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 font-bold text-[10px]">
                            ● Absent
                          </span>
                        )}
                        {item.status === 'Late' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                            ● Late ({item.arrivalTime || 'Late'})
                          </span>
                        )}
                        {item.status === 'Excused' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-cyan-400 font-bold text-[10px]">
                            ● Excused
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {item.excuseReason || item.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer text-center"
          >
            Close Drill-Down Log
          </button>
        </div>

      </div>
    </div>
  );
}
