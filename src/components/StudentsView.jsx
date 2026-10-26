import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Building, 
  Home, 
  Phone, 
  History, 
  Trophy, 
  ShieldCheck,
  UserPlus,
  Download,
  Printer,
  Trash2,
  AlertTriangle,
  Table,
  LayoutGrid
} from 'lucide-react';
import { api } from '../utils/api';
import { exportStudentsCSV } from '../utils/exportUtils';

export default function StudentsView({ onSelectStudentHistory }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // Default to structured table view per user preference
  const [searchQuery, setSearchQuery] = useState('');
  const [residencyFilter, setResidencyFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [college, setCollege] = useState('MPGI');
  const [residency, setResidency] = useState('Hosteller');
  const [hostelName, setHostelName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [selectedSports, setSelectedSports] = useState(['Cricket']);
  const [adding, setAdding] = useState(false);

  // Delete Student State
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sportsOptions = [
    'Cricket', 'Gully Cricket', 'Football', 'Basketball', 'Volleyball',
    'Table Tennis', 'Badminton', 'Chess', 'Kabaddi', 'Kho-Kho', 'Tug of War', 'Athletics'
  ];

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setIsDeleting(true);
    try {
      await api.deleteStudent(deletingStudent.id);
      setDeletingStudent(null);
      await fetchStudents();
    } catch (err) {
      alert(err.message || 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleSport = (sportName) => {
    if (selectedSports.includes(sportName)) {
      setSelectedSports(selectedSports.filter(s => s !== sportName));
    } else {
      setSelectedSports([...selectedSports, sportName]);
    }
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    if (!name || !rollNumber) return;

    setAdding(true);
    try {
      await api.addStudent({
        name,
        rollNumber,
        college: college || 'MPGI',
        residency,
        hostelName: residency === 'Day Scholar' ? 'Day Scholar' : (hostelName || 'General Hostel'),
        roomNumber: residency === 'Day Scholar' ? 'N/A' : roomNumber,
        gender,
        phone,
        sports: selectedSports.length > 0 ? selectedSports : ['Cricket']
      });

      setShowAddModal(false);
      setName('');
      setRollNumber('');
      setCollege('MPGI');
      setHostelName('');
      setRoomNumber('');
      setPhone('');
      await fetchStudents();
    } catch (err) {
      alert('Error adding student');
    } finally {
      setAdding(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.college && s.college.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.roomNumber && s.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.hostelName && s.hostelName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRes = residencyFilter === 'all' || s.residency.toLowerCase() === residencyFilter.toLowerCase();
    const matchesGen = genderFilter === 'all' || s.gender.toLowerCase() === genderFilter.toLowerCase();
    return matchesSearch && matchesRes && matchesGen;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Header (Mobile responsive) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Hostel Sports Students Directory</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Profiles of Hostellers and Day Scholars, room assignments, sports participated, and turnout stats.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportStudentsCSV(filteredStudents)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer active:scale-95"
              title="Download Students Roster CSV"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Export Roster (CSV)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Print Students Roster"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Print</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Player</span>
          </button>
        </div>
      </div>

      {/* Filter, Search Bar and View Mode Switcher */}
      <div className="flex flex-col gap-2.5 bg-white dark:bg-slate-900/90 p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by player name, roll no, room no, hostel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          {/* View Mode Toggle (Table / Grid) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-end sm:self-auto border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Table View (List format)"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            value={residencyFilter}
            onChange={(e) => setResidencyFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
          >
            <option value="all">All Residency (Hosteller & Scholar)</option>
            <option value="hosteller">Hostellers Only</option>
            <option value="day scholar">Day Scholars Only</option>
          </select>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
          >
            <option value="all">All Genders</option>
            <option value="male">Boys / Male</option>
            <option value="female">Girls / Female</option>
          </select>
        </div>
      </div>

      {/* Students Data Display */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">Loading student directory...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-slate-500 dark:text-slate-400">No students found matching your search.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Default) */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-3">Player Name & Roll No</th>
                  <th className="py-3 px-3">Residency & Accommodation</th>
                  <th className="py-3 px-3">Gender</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Sports Disciplines</th>
                  <th className="py-3 px-3 text-center">Turnout Rate</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredStudents.map((student, idx) => {
                  const stats = student.attendanceStats || { attendancePct: 100, attended: 0, total: 0 };
                  const isHosteller = student.residency === 'Hosteller';

                  return (
                    <tr 
                      key={student.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Row Index */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400 text-xs">
                        {idx + 1}
                      </td>

                      {/* Player Avatar & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0">
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                              {student.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                {student.rollNumber}
                              </span>
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                {student.college || 'MPGI'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Residency & Hostel info */}
                      <td className="py-3 px-3">
                        {isHosteller ? (
                          <div>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 mb-1">
                              Hosteller
                            </span>
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                              {student.hostelName} • <strong className="text-slate-900 dark:text-slate-200">Room {student.roomNumber}</strong>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 mb-1">
                              Day Scholar
                            </span>
                            <div className="text-[11px] text-slate-500">Local resident</div>
                          </div>
                        )}
                      </td>

                      {/* Gender */}
                      <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                        {student.gender === 'Female' ? '♀ Female' : '♂ Male'}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {student.phone ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Phone className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            <a 
                              href={`https://wa.me/91${student.phone.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-slate-700 dark:text-slate-300 hover:text-emerald-600 font-mono text-xs hover:underline"
                            >
                              {student.phone}
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">N/A</span>
                        )}
                      </td>

                      {/* Sports Disciplines */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                          {student.sports?.map(sp => (
                            <span key={sp} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {sp}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Turnout Rate */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                            {stats.attendancePct}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {stats.attended}/{stats.total} sessions
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectStudentHistory(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-900/60 transition-colors cursor-pointer"
                            title="Drill-Down Attendance & Gear History"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Drill-Down</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingStudent(student)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Student from Roster"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const stats = student.attendanceStats || { attendancePct: 100, attended: 0, total: 0 };
            const isHosteller = student.residency === 'Hosteller';

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3.5 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all"
              >
                
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 border border-white/20">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                        {student.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{student.rollNumber}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                          {student.college || 'MPGI'}
                        </span>
                        <span>• {student.gender === 'Female' ? '♀' : '♂'}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isHosteller 
                      ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25' 
                      : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25'
                  }`}>
                    {student.residency}
                  </span>
                </div>

                {/* Residency & Hostel info */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl flex flex-col gap-1 text-xs">
                  {isHosteller ? (
                    <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-semibold">
                      <Building className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{student.hostelName} • <strong>Room {student.roomNumber}</strong></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 font-semibold">
                      <Home className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Day Scholar (Local resident)</span>
                    </div>
                  )}

                  {student.phone && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Phone className="w-3 h-3 text-emerald-500" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                </div>

                {/* Sports Participated Pills */}
                <div className="flex flex-wrap items-center gap-1">
                  {student.sports?.map(sp => (
                    <span key={sp} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {sp}
                    </span>
                  ))}
                </div>

                {/* Footer: Attendance summary & history button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.attendancePct}%
                    </span>
                    <span className="text-slate-400 text-[11px]">turnout ({stats.attended}/{stats.total} sessions)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectStudentHistory(student)}
                      className="flex items-center gap-1 text-blue-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Drill-Down Log</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingStudent(student)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Student from Roster"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* REGISTER NEW STUDENT MODAL - Mobile Responsive Bottom Sheet & Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <form 
            onSubmit={handleAddStudentSubmit}
            className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
          >
            {/* Sticky Modal Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Register Sports Student
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Add athlete to hostel roster and discipline list
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto p-5 space-y-4 flex-1 overscroll-contain">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Roll / Student ID *</label>
                  <input
                    type="text"
                    placeholder="e.g. 24MPGI055"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                    className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">College / Inst. *</label>
                  <input
                    type="text"
                    placeholder="e.g. MPGI"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    required
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Residency</label>
                  <select
                    value={residency}
                    onChange={(e) => setResidency(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="Hosteller">Hosteller</option>
                    <option value="Day Scholar">Day Scholar</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="Male">Male / Boy</option>
                    <option value="Female">Female / Girl</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {residency === 'Hosteller' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-500/5 p-3 rounded-2xl border border-purple-500/20">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-purple-700 dark:text-purple-300">Hostel Name / Block *</label>
                    <input
                      type="text"
                      placeholder="e.g. Tagore Hostel, Block A"
                      value={hostelName}
                      onChange={(e) => setHostelName(e.target.value)}
                      required={residency === 'Hosteller'}
                      className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-600 text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-purple-700 dark:text-purple-300">Room Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. B-205, Room 12"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      required={residency === 'Hosteller'}
                      className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-600 text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Phone Contact (for Gear/WhatsApp)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              {/* Sports Selection Checkboxes (2-column on mobile for easy thumb tapping) */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Sports Participated (Tap to toggle)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sportsOptions.map(sp => {
                    const isChecked = selectedSports.includes(sp);
                    return (
                      <button
                        type="button"
                        key={sp}
                        onClick={() => handleToggleSport(sp)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between cursor-pointer transition-all active:scale-95 ${
                          isChecked 
                            ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{sp}</span>
                        {isChecked && <span className="font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Action Footer (ALWAYS VISIBLE ON ANY MOBILE SCREEN) */}
            <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 z-10 shadow-lg">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-50 transition-all active:scale-95 text-center"
              >
                {adding ? 'Registering...' : '✓ Register Player'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Modal: Confirm Delete Student - Mobile Optimized */}
      {deletingStudent && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Delete Student from Roster?
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  This action will remove the student permanently.
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Student Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{deletingStudent.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Roll Number:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{deletingStudent.rollNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Residency / Room:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {deletingStudent.residency} {deletingStudent.roomNumber ? `(Room ${deletingStudent.roomNumber})` : ''}
                </span>
              </div>
            </div>

            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
              ⚠️ <strong>Note:</strong> If this student currently holds active unreturned sports equipment, the system will block deletion until all gear is checked back in.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/25 cursor-pointer disabled:opacity-50 text-center"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
