import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import HeroBanner from './components/HeroBanner';
import AttendanceView from './components/AttendanceView';
import EquipmentView from './components/EquipmentView';
import StudentsView from './components/StudentsView';
import ReportsView from './components/ReportsView';
import IssueGearModal from './components/IssueGearModal';
import StudentHistoryModal from './components/StudentHistoryModal';
import DayScholarPassModal from './components/DayScholarPassModal';
import LoginScreen from './components/LoginScreen';
import { api } from './utils/api';
import { 
  Trophy, 
  CalendarCheck, 
  Package, 
  Users, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  Flame,
  ShieldAlert
} from 'lucide-react';

function DashboardHome({ stats, setActiveTab, onOpenIssueModal, onOpenGatePassModal, onSelectStudentHistory, refreshKey }) {
  const [recentLoans, setRecentLoans] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  useEffect(() => {
    api.getLoans('all').then(loans => setRecentLoans(loans.slice(0, 4)));
    api.getStudents().then(stu => setTopStudents(stu.slice(0, 6)));
  }, [refreshKey]);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Hero Banner */}
      <HeroBanner 
        stats={stats} 
        setActiveTab={setActiveTab} 
        onOpenIssueModal={onOpenIssueModal} 
        onOpenGatePassModal={onOpenGatePassModal}
      />

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Daily Attendance */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              12 Sports Ready
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Mark Sports Attendance</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Log players by sport, record room numbers, hosteller vs scholar status, and handle excuses.
            </p>
          </div>
        </div>

        {/* Card 2: Equipment Loan Desk */}
        <div 
          onClick={() => setActiveTab('equipment')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {stats.activeLoans || 0} Issued
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Equipment Issue & Return</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Issue sports gear with room verification, track expected return deadlines, and restock.
            </p>
          </div>
        </div>

        {/* Card 3: Players Directory */}
        <div 
          onClick={() => setActiveTab('students')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              {stats.totalStudents || 12} Registered
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Players Roster & History</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse student turnout logs, room numbers, hostel blocks, and contact cards.
            </p>
          </div>
        </div>

      </div>

      {/* Two Column Grid: Active Loans Ledger & Top Attendees */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Gear Loans */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Active Equipment Loans (Outstanding)
              </h3>
              <button
                onClick={() => setActiveTab('equipment')}
                className="text-xs text-blue-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
              >
                View All Gear →
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {recentLoans.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No active equipment loans.</p>
              ) : (
                recentLoans.map(loan => (
                  <div 
                    key={loan.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold text-base flex-shrink-0">
                        ⚽
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{loan.equipmentName}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {loan.studentName} • <strong>Room {loan.roomNumber} ({loan.hostelName})</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {loan.status === 'Overdue' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-500 border border-rose-500/30">
                          OVERDUE
                        </span>
                      ) : loan.status === 'Active' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
                          ISSUED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          RETURNED
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">Qty: {loan.quantity}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Need to issue gear?</span>
            <button
              onClick={onOpenIssueModal}
              className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              + Quick Issue Equipment
            </button>
          </div>
        </div>

        {/* Right Column: Player Attendance Quick Roster */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Player Attendance Turnout
              </h3>
              <button
                onClick={() => setActiveTab('students')}
                className="text-xs text-blue-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
              >
                All Players →
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {topStudents.map(student => {
                const st = student.attendanceStats || { attendancePct: 100, attended: 0, total: 0 };
                return (
                  <div
                    key={student.id}
                    onClick={() => onSelectStudentHistory(student)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs hover:border-blue-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{student.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {student.residency === 'Hosteller' ? `Room ${student.roomNumber}` : 'Day Scholar'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {st.attendancePct}%
                      </span>
                      <span className="text-[10px] text-blue-500 font-semibold">Log →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => setActiveTab('attendance')}
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition-all cursor-pointer shadow-sm"
            >
              Open Daily Attendance Sheet
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

export function AppContent() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sems_auth_user') || sessionStorage.getItem('sems_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('sems_auth_user');
    sessionStorage.removeItem('sems_auth_user');
    setCurrentUser(null);
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchStats = async () => {
    const s = await api.getStats();
    setStats(s);
  };

  useEffect(() => {
    if (currentUser) {
      fetchStats();
    }
  }, [activeTab, refreshKey, currentUser]);

  // Security Guard: If not authenticated, render ONLY the protected LoginScreen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-250">
      
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenIssueModal={() => setIsIssueModalOpen(true)}
        onOpenGatePassModal={() => setIsGatePassModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 pb-28 md:pb-12">
        {/* Real-time Notification Alert */}
        {toast && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 p-3 sm:p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                ✓
              </span>
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{toast.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">{toast.message}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action();
                    setToast(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  View in Table →
                </button>
              )}
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardHome 
            stats={stats} 
            setActiveTab={setActiveTab}
            onOpenIssueModal={() => setIsIssueModalOpen(true)}
            onOpenGatePassModal={() => setIsGatePassModalOpen(true)}
            onSelectStudentHistory={(stu) => setSelectedStudentForHistory(stu)}
            refreshKey={refreshKey}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView 
            onSelectStudentHistory={(stu) => setSelectedStudentForHistory(stu)} 
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentView 
            onOpenIssueModal={() => setIsIssueModalOpen(true)} 
            refreshKey={refreshKey}
          />
        )}

        {activeTab === 'students' && (
          <StudentsView 
            onSelectStudentHistory={(stu) => setSelectedStudentForHistory(stu)} 
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}
      </main>

      {/* Mobile Glassmorphic Bottom Navigation Bar */}
      <MobileBottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Modal: Issue Gear */}
      <IssueGearModal 
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onViewInLedger={(loan) => {
          setActiveTab('equipment');
        }}
        onSuccess={(loan) => {
          fetchStats();
          setRefreshKey(prev => prev + 1);
          if (loan) {
            setToast({
              title: 'Gear Issued Successfully!',
              message: `${loan.equipmentName} issued to ${loan.studentName} (${loan.hostelName || 'Hostel'})`,
              action: () => setActiveTab('equipment')
            });
            setTimeout(() => setToast(null), 8000);
          }
        }}
      />

      {/* Modal: Student History Drill-Down */}
      <StudentHistoryModal 
        student={selectedStudentForHistory}
        onClose={() => setSelectedStudentForHistory(null)}
      />

      {/* Modal: Day Scholar Sports Gate Pass */}
      <DayScholarPassModal
        isOpen={isGatePassModalOpen}
        onClose={() => setIsGatePassModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img 
              src="/apex-logo.png" 
              alt="APEX Sports" 
              className="h-5 w-auto object-contain dark:drop-shadow-[0_1px_6px_rgba(255,255,255,0.3)]" 
            />
            <span className="font-brand font-bold text-slate-700 dark:text-slate-300">APEX SPORTS FEST 2026</span>
            <span>•</span>
            <span>Hostel Sports Attendance & Equipment Hub</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500">Official MPGI APEX Sports System</span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
