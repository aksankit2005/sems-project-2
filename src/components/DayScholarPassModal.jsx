import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Printer, 
  CheckCircle, 
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { api } from '../utils/api';

export default function DayScholarPassModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  
  // Guard Details
  const [guardPhone, setGuardPhone] = useState('9876543210');
  const [guardName, setGuardName] = useState('Main Campus Security Gate (Gate 1)');
  const [passDate, setPassDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [authorizedBy, setAuthorizedBy] = useState('APEX Sports Officer / Coach');
  const [passNotes, setPassNotes] = useState('Entry allowed for official evening sports practice session.');

  // Current Day Scholar Input Form
  const [studentName, setStudentName] = useState('');
  const [sport, setSport] = useState('Cricket');
  const [gender, setGender] = useState('Male');
  const [course, setCourse] = useState('B.Tech CSE 2nd Yr');
  const [entryTime, setEntryTime] = useState('05:00 PM');
  const [exitTime, setExitTime] = useState('07:30 PM');

  // List of Day Scholars in Current Pass
  const [pendingList, setPendingList] = useState([]);
  const [dayScholarRoster, setDayScholarRoster] = useState([]);
  
  // History of Passes
  const [passHistory, setPassHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  const sportsList = [
    'Cricket', 'Gully Cricket', 'Football', 'Basketball', 'Volleyball',
    'Table Tennis', 'Badminton', 'Chess', 'Kabaddi', 'Kho-Kho', 'Tug of War', 'Athletics'
  ];

  const coursePresets = [
    'B.Tech CSE 1st Yr', 'B.Tech CSE 2nd Yr', 'B.Tech CSE 3rd Yr', 'B.Tech CSE 4th Yr',
    'B.Tech ME', 'B.Tech Civil', 'BCA 1st Yr', 'BCA 2nd Yr', 'BCA 3rd Yr',
    'BBA', 'MBA 1st Yr', 'MBA 2nd Yr', 'B.Pharm', 'D.Pharm', 'MCA'
  ];

  // Fetch registered Day Scholars and Pass History on open
  useEffect(() => {
    if (isOpen) {
      api.getStudents({ residency: 'Day Scholar' }).then(res => {
        const dsList = res.filter(s => s.residency === 'Day Scholar');
        setDayScholarRoster(dsList);
      });
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await api.getGatePasses();
      setPassHistory(history);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Add single student to current pass list
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert('Please enter student name');
      return;
    }

    const newItem = {
      id: `stu-${Date.now()}`,
      name: studentName.trim(),
      sport,
      gender,
      course: course.trim() || 'Degree Course',
      entryTime,
      exitTime
    };

    setPendingList(prev => [...prev, newItem]);
    setStudentName('');
  };

  // Autofill from day scholar roster
  const handleSelectFromRoster = (studentId) => {
    if (!studentId) return;
    const match = dayScholarRoster.find(s => s.id === studentId);
    if (match) {
      setStudentName(match.name);
      if (match.gender) setGender(match.gender);
      if (match.sports && match.sports.length > 0) setSport(match.sports[0]);
    }
  };

  // Remove student from pending list
  const handleRemoveStudent = (id) => {
    setPendingList(prev => prev.filter(s => s.id !== id));
  };

  // Generate WhatsApp Message text for Guard
  const generateGuardWhatsAppText = (passObj) => {
    const list = passObj.students || pendingList;
    const dateFormatted = new Date(passDate).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });

    const studentsFormatted = list.map((s, idx) => 
`*${idx + 1}. ${s.name}* (${s.gender === 'Female' ? 'Female ♀' : 'Male ♂'})
   🎓 *Course:* ${s.course}
   🏅 *Sport:* ${s.sport}
   🕒 *Hours:* ${s.entryTime} - ${s.exitTime}`
    ).join('\n\n');

    return `🛡️ *MPGI APEX SPORTS 2026 - DAY SCHOLAR GATE PASS*
━━━━━━━━━━━━━━━━━━━━━━━
📅 *Date:* ${dateFormatted}
📍 *Security Gate:* ${guardName}
👮 *To Guard on Duty:* Main Security Team

The following *${list.length} Day Scholar(s)* are officially authorized by the APEX Sports Council to enter and remain on campus for sports training:

${studentsFormatted}

━━━━━━━━━━━━━━━━━━━━━━━
✅ *Authorized By:* ${authorizedBy}
📝 *Purpose:* ${passNotes}
📞 *Sports Office Helpdesk:* +91 98765 43210
⚠️ *Note to Guard:* Please inspect official college photo ID cards upon gate entry.`;
  };

  // Send WhatsApp to Guard
  const handleSendToGuard = async () => {
    if (pendingList.length === 0) {
      alert('Please add at least one Day Scholar to the pass before sending');
      return;
    }

    const cleanPhone = (guardPhone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('Please enter a valid 10-digit Security Guard phone number');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        date: passDate,
        guardPhone: cleanPhone,
        guardName,
        gateLocation: guardName,
        authorizedBy,
        notes: passNotes,
        students: pendingList
      };

      const result = await api.createGatePass(payload);
      const createdPass = result?.pass || payload;

      // Construct WhatsApp URL
      const fullNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const msg = generateGuardWhatsAppText(createdPass);
      const waUrl = `https://api.whatsapp.com/send?phone=${fullNumber}&text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');

      setSuccessToast(`Gate Pass for ${pendingList.length} Day Scholar(s) generated & dispatched!`);
      setPendingList([]);
      await loadHistory();
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to dispatch gate pass');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePass = async (id) => {
    if (!confirm('Are you sure you want to cancel and delete this gate pass?')) return;
    try {
      await api.deleteGatePass(id);
      await loadHistory();
    } catch (err) {
      alert('Failed to delete gate pass');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-600/20 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                  Day Scholar Sports Gate Pass
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  Gate Guard Clearance
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Authorize Day Scholars for sports & send clearance roster to Gate Guard on WhatsApp
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs: Build New Pass / Past Passes History */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Create New Gate Pass</span>
            {pendingList.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px]">
                {pendingList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Pass History & Records ({passHistory.length})</span>
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="m-3 p-3 rounded-2xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-between shadow-lg shadow-emerald-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-white text-sm">✕</button>
          </div>
        )}

        {/* TAB 1: CREATE NEW PASS */}
        {activeTab === 'new' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
            
            {/* Guard Configuration Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                Security Gate Guard Information
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Guard Phone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={guardPhone}
                    onChange={(e) => setGuardPhone(e.target.value)}
                    required
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Security Gate Post
                  </label>
                  <select
                    value={guardName}
                    onChange={(e) => setGuardName(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Main Campus Security Gate (Gate 1)">Main Campus Security Gate (Gate 1)</option>
                    <option value="Sports Complex East Gate">Sports Complex East Gate</option>
                    <option value="Hostel Outer Checkpost">Hostel Outer Checkpost</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Pass Validity Date
                  </label>
                  <input
                    type="date"
                    value={passDate}
                    onChange={(e) => setPassDate(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Add Student Input Form */}
            <form onSubmit={handleAddStudent} className="bg-white dark:bg-slate-900 border-2 border-dashed border-blue-500/30 dark:border-blue-500/20 p-3.5 sm:p-4 rounded-2xl flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-500" />
                  Add Day Scholar to Gate Pass
                </span>

                {dayScholarRoster.length > 0 && (
                  <select
                    onChange={(e) => handleSelectFromRoster(e.target.value)}
                    defaultValue=""
                    className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 outline-none cursor-pointer"
                  >
                    <option value="">⚡ Autofill from Registered Day Scholars ({dayScholarRoster.length})</option>
                    {dayScholarRoster.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Student Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Sport / Game</label>
                  <select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {sportsList.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Male">Male ♂</option>
                    <option value="Female">Female ♀</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Course & Year</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech CSE 2nd Yr"
                    list="course-presets"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                  <datalist id="course-presets">
                    {coursePresets.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Entry Time</label>
                  <input
                    type="text"
                    placeholder="05:00 PM"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Exit Time</label>
                  <input
                    type="text"
                    placeholder="07:30 PM"
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add to Pending Clearance List</span>
                </button>
              </div>
            </form>

            {/* List of Students Queued for the Pass */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>Authorized Day Scholars Queue</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                    {pendingList.length} Student(s)
                  </span>
                </span>
                
                {pendingList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPendingList([])}
                    className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {pendingList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center gap-1">
                  <User className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No day scholars added to this gate pass yet
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Use the form above to add students. When ready, click "Send Gate Pass to Guard".
                  </span>
                </div>
              ) : (
                /* TABLE VIEW: DAY SCHOLARS QUEUED (Requested in audio) */
                <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold">
                        <th className="py-3 px-3 text-center">#</th>
                        <th className="py-3 px-4">Student Name (नाम)</th>
                        <th className="py-3 px-3">Gender</th>
                        <th className="py-3 px-3">Course & Year</th>
                        <th className="py-3 px-3">Sport Discipline</th>
                        <th className="py-3 px-3">Permitted Hours</th>
                        <th className="py-3 px-3 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {pendingList.map((stu, idx) => (
                        <tr key={stu.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{stu.name}</td>
                          <td className="py-3 px-3">{stu.gender === 'Female' ? '♀ Female' : '♂ Male'}</td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{stu.course}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-cyan-300 border border-blue-500/20">
                              {stu.sport}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold whitespace-nowrap">
                            🕒 {stu.entryTime} - {stu.exitTime}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveStudent(stu.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Remove Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PASS HISTORY (Table Format - Requested in Audio) */}
        {activeTab === 'history' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-3">
            {loadingHistory ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading past gate passes...</div>
            ) : passHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No previous gate passes found. Create a pass to start your clearance history.
              </div>
            ) : (
              /* TABLE VIEW: PASS HISTORY & AUDIT LOG */
              <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold">
                      <th className="py-3.5 px-3 text-center">#</th>
                      <th className="py-3.5 px-3">Pass ID & Date</th>
                      <th className="py-3.5 px-3">Security Gate Post</th>
                      <th className="py-3.5 px-3">Guard Contact</th>
                      <th className="py-3.5 px-4">Authorized Day Scholars List</th>
                      <th className="py-3.5 px-3 text-center">Total Students</th>
                      <th className="py-3.5 px-3">Authorized By</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {passHistory.map((pass, idx) => (
                      <tr key={pass.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-3 text-center font-mono text-[11px] text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {new Date(pass.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">{pass.id}</div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {pass.gateLocation || 'Main Gate'}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              const msg = generateGuardWhatsAppText(pass);
                              const clean = (pass.guardPhone || '').replace(/\D/g, '');
                              const full = clean.length === 10 ? `91${clean}` : clean;
                              window.open(`https://api.whatsapp.com/send?phone=${full}&text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 dark:text-[#25D366] bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 cursor-pointer"
                            title="Resend WhatsApp to Guard"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>+91 {pass.guardPhone}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 max-w-sm">
                            {pass.students?.map((s, sIdx) => (
                              <div key={sIdx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-slate-100">• {s.name}</span>
                                <span className="text-slate-400">({s.sport} • {s.entryTime}-{s.exitTime})</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                            {pass.students?.length || 0} Students
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-[11px] text-slate-500">
                          {pass.authorizedBy}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePass(pass.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Delete pass"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer / Dispatch Actions */}
        {activeTab === 'new' && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {pendingList.length > 0 ? (
                <span>Ready to dispatch pass for <strong>{pendingList.length} Day Scholar(s)</strong></span>
              ) : (
                <span>Add students to enable WhatsApp dispatch</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleSendToGuard}
                disabled={submitting || pendingList.length === 0}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>{submitting ? 'Generating...' : 'Send Gate Pass to Guard (WhatsApp)'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
