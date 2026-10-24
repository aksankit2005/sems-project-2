import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Building, 
  Home, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  FileSpreadsheet,
  Trophy,
  Package,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../utils/api';
import { 
  exportStudentsCSV, 
  exportLoansCSV, 
  exportInventoryCSV,
  downloadCSV 
} from '../utils/exportUtils';

export default function ReportsView() {
  const [students, setStudents] = useState([]);
  const [loans, setLoans] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [stu, ln, eq, st] = await Promise.all([
        api.getStudents(),
        api.getLoans('all'),
        api.getEquipment(),
        api.getStats()
      ]);
      setStudents(stu);
      setLoans(ln);
      setEquipment(eq);
      setStats(st);
      setLoading(false);
    }
    init();
  }, []);

  const overdueLoans = loans.filter(l => l.status === 'Overdue');
  const hostellers = students.filter(s => s.residency === 'Hosteller');
  const scholars = students.filter(s => s.residency === 'Day Scholar');

  const handleExportOverdueCSV = () => {
    const headers = [
      'Loan ID',
      'Equipment Item',
      'Quantity',
      'Student Name',
      'Roll Number',
      'Hostel Block',
      'Room Number',
      'Phone Contact',
      'Issued At',
      'Deadline',
      'Status'
    ];
    const rows = overdueLoans.map(l => [
      l.id,
      l.equipmentName,
      l.quantity,
      l.studentName,
      l.studentId,
      l.hostelName,
      l.roomNumber,
      l.phone ? `+91 ${l.phone}` : 'N/A',
      new Date(l.issuedAt).toLocaleString('en-IN'),
      new Date(l.expectedReturn).toLocaleString('en-IN'),
      'OVERDUE'
    ]);
    downloadCSV('MPGI_Overdue_Equipment_Defaulters', headers, rows);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Hostel Sports Analytics & Attendance Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Turnout statistics, residency distribution, overdue equipment tracking, and CSV exports.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => exportStudentsCSV(students)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* QUICK EXPORT CENTER (One-click downloads for all system data) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Universal Report Export Center (CSV / Excel Format)</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">Instant 1-Click File Downloads</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Card 1: Students & Attendance */}
          <button
            onClick={() => exportStudentsCSV(students)}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center justify-between transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-emerald-500">
                  Students Roster
                </span>
                <span className="text-[10px] text-slate-400">Attendance % & Room info</span>
              </div>
            </div>
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
          </button>

          {/* Card 2: Issued Gear Loans */}
          <button
            onClick={() => exportLoansCSV(loans)}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-500 flex items-center justify-between transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-500">
                  Issued Equipment
                </span>
                <span className="text-[10px] text-slate-400">All loans & returns</span>
              </div>
            </div>
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
          </button>

          {/* Card 3: Master Inventory */}
          <button
            onClick={() => exportInventoryCSV(equipment)}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-purple-500 flex items-center justify-between transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-purple-500">
                  Inventory Stock
                </span>
                <span className="text-[10px] text-slate-400">Stock & locations</span>
              </div>
            </div>
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500" />
          </button>

          {/* Card 4: Overdue Defaulters */}
          <button
            onClick={handleExportOverdueCSV}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-rose-500 flex items-center justify-between transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-rose-500">
                  Overdue Defaulters
                </span>
                <span className="text-[10px] text-slate-400">{overdueLoans.length} Unreturned gear</span>
              </div>
            </div>
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
          </button>

        </div>
      </div>

      {/* Grid: Residency Turnout Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Hosteller vs Day Scholar Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-500" />
              Residency Distribution (Hosteller vs Scholar)
            </h3>
            <p className="text-xs text-slate-400 mt-1">Breakdown of active student participants in campus sports</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 p-3.5 rounded-xl flex flex-col">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Hostellers</span>
              <span className="text-2xl font-black text-purple-800 dark:text-purple-200 mt-1">{hostellers.length}</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Staying in hostel rooms</span>
            </div>

            <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 p-3.5 rounded-xl flex flex-col">
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">Day Scholars</span>
              <span className="text-2xl font-black text-cyan-800 dark:text-cyan-200 mt-1">{scholars.length}</span>
              <span className="text-[11px] text-slate-400 mt-0.5">City commuting students</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between text-xs text-slate-500 font-semibold">
              <span>Hostellers ({Math.round((hostellers.length / (students.length || 1)) * 100)}%)</span>
              <span>Day Scholars ({Math.round((scholars.length / (students.length || 1)) * 100)}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
              <div 
                className="bg-purple-600 h-full transition-all"
                style={{ width: `${Math.round((hostellers.length / (students.length || 1)) * 100)}%` }}
              ></div>
              <div 
                className="bg-cyan-500 h-full transition-all"
                style={{ width: `${Math.round((scholars.length / (students.length || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Overdue Gear Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Equipment Return Alerts
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 border border-rose-500/30">
                {overdueLoans.length} Overdue
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Students with equipment unreturned past the expected deadline</p>
          </div>

          {overdueLoans.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>All issued equipment items are within their return schedules.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {overdueLoans.map(loan => (
                <div key={loan.id} className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{loan.equipmentName}</span>
                    <span className="text-[11px] text-slate-500">
                      Borrower: {loan.studentName} • <strong>Room {loan.roomNumber} ({loan.hostelName})</strong>
                    </span>
                  </div>
                  <span className="text-rose-500 font-bold text-[11px]">OVERDUE</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-[11px] text-slate-400 pt-1">
            Total active equipment loans outstanding: <strong>{stats.activeLoans || 0} items</strong>
          </div>
        </div>

      </div>

      {/* Comprehensive Student Attendance Master Ledger */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Student Attendance Ledger & Participation</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {students.length} Players
          </span>
        </div>

        {/* MOBILE VIEW (< md): Responsive Student Attendance Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60 p-3 flex flex-col gap-3">
          {students.map(s => {
            const st = s.attendanceStats || { attendancePct: 100, attended: 0, total: 0, absent: 0, excused: 0 };
            return (
              <div key={s.id} className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{s.name}</span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{s.rollNumber} • {s.gender}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    s.residency === 'Hosteller'
                      ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25'
                      : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25'
                  }`}>
                    {s.residency === 'Hosteller' ? `Hostel (Rm ${s.roomNumber})` : 'Day Scholar'}
                  </span>
                </div>

                {/* Sports tags */}
                <div className="flex flex-wrap gap-1">
                  {s.sports?.map(sp => (
                    <span key={sp} className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                      {sp}
                    </span>
                  ))}
                </div>

                {/* Turnout metrics */}
                <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-center">
                  <div className="flex flex-col bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Rate</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{st.attendancePct}%</span>
                  </div>

                  <div className="flex flex-col bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Present</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{st.attended}</span>
                  </div>

                  <div className="flex flex-col bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Absent</span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{st.absent}</span>
                  </div>

                  <div className="flex flex-col bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Excused</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">{st.excused}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP/TABLET VIEW (>= md): Full table with min-width and horizontal scroll */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Student / Roll</th>
                <th className="p-3.5">Residency & Room</th>
                <th className="p-3.5">Gender</th>
                <th className="p-3.5">Sports Disciplines</th>
                <th className="p-3.5">Turnout Rate</th>
                <th className="p-3.5">Attended</th>
                <th className="p-3.5">Absent</th>
                <th className="p-3.5">Excused</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {students.map(s => {
                const st = s.attendanceStats || { attendancePct: 100, attended: 0, total: 0, absent: 0, excused: 0 };
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{s.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">{s.rollNumber}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {s.residency === 'Hosteller' ? (
                        <span className="text-purple-600 dark:text-purple-300 font-semibold">
                          {s.hostelName} (Rm {s.roomNumber})
                        </span>
                      ) : (
                        <span className="text-cyan-600 dark:text-cyan-300 font-semibold">
                          Day Scholar
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">{s.gender}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {s.sports?.map(sp => (
                          <span key={sp} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                            {sp}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {st.attendancePct}%
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-600">{st.attended}</td>
                    <td className="p-3.5 font-semibold text-rose-500">{st.absent}</td>
                    <td className="p-3.5 font-semibold text-blue-500">{st.excused}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
