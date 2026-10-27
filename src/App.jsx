import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import HeroBanner from './components/HeroBanner';
import SportsGridSection from './components/SportsGridSection';
import AttendanceView from './components/AttendanceView';
import EquipmentView from './components/EquipmentView';
import StudentsView from './components/StudentsView';
import ReportsView from './components/ReportsView';
import IssueGearModal from './components/IssueGearModal';
import StudentHistoryModal from './components/StudentHistoryModal';
import DayScholarPassModal from './components/DayScholarPassModal';
import HostelPermissionModal from './components/HostelPermissionModal';
import LoginScreen from './components/LoginScreen';
import { api } from './utils/api';

function DashboardHome({ 
  stats, 
  setActiveTab, 
  onOpenIssueModal, 
  onOpenGatePassModal, 
  onOpenHostelPermissionModal,
  onTakeAttendance,
  onManageGear
}) {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Hero Banner with APEX Gold & Purple Auroras */}
      <HeroBanner 
        stats={stats} 
        setActiveTab={setActiveTab} 
        onOpenIssueModal={onOpenIssueModal} 
        onOpenGatePassModal={onOpenGatePassModal}
        onOpenHostelPermissionModal={onOpenHostelPermissionModal}
      />

      {/* 12 Official Tournament Disciplines Section (From mpgisports.in) */}
      <SportsGridSection 
        onTakeAttendance={onTakeAttendance} 
        onManageGear={onManageGear} 
      />

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
  const [selectedSportForView, setSelectedSportForView] = useState(null);
  const [stats, setStats] = useState({});
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [isHostelPermissionOpen, setIsHostelPermissionOpen] = useState(false);
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
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#070818] text-slate-900 dark:text-slate-100 transition-colors duration-250">
      
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenIssueModal={() => setIsIssueModalOpen(true)}
        onOpenGatePassModal={() => setIsGatePassModalOpen(true)}
        onOpenHostelPermissionModal={() => setIsHostelPermissionOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 flex-1 pb-28 md:pb-12">
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
            onOpenHostelPermissionModal={() => setIsHostelPermissionOpen(true)}
            onSelectStudentHistory={(stu) => setSelectedStudentForHistory(stu)}
            refreshKey={refreshKey}
            onTakeAttendance={(sportName) => {
              setSelectedSportForView(sportName);
              setActiveTab('attendance');
            }}
            onManageGear={(sportName) => {
              setSelectedSportForView(sportName);
              setActiveTab('equipment');
            }}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView 
            onSelectStudentHistory={(stu) => setSelectedStudentForHistory(stu)} 
            initialSport={selectedSportForView}
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentView 
            onOpenIssueModal={() => setIsIssueModalOpen(true)} 
            refreshKey={refreshKey}
            initialSport={selectedSportForView}
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

      {/* Modal: Hostel Sports Permission Pass */}
      <HostelPermissionModal
        isOpen={isHostelPermissionOpen}
        onClose={() => setIsHostelPermissionOpen(false)}
      />

      {/* Footer matching mpgisports.in */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070818] py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/apex-logo.png" 
              alt="MPGI APEX Sports" 
              className="h-6 w-auto object-contain" 
            />
            <span className="font-brand font-bold text-slate-900 dark:text-white tracking-wider">
              MPGI SPORTS FEST 2026 • APEX CHAMPIONSHIP
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>Hostel Sports Attendance & Equipment Desk</span>
            <span>•</span>
            <span className="text-[#7156a5] dark:text-[#b8a5e5] font-semibold">12 Sports Disciplines</span>
            <span>•</span>
            <span>Maharana Pratap Group of Institutions</span>
          </div>
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
