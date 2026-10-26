import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  User, 
  Building, 
  Phone, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Send, 
  Check, 
  MessageSquare,
  Sparkles,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { api } from '../utils/api';

export default function IssueGearModal({ isOpen, onClose, onSuccess, onViewInLedger }) {
  const [equipmentList, setEquipmentList] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  // Student Details
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [residency, setResidency] = useState('Hosteller');
  const [hostelName, setHostelName] = useState('Maharana Pratap Boys Hostel');
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');

  // Multi-item equipment list (not just a single dropdown)
  const [items, setItems] = useState([
    { name: '', quantity: 1, equipmentId: null }
  ]);

  // Duration & Return Options
  const [durationOption, setDurationOption] = useState('flexible'); // 'flexible', '2h', '4h', 'evening', '1day', 'custom'
  const [customReturnDate, setCustomReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  // Handover Verification Photo
  const [handoverPhoto, setHandoverPhoto] = useState(null);
  const [photoCompressing, setPhotoCompressing] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // WhatsApp Notification Settings
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [issuedSuccessLoan, setIssuedSuccessLoan] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setIssuedSuccessLoan(null);
      setHandoverPhoto(null);
      api.getEquipment().then(eq => {
        setEquipmentList(eq);
        if (eq.length > 0) {
          setItems([{ name: eq[0].name, quantity: 1, equipmentId: eq[0].id }]);
        }
      });
      api.getStudents().then(stu => setStudents(stu));
    }
  }, [isOpen]);

  // Image compression utility
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressed);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoCompressing(true);
    try {
      const compressed = await compressImage(file);
      setHandoverPhoto(compressed);
    } catch (err) {
      console.error('Image processing error', err);
      alert('Could not process photo. Please choose another image.');
    } finally {
      setPhotoCompressing(false);
      e.target.value = '';
    }
  };

  // Autofill from student selection
  const handleStudentSelect = (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    if (!sId) return;

    const found = students.find(s => s.id === sId);
    if (found) {
      setStudentName(found.name);
      setRollNumber(found.rollNumber);
      setResidency(found.residency);
      setHostelName(found.hostelName || 'Maharana Pratap Boys Hostel');
      setRoomNumber(found.roomNumber || '');
      setPhone(found.phone || '');
    }
  };

  // Add another item row (Add-on)
  const handleAddItemRow = () => {
    setItems(prev => [...prev, { name: '', quantity: 1, equipmentId: null }]);
  };

  // Remove an item row
  const handleRemoveItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update item details in row
  const handleUpdateItem = (index, field, value) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };

      // If user typed or picked a name, match with catalog if possible
      if (field === 'name') {
        const matched = equipmentList.find(e => e.name.toLowerCase() === value.toLowerCase().trim());
        if (matched) {
          copy[index].equipmentId = matched.id;
        } else {
          copy[index].equipmentId = null;
        }
      }
      return copy;
    });
  };

  // Generate WhatsApp Message text
  const generateWhatsAppMessage = (loanData) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const itemsFormatted = (loanData.items || items)
      .filter(i => i.name.trim())
      .map(i => `  • *${i.quantity}x* ${i.name}`)
      .join('\n');

    let returnDeadlineStr = 'Open / Flexible (जब मन हो जब रिटर्न करे)';
    if (durationOption !== 'flexible') {
      returnDeadlineStr = loanData.expectedReturn 
        ? new Date(loanData.expectedReturn).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        : 'As scheduled';
    }

    const photoVerifiedNote = (loanData.handoverPhoto || handoverPhoto) 
      ? '\n📸 *Handover Photo:* Verified & logged on Sports Desk' 
      : '';

    const message = 
