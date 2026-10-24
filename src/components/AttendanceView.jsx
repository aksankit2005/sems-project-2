import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  HelpCircle, 
  Search, 
  SlidersHorizontal, 
  Save, 
  CheckSquare, 
  Calendar, 
  UserCheck, 
  History,
  Building,
  Home,
  AlertCircle,
  Download,
  Printer,
  Table,
  LayoutGrid,
  RotateCcw,
  Check,
  Filter
} from 'lucide-react';
import { api } from '../utils/api';
import { exportAttendanceCSV } from '../utils/exportUtils';

export default function AttendanceView({ onSelectStudentHistory }) {
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState('Cricket');
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState('Evening Practice');
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(null);

  // Past Sessions & Edit State
  const [isExistingSession, setIsExistingSession] = useState(false);
  const [showSessionsDrawer, setShowSessionsDrawer] = useState(false);
  const [allSessionsList, setAllSessionsList] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // View Mode & Sport Strict Filtering (User Voice Request)
  const [viewMode, setViewMode] = useState('table'); // 'table' (default - as requested) or 'cards'
  const [filterStrictBySport, setFilterStrictBySport] = useState(true); // User: "jis game ka select kiye hoon, bas usi game ke player wahan dikhein"
  const [isMarkingActive, setIsMarkingActive] = useState(false); // User: "pehle mark attendance par click karoon then sabka khul jaye"

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [residencyFilter, setResidencyFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [hostelFilter, setHostelFilter] = useState('all');

  // Load sports on mount
  useEffect(() => {
    async function init() {
      const spList = await api.getSports();
      setSports(spList);
      if (spList.length > 0) {
        setSelectedSport(spList[0].name);
      }
    }
    init();
  }, []);

  // Fetch students & current attendance session whenever sport or date changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [studentList, sessionData] = await Promise.all([
          api.getStudents(),
          api.getAttendanceSession(sessionDate, selectedSport)
        ]);

        setStudents(studentList);

        if (sessionData && sessionData.records && Object.keys(sessionData.records).length > 0) {
          setAttendanceRecords(sessionData.records);
          if (sessionData.sessionType) setSessionType(sessionData.sessionType);
          setIsExistingSession(true);
          setIsMarkingActive(true);
        } else {
          setIsExistingSession(false);
          setIsMarkingActive(false);
          // Initialize Unmarked status (User: "unmark rehna chahiye, jab tak main done na karoon")
          const initial = {};
          studentList.forEach(s => {
            initial[s.id] = { status: 'Unmarked', arrivalTime: '', notes: '' };
          });
          setAttendanceRecords(initial);
        }
      } catch (err) {
        console.error('Failed to load attendance data', err);
      } finally {
        setLoading(false);
      }
    }
    if (selectedSport) {
      loadData();
    }
  }, [selectedSport, sessionDate]);

  // Load all sessions for history list
  const fetchAllSessions = async () => {
    setLoadingSessions(true);
    try {
      const list = await api.getAttendanceSessions();
      setAllSessionsList(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Quick date jump
  const changeDateBy = (days) => {
    const current = new Date(sessionDate);
    current.setDate(current.getDate() + days);
    setSessionDate(current.toISOString().split('T')[0]);
  };

  // Set status for a student
  const handleSetStatus = (studentId, status) => {
    setIsMarkingActive(true);
    setAttendanceRecords(prev => {
      const current = prev[studentId] || {};
      let updated = { ...current, status };

      if (status === 'Late' && !current.arrivalTime) {
        updated.arrivalTime = '05:30 PM';
      }
      if (status === 'Excused' && !current.excuseReason) {
        updated.excuseReason = 'Medical / Sick Leave';
      }

      return {
        ...prev,
        [studentId]: updated
      };
    });
  };

  // Set remark note for a student
  const handleSetNotes = (studentId, notes) => {
    setAttendanceRecords(prev => {
      const current = prev[studentId] || {};
      return {
        ...prev,
        [studentId]: { ...current, notes }
      };
    });
  };

  // Mark all filtered students
  const handleMarkAll = (status) => {
    setIsMarkingActive(true);
    const updated = { ...attendanceRecords };
    filteredStudents.forEach(s => {
      updated[s.id] = { ...updated[s.id], status };
    });
    setAttendanceRecords(updated);
  };

  // Save attendance session
  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      await api.saveAttendanceSession({
        date: sessionDate,
        sport: selectedSport,
        sessionType,
        records: attendanceRecords
      });
      setIsExistingSession(true);
      setSaveToast(`Attendance for ${selectedSport} saved successfully into PostgreSQL!`);
      setTimeout(() => setSaveToast(null), 3500);
      // Refresh students to update their real-time turnout
      const refreshedStudents = await api.getStudents();
      setStudents(refreshedStudents);
    } catch (err) {
      console.error(err);
      alert('Error saving attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Filtering students (Strictly filter by active sport discipline as requested by User)
  const filteredStudents = students.filter(student => {
    // 1. Sport Discipline Filter: Show only players of selected game
    if (filterStrictBySport && selectedSport) {
      const studentSports = Array.isArray(student.sports)
        ? student.sports
        : (typeof student.sports === 'string' ? [student.sports] : []);

      const playsSport = studentSports.some(sp => sp.trim().toLowerCase() === selectedSport.trim().toLowerCase());
      if (!playsSport) return false;
    }

    // 2. Search query filter
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.roomNumber && student.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.hostelName && student.hostelName.toLowerCase().includes(searchQuery.toLowerCase()));

    // 3. Demographics filters
    const matchesResidency = residencyFilter === 'all' || student.residency.toLowerCase() === residencyFilter.toLowerCase();
    const matchesGender = genderFilter === 'all' || student.gender.toLowerCase() === genderFilter.toLowerCase();
    const matchesHostel = hostelFilter === 'all' || (student.hostelName && student.hostelName.toLowerCase().includes(hostelFilter.toLowerCase()));

    return matchesSearch && matchesResidency && matchesGender && matchesHostel;
  });

  // Calculate live stats for this session
  const sessionStats = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    unmarked: 0
  };

  filteredStudents.forEach(student => {
    const rec = attendanceRecords[student.id];
    const status = rec?.status;
    if (status === 'Present') sessionStats.present++;
    else if (status === 'Absent') sessionStats.absent++;
    else if (status === 'Late') sessionStats.late++;
    else if (status === 'Excused') sessionStats.excused++;
    else sessionStats.unmarked++;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-900/30 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5 text-white" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 12 Sports Horizontal Scrollable Pills */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Select Sport Discipline (12 Official Games)
          </span>
          <span className="text-[11px] sm:text-xs text-blue-600 dark:text-cyan-400 font-bold">
            Active: {selectedSport}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          {sports.map(sp => {
            const isSelected = selectedSport.toLowerCase() === sp.name.toLowerCase();
            return (
              <button
                key={sp.id}
                onClick={() => setSelectedSport(sp.name)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white border-transparent shadow-md shadow-blue-500/25 scale-102 font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs'
                }`}
              >
                <span className="text-base">{sp.icon}</span>
                <span>{sp.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Controls & Date Bar (Mobile-first responsive layout) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col gap-4">
        
        {/* Row 1: Date & Session Timing in a 2-col responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Date Selector with Quick Step Buttons */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Attendance Date
              </label>
              
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => changeDateBy(-1)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Previous Day"
                >
                  ◀ Prev
                </button>
                <button
                  type="button"
                  onClick={() => setSessionDate(new Date().toISOString().split('T')[0])}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800 cursor-pointer"
                  title="Jump to Today"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => changeDateBy(1)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Next Day"
                >
                  Next ▶
                </button>
              </div>
            </div>

            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          {/* Session Timing & Past Sessions Log Button */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Session Timing
              </label>
              
              <button
                type="button"
                onClick={() => {
                  fetchAllSessions();
                  setShowSessionsDrawer(true);
                }}
                className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <History className="w-3 h-3" />
                <span>Past Sessions Log</span>
              </button>
            </div>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Morning Practice">Morning Practice (06:00 AM - 08:00 AM)</option>
              <option value="Evening Practice">Evening Practice (05:00 PM - 07:30 PM)</option>
              <option value="Tournament Match">APEX Match / Tournament</option>
              <option value="Special Session">Inter-Hostel Friendly</option>
            </select>
          </div>

        </div>

        {/* Row 2: Bulk Actions & Save Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Quick Bulk Actions & Export in responsive grid */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 flex-wrap">
            {!isExistingSession && (
              <button
                type="button"
                onClick={() => {
                  setIsMarkingActive(true);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  isMarkingActive 
                    ? 'bg-blue-500/15 text-blue-700 dark:text-cyan-300 border-blue-500/40' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-xs'
                }`}
                title="Start Marking Attendance"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isMarkingActive ? 'Marking Active' : 'Mark Attendance'}</span>
              </button>
            )}

            <button
              onClick={() => handleMarkAll('Present')}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Mark All Present"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>All Present</span>
            </button>
            
            <button
              onClick={() => handleMarkAll('Unmarked')}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Reset All to Unmarked"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset (Unmark)</span>
            </button>
            
            <button
              onClick={() => exportAttendanceCSV(sessionDate, selectedSport, sessionType, filteredStudents, attendanceRecords)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Download Attendance CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Print Attendance Sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>

          {/* Primary Save Attendance Button */}
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Attendance Session'}</span>
          </button>

        </div>

        {/* Past Date Alert / Edit Mode Indicator */}
        {sessionDate < new Date().toISOString().split('T')[0] && (
          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
            isExistingSession 
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-cyan-300' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-base">📅</span>
              <div>
                <strong className="font-bold">
                  {isExistingSession ? 'Editing Past Attendance Session:' : 'Back-filling Past Attendance:'}
                </strong>
                <span className="ml-1.5 font-medium">
                  {new Date(sessionDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • {selectedSport}
                </span>
              </div>
            </div>
            <span className="font-semibold text-[11px] px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/80 border border-current w-fit">
              {isExistingSession ? '✓ Saved Record (Edits will overwrite)' : '⚠️ New Past Record'}
            </span>
          </div>
        )}

      </div>

      {/* Session Quick Status Ticker (5-card metric grid including Unmarked) */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Live Attendance Count
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
            {filteredStudents.length} Players Enrolled in {selectedSport}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2.5 text-center">
          <div className="bg-white dark:bg-slate-800/90 p-2 sm:p-2.5 rounded-xl border border-emerald-500/25 shadow-2xs flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Present</span>
            <span className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{sessionStats.present}</span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 p-2 sm:p-2.5 rounded-xl border border-rose-500/25 shadow-2xs flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Absent</span>
            <span className="text-base sm:text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{sessionStats.absent}</span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 p-2 sm:p-2.5 rounded-xl border border-amber-500/25 shadow-2xs flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Late</span>
            <span className="text-base sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{sessionStats.late}</span>
          </div>

          <div className="bg-white dark:bg-slate-800/90 p-2 sm:p-2.5 rounded-xl border border-blue-500/25 shadow-2xs flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Excused</span>
            <span className="text-base sm:text-xl font-black text-blue-600 dark:text-cyan-400 mt-0.5">{sessionStats.excused}</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-800/90 p-2 sm:p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Unmarked</span>
            <span className="text-base sm:text-xl font-black text-slate-600 dark:text-slate-300 mt-0.5">{sessionStats.unmarked}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar with View Mode Toggle */}
      <div className="flex flex-col gap-2.5 bg-white dark:bg-slate-900/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Row 1: Search & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${selectedSport} players by name, roll no, room...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          {/* View Mode Toggle: Table View (Requested by User) vs Cards */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>

        {/* Row 2: Strict Sport Toggle & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
          {/* Sport Strict Filter Toggle */}
          <button
            type="button"
            onClick={() => setFilterStrictBySport(prev => !prev)}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-between cursor-pointer transition-colors ${
              filterStrictBySport
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-cyan-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="Toggle between showing only players enrolled in this sport, or all registered students"
          >
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>{filterStrictBySport ? `${selectedSport} Players Only` : 'Showing All Players'}</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white dark:bg-slate-900 border border-current font-bold">
              {filteredStudents.length}
            </span>
          </button>

          {/* Residency Filter */}
          <select
            value={residencyFilter}
            onChange={(e) => setResidencyFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
          >
            <option value="all">All Residency</option>
            <option value="hosteller">Hostellers Only</option>
            <option value="day scholar">Day Scholars Only</option>
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
          >
            <option value="all">All Genders</option>
            <option value="male">Boys / Male</option>
            <option value="female">Girls / Female</option>
          </select>

          {/* Hostel Block Filter */}
          <select
            value={hostelFilter}
            onChange={(e) => setHostelFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
          >
            <option value="all">All Hostels / Blocks</option>
            <option value="Maharana Pratap">Maharana Pratap Boys</option>
            <option value="Shivaji">Shivaji Bhawan</option>
            <option value="Ramanujan">Ramanujan Hall</option>
            <option value="Gargi">Gargi Girls Hostel</option>
          </select>
        </div>

      </div>

      {/* Student List: Table Form (Row-wise) or Cards Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading attendance roster for {selectedSport}...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-14 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            No athletes found for {selectedSport}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
            {filterStrictBySport 
              ? `Strict sport discipline filtering is active. Only students enrolled in "${selectedSport}" appear here.` 
              : 'No students matched your active filter or search query.'}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {filterStrictBySport && (
              <button
                onClick={() => setFilterStrictBySport(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              >
                Show All Students Anyway (Disable Sport Filter)
              </button>
            )}
            {(searchQuery || residencyFilter !== 'all' || genderFilter !== 'all' || hostelFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setResidencyFilter('all');
                  setGenderFilter('all');
                  setHostelFilter('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* ======================== ROW-WISE TABLE VIEW ======================== */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3.5 w-10 text-center">#</th>
                  <th className="py-3 px-3.5 min-w-[200px]">Player & Roll No</th>
                  <th className="py-3 px-3.5 min-w-[150px]">Residency / Hostel</th>
                  <th className="py-3 px-3.5 min-w-[140px]">Registered Sports</th>
                  <th className="py-3 px-3.5 text-center min-w-[90px]">Avg Record</th>
                  <th className="py-3 px-3.5 min-w-[260px] text-center">Attendance Status</th>
                  <th className="py-3 px-3.5 min-w-[210px]">Remarks / Note</th>
                  <th className="py-3 px-3.5 text-right w-24">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-slate-700 dark:text-slate-300">
                {filteredStudents.map((student, idx) => {
                  const currentRec = attendanceRecords[student.id] || { status: 'Unmarked' };
                  const status = currentRec.status || 'Unmarked';
                  const stats = student.attendanceStats || { attendancePct: null, attended: 0, total: 0 };

                  // Status badge row accent color
                  const rowAccent = 
                    status === 'Present' ? 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10' :
                    status === 'Absent' ? 'hover:bg-rose-50/40 dark:hover:bg-rose-950/10' :
                    status === 'Late' ? 'hover:bg-amber-50/40 dark:hover:bg-amber-950/10' :
                    status === 'Excused' ? 'hover:bg-blue-50/40 dark:hover:bg-blue-950/10' :
                    'hover:bg-slate-50/60 dark:hover:bg-slate-800/30';

                  const studentSports = Array.isArray(student.sports)
                    ? student.sports
                    : (typeof student.sports === 'string' ? [student.sports] : []);

                  return (
                    <tr key={student.id} className={`transition-colors duration-150 ${rowAccent}`}>
                      
                      {/* Index */}
                      <td className="py-3 px-3.5 text-center font-mono text-[11px] text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Player & Roll */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
                              {student.name}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {student.rollNumber} • {student.gender === 'Female' ? '♀ Female' : '♂ Male'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Residency & Room */}
                      <td className="py-3 px-3.5">
                        {student.residency === 'Hosteller' ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                              <Building className="w-3 h-3 text-purple-500 flex-shrink-0" />
                              {student.hostelName || 'Hostel'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Room {student.roomNumber || '—'}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25">
                            <Home className="w-2.5 h-2.5 text-cyan-500" />
                            Day Scholar
                          </span>
                        )}
                      </td>

                      {/* Registered Sports */}
                      <td className="py-3 px-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {studentSports.map(sp => {
                            const isCurrentSport = sp.trim().toLowerCase() === selectedSport.trim().toLowerCase();
                            return (
                              <span
                                key={sp}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isCurrentSport
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {sp}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Attendance % Gauge */}
                      <td className="py-3 px-3.5 text-center">
                        {stats.total > 0 && stats.attendancePct !== null ? (
                          <div className="flex flex-col items-center">
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                              stats.attendancePct >= 75 
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : stats.attendancePct >= 50
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            }`}>
                              {stats.attendancePct}%
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5">
                              {stats.attended}/{stats.total} days
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-400">—</span>
                            <span className="text-[9px] text-slate-400">New Player</span>
                          </div>
                        )}
                      </td>

                      {/* Attendance Action Matrix (P / A / L / E / Unmark) */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center justify-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                          
                          {/* Present (P) */}
                          <button
                            onClick={() => handleSetStatus(student.id, 'Present')}
                            title="Mark Present"
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                              status === 'Present'
                                ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/30 font-black'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-500/15 hover:text-emerald-600'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>P</span>
                          </button>

                          {/* Absent (A) */}
                          <button
                            onClick={() => handleSetStatus(student.id, 'Absent')}
                            title="Mark Absent"
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                              status === 'Absent'
                                ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-500/30 font-black'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-rose-500/15 hover:text-rose-600'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>A</span>
                          </button>

                          {/* Late (L) */}
                          <button
                            onClick={() => handleSetStatus(student.id, 'Late')}
                            title="Mark Late"
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                              status === 'Late'
                                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30 font-black'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-amber-500/15 hover:text-amber-600'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>L</span>
                          </button>

                          {/* Excused (E) */}
                          <button
                            onClick={() => handleSetStatus(student.id, 'Excused')}
                            title="Mark Excused"
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                              status === 'Excused'
                                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30 font-black'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-blue-500/15 hover:text-blue-600'
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>E</span>
                          </button>

                          {/* Reset / Unmark if marked */}
                          {status !== 'Unmarked' && (
                            <button
                              onClick={() => handleSetStatus(student.id, 'Unmarked')}
                              title="Reset to Unmarked"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}

                        </div>
                      </td>

                      {/* Remarks & Conditional Extra Inputs (Late Arrival / Excuse Reason) */}
                      <td className="py-3 px-3.5">
                        <div className="flex flex-col gap-1.5">
                          {status === 'Late' && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Time:</span>
                              <input
                                type="text"
                                placeholder="05:30 PM"
                                value={currentRec.arrivalTime || '05:30 PM'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAttendanceRecords(p => ({
                                    ...p,
                                    [student.id]: { ...p[student.id], arrivalTime: val }
                                  }));
                                }}
                                className="w-20 px-2 py-0.5 rounded-lg text-xs bg-amber-500/10 border border-amber-400 text-slate-900 dark:text-slate-100 outline-none"
                              />
                            </div>
                          )}

                          {status === 'Excused' && (
                            <select
                              value={currentRec.excuseReason || 'Medical / Sick Leave'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAttendanceRecords(p => ({
                                  ...p,
                                  [student.id]: { ...p[student.id], excuseReason: val }
                                }));
                              }}
                              className="w-full px-2 py-0.5 rounded-lg text-[11px] bg-blue-500/10 border border-blue-400 text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
                            >
                              <option value="Medical / Sick Leave">Medical / Clinic / Sick</option>
                              <option value="College Semester Exam">College Examination</option>
                              <option value="Lab Practical Overtime">Lab Practical Classes</option>
                              <option value="Hostel Maintenance Duty">Hostel Committee Duty</option>
                              <option value="Family / Out of Campus">Permitted Campus Leave</option>
                            </select>
                          )}

                          <input
                            type="text"
                            placeholder="Add remark / note..."
                            value={currentRec.notes || ''}
                            onChange={(e) => handleSetNotes(student.id, e.target.value)}
                            className="w-full px-2.5 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 placeholder:text-slate-400"
                          />
                        </div>
                      </td>

                      {/* Drill-down Log Button */}
                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={() => onSelectStudentHistory(student)}
                          title="View Full History Log"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Log</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ======================== CARDS GRID VIEW ======================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const currentRec = attendanceRecords[student.id] || { status: 'Unmarked' };
            const status = currentRec.status || 'Unmarked';
            const stats = student.attendanceStats || { attendancePct: null, attended: 0, total: 0 };

            return (
              <div 
                key={student.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3.5 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all duration-200"
              >
                
                {/* Header: Avatar, Name, Residency & Room */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 border border-white/20">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                        {student.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {student.rollNumber} • {student.gender === 'Female' ? '♀ Female' : '♂ Male'}
                      </span>
                    </div>
                  </div>

                  {/* Attendance % Gauge */}
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {stats.total > 0 && stats.attendancePct !== null ? `${stats.attendancePct}%` : '—'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {stats.total > 0 ? 'Avg. Record' : 'New Player'}
                    </span>
                  </div>
                </div>

                {/* Residency & Hostel Room Details */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {student.residency === 'Hosteller' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 font-semibold">
                      <Building className="w-3 h-3 text-purple-500" />
                      Hosteller • {student.hostelName} (Room {student.roomNumber})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25 font-semibold">
                      <Home className="w-3 h-3 text-cyan-500" />
                      Day Scholar
                    </span>
                  )}

                  {/* Unmarked status indicator pill if not yet marked */}
                  {status === 'Unmarked' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-semibold">
                      Unmarked
                    </span>
                  )}
                </div>

                {/* Attendance Action Matrix (P / A / L / E) */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  
                  {/* Present */}
                  <button
                    onClick={() => handleSetStatus(student.id, 'Present')}
                    className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
                      status === 'Present'
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-102 font-extrabold'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Present</span>
                  </button>

                  {/* Absent */}
                  <button
                    onClick={() => handleSetStatus(student.id, 'Absent')}
                    className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
                      status === 'Absent'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-102 font-extrabold'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>

                  {/* Late */}
                  <button
                    onClick={() => handleSetStatus(student.id, 'Late')}
                    className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
                      status === 'Late'
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-102 font-extrabold'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Late</span>
                  </button>

                  {/* Excused */}
                  <button
                    onClick={() => handleSetStatus(student.id, 'Excused')}
                    className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 ${
                      status === 'Excused'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-102 font-extrabold'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Excuse</span>
                  </button>

                </div>

                {/* Sub-inputs if Late or Excused */}
                {status === 'Late' && (
                  <div className="bg-amber-500/10 border border-amber-500/25 p-2 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-amber-800 dark:text-amber-300 font-semibold">Arrival Time:</span>
                    <input
                      type="text"
                      value={currentRec.arrivalTime || '05:30 PM'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAttendanceRecords(p => ({
                          ...p,
                          [student.id]: { ...p[student.id], arrivalTime: val }
                        }));
                      }}
                      className="w-24 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-400 text-xs text-right text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                )}

                {status === 'Excused' && (
                  <div className="bg-blue-500/10 border border-blue-500/25 p-2 rounded-xl flex flex-col gap-1 text-xs">
                    <span className="text-blue-800 dark:text-blue-300 font-semibold">Excuse Reason:</span>
                    <select
                      value={currentRec.excuseReason || 'Medical / Sick Leave'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAttendanceRecords(p => ({
                          ...p,
                          [student.id]: { ...p[student.id], excuseReason: val }
                        }));
                      }}
                      className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-blue-400 text-xs text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="Medical / Sick Leave">Medical / Health Clinic / Fever</option>
                      <option value="College Semester Exam">College Examination / Viva</option>
                      <option value="Lab Practical Overtime">Lab Practical Classes</option>
                      <option value="Hostel Maintenance Duty">Hostel Committee Duty</option>
                      <option value="Family / Out of Campus">Permitted Leave / Out of Campus</option>
                    </select>
                  </div>
                )}

                {/* Sub-input: Per-Student Remark / Note */}
                <div className="pt-0.5">
                  <input
                    type="text"
                    placeholder="Remark / note (e.g. knee injury, late entry)..."
                    value={currentRec.notes || ''}
                    onChange={(e) => handleSetNotes(student.id, e.target.value)}
                    className="w-full px-2.5 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 placeholder:text-slate-400"
                  />
                </div>

                {/* Footer: View Complete History Link & Reset */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {stats.total > 0 ? `${stats.attended}/${stats.total} days attended` : 'No past logs'}
                  </span>
                  <div className="flex items-center gap-2">
                    {status !== 'Unmarked' && (
                      <button
                        onClick={() => handleSetStatus(student.id, 'Unmarked')}
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      onClick={() => onSelectStudentHistory(student)}
                      className="flex items-center gap-1 font-semibold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>View Log</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Past Recorded Sessions Log */}
      {showSessionsDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Past Attendance Sessions Directory
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select any previous session to reopen, inspect or modify records
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSessionsDrawer(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-2.5">
              {loadingSessions ? (
                <div className="py-12 text-center text-slate-400 text-xs">Loading past sessions list...</div>
              ) : allSessionsList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No previous attendance sessions found. Save a session to start your history log.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {allSessionsList.map((sess) => (
                    <div 
                      key={sess.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {sess.sport}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-cyan-300 border border-blue-500/20">
                            {sess.sessionType || 'Practice'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            📅 {new Date(sess.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{sess.present} Present</span>
                          <span>•</span>
                          <span className="text-rose-600 dark:text-rose-400 font-bold">{sess.absent} Absent</span>
                          {sess.late > 0 && <span>• {sess.late} Late</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSessionDate(sess.date);
                          setSelectedSport(sess.sport);
                          if (sess.sessionType) setSessionType(sess.sessionType);
                          setShowSessionsDrawer(false);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>Reopen & Edit</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSessionsDrawer(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
