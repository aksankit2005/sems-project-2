import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  Plus, 
  Trash2, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Building2, 
  X,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { api } from '../utils/api';
import { 
  printPermissionSlip, 
  sharePermissionSlipFile, 
  openWardenWhatsApp 
} from '../utils/permissionSlipUtils';

export default function HostelPermissionModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

  // Warden & Hostel Details (Top Section)
  const [wardenPhone, setWardenPhone] = useState('9876543210');
  const [wardenName, setWardenName] = useState('Chief Hostel Warden');
  const [hostelName, setHostelName] = useState('Maharana Pratap Boys Hostel 1');
  const [authorizedBy, setAuthorizedBy] = useState('APEX Sports Officer / Coach');

  // Permission Schedule & Venue Details
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fromTime, setFromTime] = useState('04:30 PM');
  const [toTime, setToTime] = useState('08:00 PM');
  const [venue, setVenue] = useState('Campus Main Sports Complex');
  const [purpose, setPurpose] = useState('Inter-Hostel Cricket Practice Session');
  const [notes, setNotes] = useState('Students must report back to hostel premises strictly before return timing.');

  // Current Player Input Form (Multi-player entries)
  const [playerName, setPlayerName] = useState('');
  const [playerYear, setPlayerYear] = useState('3rd Year');
  const [playerHostel, setPlayerHostel] = useState('Maharana Pratap Boys Hostel 1');
  const [playerRoom, setPlayerRoom] = useState('');
  
  // Dynamic List of Entered Players
  const [pendingPlayers, setPendingPlayers] = useState([]);
  
  // Hosteller student roster for quick auto-fill
  const [hostellerRoster, setHostellerRoster] = useState([]);

  // History State
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const hostelPresets = [
    'Maharana Pratap Boys Hostel 1',
    'Maharana Pratap Boys Hostel 2',
    'APEX Senior Boys Hostel',
    'APEX Girls Hostel Block A',
    'APEX Girls Hostel Block B'
  ];

  const yearPresets = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Diploma 1st Yr',
    'Diploma 2nd Yr',
    'Diploma 3rd Yr',
    'Post Graduate (PG)'
  ];

  const venuePresets = [
    'Campus Main Sports Complex',
    'MPGI Football Ground (Turf 1)',
    'Cricket Stadium Ground',
    'Basketball Indoor Complex',
    'Kabaddi & Combat Arena',
    'Green Park Sports Stadium, Kanpur'
  ];

  const timeSlotPresets = [
    { label: 'Evening Practice (04:30 PM - 07:30 PM)', from: '04:30 PM', to: '07:30 PM' },
    { label: 'Late Evening Match (05:00 PM - 08:30 PM)', from: '05:00 PM', to: '08:30 PM' },
    { label: 'Morning Training (06:00 AM - 08:30 AM)', from: '06:00 AM', to: '08:30 AM' },
    { label: 'Full Day Tournament (08:00 AM - 06:00 PM)', from: '08:00 AM', to: '06:00 PM' }
  ];

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getHostelPermissions();
      setHistoryList(data);
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Fetch hostellers & permission history on open
  useEffect(() => {
    if (isOpen) {
      api.getStudents().then(res => {
        const hList = res.filter(s => s.residency === 'Hosteller');
        setHostellerRoster(hList);
      });
      loadHistory();
    }
  }, [isOpen, loadHistory]);

  // Quick auto-complete when selecting an existing registered hosteller
  const handleSelectHosteller = (student) => {
    setPlayerName(student.name);
    if (student.hostelName) {
      setPlayerHostel(student.hostelName);
      setHostelName(student.hostelName);
    }
    if (student.roomNumber) setPlayerRoom(student.roomNumber);
  };

  // Add 1 player to the current slip roster
  const handleAddPlayer = (e) => {
    if (e) e.preventDefault();
    if (!playerName.trim()) {
      alert('Please enter player name');
      return;
    }

    const newPlayer = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: playerName.trim(),
      year: playerYear,
      hostelName: playerHostel.trim() || hostelName,
      roomNumber: playerRoom.trim() || 'N/A'
    };

    setPendingPlayers(prev => [...prev, newPlayer]);
    
    // Clear player inputs for next entry, keeping hostel and year handy
    setPlayerName('');
    setPlayerRoom('');
  };

  const handleRemovePlayer = (id) => {
    setPendingPlayers(prev => prev.filter(p => p.id !== id));
  };

  // Build payload
  const buildPayload = () => {
    const cleanPhone = (wardenPhone || '').replace(/\D/g, '');
    return {
      wardenName: wardenName.trim() || 'Hostel Warden',
      wardenPhone: cleanPhone,
      hostelName: hostelName.trim() || 'Hostel',
      fromDate,
      toDate: toDate || fromDate,
      fromTime,
      toTime,
      venue: venue.trim() || 'Campus Sports Ground',
      purpose: purpose.trim() || 'Official Sports Training / Match',
      authorizedBy: authorizedBy.trim() || 'APEX Sports Officer / Coach',
      notes: notes.trim(),
      players: pendingPlayers
    };
  };

  // Grant Permission & Send WhatsApp
  const handleGrantAndSendWhatsApp = async () => {
    if (pendingPlayers.length === 0) {
      alert('Please add at least one player to the permission slip');
      return;
    }
    const cleanPhone = (wardenPhone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('Please enter a valid 10-digit Warden phone number for WhatsApp');
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      const res = await api.createHostelPermission(payload);
      const savedPass = res?.permission || payload;

      // Launch WhatsApp directly
      openWardenWhatsApp(savedPass);

      setToastMessage(`Permission pass for ${pendingPlayers.length} player(s) granted & dispatched to Warden!`);
      setPendingPlayers([]);
      await loadHistory();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      alert(err.message || 'Failed to grant permission');
    } finally {
      setSubmitting(false);
    }
  };

  // Print / Save as Official PDF
  const handlePrintSlip = async () => {
    if (pendingPlayers.length === 0) {
      alert('Please add at least one player to the permission slip first');
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      const res = await api.createHostelPermission(payload);
      const savedPass = res?.permission || payload;

      printPermissionSlip(savedPass);

      setToastMessage('Official PDF Permission Slip generated & opened for printing!');
      setPendingPlayers([]);
      await loadHistory();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      alert(err.message || 'Failed to generate PDF pass');
    } finally {
      setSubmitting(false);
    }
  };

  // Share File directly via Native Share
  const handleShareFile = async () => {
    if (pendingPlayers.length === 0) {
      alert('Please add at least one player to the permission slip first');
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      const res = await api.createHostelPermission(payload);
      const savedPass = res?.permission || payload;

      await sharePermissionSlipFile(savedPass);

      setToastMessage('Permission document shared successfully!');
      setPendingPlayers([]);
      await loadHistory();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      alert(err.message || 'Failed to share permission document');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete past pass
  const handleDeletePass = async (id) => {
    if (!confirm('Are you sure you want to cancel and delete this permission record?')) return;
    try {
      await api.deleteHostelPermission(id);
      await loadHistory();
    } catch (e) {
      alert('Failed to delete permission record');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[75] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-5 overflow-hidden animate-fade-in">
      <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-amber-500/30 rounded-t-3xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col my-0 sm:my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-amber-500/20 flex items-center justify-between bg-slate-50/60 dark:bg-[#0b1329]/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#7156a5] text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                  Hostel Sports Permission Slip
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Warden Dispatch
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Grant hostel outing permissions for tournament practice & notify Warden via WhatsApp & PDF
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

        {/* Sub-Tabs: Build New Pass / Granted Passes History */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-white dark:bg-[#0b1329]">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'border-amber-500 text-amber-500 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Create New Permission ({pendingPlayers.length} in draft)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-500 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Granted Permissions History ({historyList.length})
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
          </div>
        )}

        {/* TAB 1: CREATE NEW PASS */}
        {activeTab === 'new' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Section 1: Warden & Authority (Header Block) */}
            <div className="bg-slate-50 dark:bg-[#121936] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-600 dark:text-amber-400 mb-3 tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>1. Warden & Hostel Details (WhatsApp Recipient)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Warden Phone Number (WhatsApp) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                    <input 
                      type="tel"
                      value={wardenPhone}
                      onChange={e => setWardenPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Warden Name / Designation
                  </label>
                  <input 
                    type="text"
                    value={wardenName}
                    onChange={e => setWardenName(e.target.value)}
                    placeholder="e.g. Dr. Verma / Warden"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Hostel Bhavan / Block
                  </label>
                  <input 
                    type="text"
                    value={hostelName}
                    onChange={e => setHostelName(e.target.value)}
                    placeholder="Hostel Name"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                    list="hostel-presets"
                  />
                  <datalist id="hostel-presets">
                    {hostelPresets.map((h, i) => <option key={i} value={h} />)}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Section 2: Permission Schedule, Timings & Venue */}
            <div className="bg-slate-50 dark:bg-[#121936] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>2. Schedule, Timings & Venue Details</span>
                </div>
                
                {/* Quick time slot pill picker */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Presets:</span>
                  {timeSlotPresets.slice(0, 2).map((tp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFromTime(tp.from);
                        setToTime(tp.to);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                    >
                      {tp.label.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    From Date
                  </label>
                  <input 
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    To Date (Validity)
                  </label>
                  <input 
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    From Time (Out Time)
                  </label>
                  <input 
                    type="text"
                    value={fromTime}
                    onChange={e => setFromTime(e.target.value)}
                    placeholder="04:30 PM"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    To Time (Return Deadline) *
                  </label>
                  <input 
                    type="text"
                    value={toTime}
                    onChange={e => setToTime(e.target.value)}
                    placeholder="08:00 PM"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-amber-600 dark:text-amber-400 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Venue / Destination Ground
                  </label>
                  <input 
                    type="text"
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    placeholder="e.g. Main Cricket Ground / Sports Complex"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                    list="venue-presets"
                  />
                  <datalist id="venue-presets">
                    {venuePresets.map((v, i) => <option key={i} value={v} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Purpose / Event Discipline
                  </label>
                  <input 
                    type="text"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="e.g. Inter-Hostel Tournament Match Practice"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Add Players to Slip (Multi-player dynamic form) */}
            <div className="bg-gradient-to-r from-amber-500/10 via-[#7156a5]/10 to-transparent p-4 sm:p-5 rounded-2xl border border-amber-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                  <User className="w-4 h-4" />
                  <span>3. Add Player to Permission Slip (Entry Form)</span>
                </div>
                
                {/* Quick suggestions from Hosteller directory */}
                {hostellerRoster.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Quick Hostellers:</span>
                    <select
                      onChange={(e) => {
                        const found = hostellerRoster.find(s => s.id === e.target.value);
                        if (found) handleSelectHosteller(found);
                      }}
                      className="px-2 py-1 text-[11px] rounded-lg bg-white dark:bg-[#0b1329] border border-amber-500/30 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">-- Choose Hosteller to autofill --</option>
                      {hostellerRoster.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.hostelName || 'Hostel'} - Room {s.roomNumber || '?'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Player Name *
                  </label>
                  <input 
                    type="text"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPlayer();
                      }
                    }}
                    placeholder="Enter player name"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year / Batch
                  </label>
                  <input 
                    type="text"
                    value={playerYear}
                    onChange={e => setPlayerYear(e.target.value)}
                    placeholder="e.g. 3rd Year"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 outline-none"
                    list="year-presets"
                  />
                  <datalist id="year-presets">
                    {yearPresets.map((y, i) => <option key={i} value={y} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room Number *
                  </label>
                  <input 
                    type="text"
                    value={playerRoom}
                    onChange={e => setPlayerRoom(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPlayer();
                      }
                    }}
                    placeholder="e.g. Room 204"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#070b19] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleAddPlayer}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#7156a5] hover:opacity-95 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Add Player to Pass</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Current Draft Roster (List of entered players) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Players in this Permission Pass
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                    {pendingPlayers.length} Player{pendingPlayers.length !== 1 ? 's' : ''} Added
                  </span>
                </div>

                {pendingPlayers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPendingPlayers([])}
                    className="text-[11px] text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {pendingPlayers.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center flex flex-col items-center justify-center">
                  <User className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    No players added yet. Enter player name, year and room number above to build your team pass.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    You can add 1 player, 2 players, or entire team in a single pass.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-[#121936] text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-12">#</th>
                        <th className="py-2.5 px-4">Player Name</th>
                        <th className="py-2.5 px-3">Year / Batch</th>
                        <th className="py-2.5 px-3">Hostel</th>
                        <th className="py-2.5 px-3">Room No.</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#0b1329]">
                      {pendingPlayers.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                            {p.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            {p.year}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {p.hostelName}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                              {p.roomNumber}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemovePlayer(p.id)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Remove player"
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

        {/* TAB 2: GRANTED PERMISSIONS HISTORY */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loadingHistory ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Loading permission passes history...
              </div>
            ) : historyList.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Permission Passes Yet</p>
                <p className="text-xs text-slate-500 mt-1">Create your first hostel outing pass in the "Create New Permission" tab.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyList.map(pass => (
                  <div 
                    key={pass.id} 
                    className="p-4 rounded-2xl bg-white dark:bg-[#121936] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                          {pass.permissionCode || pass.id}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {pass.hostelName}
                        </span>
                        <span className="text-xs text-slate-400">
                          • {pass.players?.length || 0} Player(s)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">
                          Warden: <strong className="text-slate-700 dark:text-slate-300">{pass.wardenName}</strong> (+91 {pass.wardenPhone})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {pass.fromDate} {pass.toDate && pass.toDate !== pass.fromDate ? `to ${pass.toDate}` : ''} ({pass.fromTime} - {pass.toTime})
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Venue & Event</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {pass.venue} • {pass.purpose}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Authorized By</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {pass.authorizedBy}
                        </span>
                      </div>
                    </div>

                    {/* Players preview pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pass.players?.map((p, pIdx) => (
                        <span 
                          key={pIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-[#070b19] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          <strong>{p.name}</strong> ({p.year} • Rm {p.roomNumber})
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400">
                        Created: {new Date(pass.createdAt).toLocaleDateString('en-IN')}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openWardenWhatsApp(pass)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => printPermissionSlip(pass)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Slip / PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePass(pass.id)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete pass"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions (Only on New Pass Tab) */}
        {activeTab === 'new' && (
          <div className="p-4 border-t border-slate-100 dark:border-amber-500/20 bg-slate-50/70 dark:bg-[#0b1329]/95 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              {pendingPlayers.length > 0 ? (
                <span>Ready to grant permission for <strong>{pendingPlayers.length} Hosteller Player(s)</strong></span>
              ) : (
                <span>Add players above to enable permission generation</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>

              {/* Direct Save-as-PDF / Print */}
              <button
                type="button"
                disabled={submitting || pendingPlayers.length === 0}
                onClick={handlePrintSlip}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                title="Print official letterhead pass or save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-amber-500" />
                <span>Save / Print PDF</span>
              </button>

              {/* Mobile Native Share Document */}
              <button
                type="button"
                disabled={submitting || pendingPlayers.length === 0}
                onClick={handleShareFile}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                title="Share document directly via phone share sheet"
              >
                <Share2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Share File</span>
              </button>

              {/* Primary: Grant & Send WhatsApp */}
              <button
                type="button"
                disabled={submitting || pendingPlayers.length === 0}
                onClick={handleGrantAndSendWhatsApp}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:brightness-105 active:scale-95 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-slate-950" />
                <span>Grant & Send to Warden (WhatsApp)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