`🏆 *APEX SPORTS FEST 2026 - GEAR ISSUE RECEIPT*
━━━━━━━━━━━━━━━━━━━━━━━
👤 *Student:* ${studentName} (${rollNumber || 'MPGI-STU'})
🏢 *Residency:* ${residency} ${residency === 'Hosteller' ? `\n🏠 *Hostel & Room:* ${hostelName} | Room ${roomNumber}` : ''}
📞 *Phone:* ${cleanPhone}

📦 *ISSUED SPORTS EQUIPMENT:*
${itemsFormatted}

🕒 *Issued Date:* ${new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}, ${new Date().toLocaleTimeString('en-IN', { timeStyle: 'short' })}
⏳ *Return Due:* ${returnDeadlineStr}${photoVerifiedNote}
━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Important Note:* Please return all sports gear intact to the Sports Store Room after use. Have a great match!
_APEX Sports Council / Hostel Sports Desk_`;

    return { cleanPhone, message };
  };

  // Dispatch WhatsApp Web / App
  const openWhatsApp = (phoneNum, messageText) => {
    const rawNumber = phoneNum.replace(/\D/g, '');
    const fullNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
    const url = `https://api.whatsapp.com/send?phone=${fullNumber}&text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentName.trim()) {
      setErrorMsg('Student name is required');
      return;
    }

    const validItems = items.filter(it => it.name && it.name.trim() !== '');
    if (validItems.length === 0) {
      setErrorMsg('Please specify at least one equipment item to issue');
      return;
    }

    if (residency === 'Hosteller' && !roomNumber.trim()) {
      setErrorMsg('Room number is required for hostellers');
      return;
    }

    setSubmitting(true);
    try {
      // Calculate return deadline based on option
      let expectedReturnDate = 'Open / Flexible';
      let isFlexible = durationOption === 'flexible';

      if (durationOption === '2h') {
        expectedReturnDate = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
      } else if (durationOption === '4h') {
        expectedReturnDate = new Date(Date.now() + 4 * 3600 * 1000).toISOString();
      } else if (durationOption === 'evening') {
        const evening = new Date();
        evening.setHours(20, 0, 0, 0);
        if (evening.getTime() < Date.now()) evening.setDate(evening.getDate() + 1);
        expectedReturnDate = evening.toISOString();
      } else if (durationOption === '1day') {
        expectedReturnDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      } else if (durationOption === 'custom' && customReturnDate) {
        expectedReturnDate = new Date(customReturnDate).toISOString();
      }

      const payload = {
        items: validItems,
        studentName,
        rollNumber: rollNumber || `TEMP-${Date.now().toString().slice(-4)}`,
        roomNumber: residency === 'Day Scholar' ? 'N/A' : roomNumber,
        hostelName: residency === 'Day Scholar' ? 'Day Scholar' : hostelName,
        phone,
        residency,
        expectedReturn: expectedReturnDate,
        isFlexibleReturn: isFlexible,
        handoverPhoto: handoverPhoto || null,
        notes
      };

      const result = await api.issueEquipment(payload);
      const createdLoan = result?.loan || payload;

      // Handle WhatsApp Dispatch
      if (sendWhatsApp && phone && phone.trim().length >= 10) {
        const { cleanPhone, message } = generateWhatsAppMessage(createdLoan);
        openWhatsApp(cleanPhone, message);
      }

      setIssuedSuccessLoan(createdLoan);
      if (onSuccess) onSuccess(createdLoan);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to issue equipment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Issue Sports Gear</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  Multi-Item & WhatsApp
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Itemized list with add-ons, flexible durations, and automated WhatsApp receipts
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-lg cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Success Banner if Issued */}
        {issuedSuccessLoan ? (
          <div className="overflow-y-auto p-5 flex flex-col gap-3.5 text-center items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Equipment Successfully Issued!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Issued to <strong>{issuedSuccessLoan.studentName}</strong> ({issuedSuccessLoan.equipmentName})
              </p>
            </div>

            {phone && (
              <button
                type="button"
                onClick={() => {
                  const { cleanPhone, message } = generateWhatsAppMessage(issuedSuccessLoan);
                  openWhatsApp(cleanPhone, message);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] shadow-md shadow-emerald-600/30 cursor-pointer transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Resend / Open WhatsApp Receipt</span>
              </button>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onViewInLedger) onViewInLedger(issuedSuccessLoan);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 cursor-pointer transition-all active:scale-95"
              >
                <span>👀 View in Equipment Table →</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
              >
                Done & Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1 overscroll-contain">
            
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SECTION 1: BORROWER PROFILE */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  Borrower Details
                </span>

                {/* Quick Autofill Selector */}
                {students.length > 0 && (
                  <select
                    value={selectedStudentId}
                    onChange={handleStudentSelect}
                    className="w-full sm:w-auto text-[11px] font-semibold py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none sm:max-w-[240px] truncate"
                  >
                    <option value="">⚡ Quick Autofill Registered Student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Name & Roll No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aman Verma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Roll / Student ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 23MPGI042"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Residency & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Residency Type
                  </label>
                  <select
                    value={residency}
                    onChange={(e) => setResidency(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="Hosteller">Hosteller (Living in Campus Hostel)</option>
                    <option value="Day Scholar">Day Scholar (Local resident)</option>
                  </select>
                </div>

                {/* WhatsApp Phone Input */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>WhatsApp Number (for Receipt)</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">📲 Auto Receipt</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-11 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Hosteller Room Number & Hostel Block */}
              {residency === 'Hosteller' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-purple-500/5 p-3 rounded-xl border border-purple-500/20">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      Hostel Block / Bhavan *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tagore Hostel, Block A, Maharana..."
                      value={hostelName}
                      onChange={(e) => setHostelName(e.target.value)}
                      required={residency === 'Hosteller'}
                      className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-600 text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B-204"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      required={residency === 'Hosteller'}
                      className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-600 text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: MULTI-ITEM EQUIPMENT LIST (Not a dropdown, text input with add-ons) */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-500" />
                    Equipment Items to Issue (Multi-Item List)
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Type to search or write custom items. Click "+ Add Another Item" for multi-gear issuance.
                  </p>
                </div>

                <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">
                  {items.length} Item{items.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Datalist for fast autocomplete suggestions */}
              <datalist id="inventory-suggestions">
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.name}>
                    {eq.name} ({eq.availableQuantity} in stock)
                  </option>
                ))}
              </datalist>

              {/* Items List Rows */}
              <div className="flex flex-col gap-2.5">
                {items.map((item, idx) => {
                  const matchedCatalog = equipmentList.find(e => e.name.toLowerCase() === item.name.toLowerCase().trim());

                  return (
                    <div 
                      key={idx} 
                      className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm"
                    >
                      {/* Item Name Input (Writeable + Sugggestions) */}
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Item #{idx + 1}</span>
                          {matchedCatalog ? (
                            <span className="text-[10px] font-bold text-emerald-500">
                              🟢 {matchedCatalog.availableQuantity} in store
                            </span>
                          ) : item.name.trim() ? (
                            <span className="text-[10px] font-semibold text-amber-500">
                              📝 Custom item
                            </span>
                          ) : null}
                        </div>
                        <input
                          type="text"
                          list="inventory-suggestions"
                          placeholder="Type or select equipment (e.g. Cricket Bat, Football, Chess)..."
                          value={item.name}
                          onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                          required
                          className="w-full px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-medium"
                        />
                      </div>

                      {/* Quantity Stepper & Remove */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-4">
                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(idx, 'quantity', Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-xs text-slate-800 dark:text-slate-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(idx, 'quantity', item.quantity + 1)}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Add-on button */}
              <button
                type="button"
                onClick={handleAddItemRow}
                className="w-full py-2.5 rounded-xl text-xs font-bold border-2 border-dashed border-blue-400/40 dark:border-blue-500/30 hover:border-blue-500 text-blue-600 dark:text-cyan-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another Equipment Item (Add-On)</span>
              </button>
            </div>

            {/* SECTION 3: RETURN DURATION (Includes Flexible / जब मन हो जब रिटर्न करे) */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                Return Duration & Deadline
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                
                {/* Option: Flexible / Open (Requested in Audio) */}
                <button
                  type="button"
                  onClick={() => setDurationOption('flexible')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-left flex flex-col transition-all cursor-pointer ${
                    durationOption === 'flexible'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102 font-extrabold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Open / Flexible
                  </span>
                  <span className={`text-[10px] mt-0.5 ${durationOption === 'flexible' ? 'text-blue-100' : 'text-slate-400'}`}>
                    जब मन हो जब रिटर्न करे
                  </span>
                </button>

                {/* Option: 2 Hours */}
                <button
                  type="button"
                  onClick={() => setDurationOption('2h')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-left flex flex-col transition-all cursor-pointer ${
                    durationOption === '2h'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102 font-extrabold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>2 Hours</span>
                  <span className={`text-[10px] mt-0.5 ${durationOption === '2h' ? 'text-blue-100' : 'text-slate-400'}`}>
                    Short Practice
                  </span>
                </button>

                {/* Option: Same Evening */}
                <button
                  type="button"
                  onClick={() => setDurationOption('evening')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-left flex flex-col transition-all cursor-pointer ${
                    durationOption === 'evening'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102 font-extrabold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Same Evening</span>
                  <span className={`text-[10px] mt-0.5 ${durationOption === 'evening' ? 'text-blue-100' : 'text-slate-400'}`}>
                    By 8:00 PM today
                  </span>
                </button>

                {/* Option: 1 Day */}
                <button
                  type="button"
                  onClick={() => setDurationOption('1day')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-left flex flex-col transition-all cursor-pointer ${
                    durationOption === '1day'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102 font-extrabold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>1 Full Day</span>
                  <span className={`text-[10px] mt-0.5 ${durationOption === '1day' ? 'text-blue-100' : 'text-slate-400'}`}>
                    Tomorrow Evening
                  </span>
                </button>

                {/* Option: 4 Hours */}
                <button
                  type="button"
                  onClick={() => setDurationOption('4h')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-left flex flex-col transition-all cursor-pointer ${
                    durationOption === '4h'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102 font-extrabold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>4 Hours</span>
                  <span className={`text-[10px] mt-0.5 ${durationOption === '4h' ? 'text-blue-100' : 'text-slate-400'}`}>
                    Tournament Half
                  </span>
                </button>

                {/* Option: Custom Date/Time */}
                <button
                  type="button"
                  onClick={() => setDurationOption('custom')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-left flex flex-col transition-all cursor-pointer ${
                    durationOption === 'custom'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102 font-extrabold'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Custom Date/Time</span>
                  <span className={`text-[10px] mt-0.5 ${durationOption === 'custom' ? 'text-blue-100' : 'text-slate-400'}`}>
                    Pick exact schedule
                  </span>
                </button>

              </div>

              {durationOption === 'custom' && (
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    value={customReturnDate}
                    onChange={(e) => setCustomReturnDate(e.target.value)}
                    required={durationOption === 'custom'}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              )}
            </div>

            {/* SECTION 4: 📸 HANDOVER PHOTO (CLICK OR UPLOAD) */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-500" />
                  Handover Verification Photo
                </span>
                {handoverPhoto && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <Check className="w-3 h-3" /> Photo Attached
                  </span>
                )}
              </div>

              {/* Hidden file inputs: one with capture for direct camera, one for gallery */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoFileChange}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoFileChange}
              />

              {!handoverPhoto ? (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={photoCompressing}
                      onClick={() => cameraInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{photoCompressing ? 'Processing...' : 'Click Photo (Camera)'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={photoCompressing}
                      onClick={() => galleryInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-slate-500" />
                      <span>Upload from Device</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Take or upload a photo of the student receiving the gear. Admin can inspect this photo anytime, and a handover verification stamp will be attached to the receipt.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <img
                    src={handoverPhoto}
                    alt="Handover Preview"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                  />
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Handover Photo Logged
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Ready to attach to loan ledger & WhatsApp receipt
                    </span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Retake
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <button
                        type="button"
                        onClick={() => setHandoverPhoto(null)}
                        className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5: WHATSAPP AUTO NOTIFICATION TOGGLE */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center font-bold shadow-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    WhatsApp Issue Receipt
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sends full gear receipt with room number & return policy to student's phone
                  </span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
              </label>
            </div>

            </div>

            {/* Sticky Action Footer (ALWAYS VISIBLE ON PHONE SCREENS) */}
            <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 z-10 shadow-lg flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98 text-center"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Issuing...' : 'Confirm & Issue Gear'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
